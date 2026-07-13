# GitHub-backed saves Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save edits from every data page to GitHub and deploy the rebuilt Worker automatically.

**Architecture:** `updateSheetData` remains the only client save path. The Worker accepts only known data filenames and writes them to GitHub with a server-side token. A GitHub Actions workflow rebuilds and deploys the Worker after each `main` commit.

**Tech Stack:** React, TypeScript, Cloudflare Workers, GitHub Contents API, GitHub Actions, Wrangler.

## Global Constraints

- Keep `GITHUB_TOKEN` only as a Cloudflare Worker secret.
- Allow only the five existing data filenames with optional `.round2` suffix.
- Do not add dependencies.
- Preserve localStorage as the immediate browser copy.

---

### Task 1: Add the Worker save endpoint

**Files:**
- Modify: `worker.ts`
- Modify: `worker.test.ts`

**Interfaces:**
- Consumes: `POST /api/save-data` body `{ filename: string, content: unknown }`
- Produces: `{ success: true }` on GitHub commit, otherwise `{ error: string }`

- [ ] Write tests that an allowed `budgetData.round2.json` sends a GitHub PUT (including an existing SHA), and `../secret.json` receives HTTP 400.
- [ ] Run `node --test worker.test.ts`; expect the allowed-save test to fail because the endpoint is missing.
- [ ] Add a fixed `Set` of ten allowed filenames. For `POST /api/save-data`, validate the body and token, GET `src/data/<filename>`, then PUT base64-encoded `JSON.stringify(content, null, 2)` and the prior SHA when present.
- [ ] Run `node --test worker.test.ts`; expect all tests to pass.
- [ ] Commit with `git add worker.ts worker.test.ts && git commit -m "feat: save data through Worker"`.

### Task 2: Route every save through the endpoint

**Files:**
- Modify: `src/utils/sheetsApi.ts`
- Test: `tests/sheetsApi.test.ts`

**Interfaces:**
- Consumes: `updateSheetData(sheetName, data)` and active `selected_round`
- Produces: `POST /api/save-data` using `getFilename(sheetName, round)`

- [ ] Write a test that selected round 1 and `updateSheetData('budgetData', [{ total: 1 }])` call `fetch` with `{ filename: 'budgetData.json', content: [{ total: 1 }] }`.
- [ ] Run `node --test tests/sheetsApi.test.ts`; expect it to fail before the browser helper is changed.
- [ ] Keep the current localStorage write, then post `{ filename: getFilename(sheetName, round), content: data }` to `/api/save-data`; throw on a non-OK response.
- [ ] Run `node --test tests/sheetsApi.test.ts`; expect it to pass.
- [ ] Commit with `git add src/utils/sheetsApi.ts tests/sheetsApi.test.ts && git commit -m "feat: persist page edits to GitHub"`.

### Task 3: Deploy every GitHub commit automatically

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: pushes to `main`; GitHub secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- Produces: deployed Worker using `dist` assets

- [ ] Create a GitHub Actions workflow: checkout, Node 20, `npm ci`, `npm run build`, then `npx wrangler deploy` with the two Cloudflare secrets in `env`.
- [ ] Run `npm run build`; expect exit code 0.
- [ ] Commit with `git add .github/workflows/deploy.yml && git commit -m "ci: deploy Worker on main updates"`.

### Task 4: Configure and verify production

**Files:** none

**Interfaces:**
- Requires: Cloudflare secret `GITHUB_TOKEN` with GitHub Contents read/write access
- Requires: GitHub repository secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

- [ ] Set the Cloudflare secret with `npx wrangler secret put GITHUB_TOKEN`.
- [ ] Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub repository secrets.
- [ ] Edit and save one deployed text value; verify the matching JSON commit, a successful Actions run, and the changed text after refresh.
