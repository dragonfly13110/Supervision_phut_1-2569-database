# Round 2 Project Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let round 2 administrators add project images by file upload, drag-and-drop, or URL, with a caption below every image.

**Architecture:** The existing `images: { url, caption }[]` field remains the single data model. The browser adds URLs locally; the upload API validates image metadata and commits a file to the configured GitHub repository, returning its public path. Saving the project continues through the existing Google Sheets flow.

**Tech Stack:** React 18, TypeScript, Vite, Vercel Node functions, GitHub Contents API.

## Global Constraints

- Support PNG, JPG, and JPEG file uploads only.
- Use no new dependency.
- Keep uploaded files in `public/project-images/<sanitized project name>/`.
- Accept only `http` or `https` URLs.
- Do not delete uploaded GitHub files when their image entry is removed.

---

### Task 1: GitHub-backed image upload endpoint

**Files:**
- Create: `api/upload-image.ts`
- Test: `api/upload-image.test.ts`

**Interfaces:**
- Consumes: JSON `{ projectName: string; filename: string; fileData: string }` and server variables `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, optional `GITHUB_BRANCH`.
- Produces: JSON `{ success: true; url: string }` or a 4xx/5xx JSON error.

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { validateUpload } from './upload-image.ts';

test('rejects a non-image filename before calling GitHub', () => {
  assert.deepEqual(
    validateUpload({ projectName: 'A', filename: 'note.txt', fileData: 'Zg==' }),
    { error: 'Only PNG, JPG, and JPEG files are allowed' },
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types api/upload-image.test.ts`
Expected: FAIL because `validateUpload` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export const validateUpload = ({ projectName, filename, fileData }: UploadBody) => {
  if (!projectName || !fileData || !/\.(png|jpe?g)$/i.test(filename)) {
    return { error: 'Only PNG, JPG, and JPEG files are allowed' };
  }
  return null;
};
```

Have the default Vercel handler call `validateUpload`, then `PUT` a base64 GitHub Contents API request with message `feat: add project image` and return `/project-images/<encoded project>/<encoded filename>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types api/upload-image.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/upload-image.ts api/upload-image.test.ts
git commit -m "feat: upload project images to GitHub"
```

### Task 2: URL entry beside the existing drag-and-drop area

**Files:**
- Create: `src/utils/imageUrl.ts`
- Modify: `src/components/SectionBudgetDetailed.tsx`
- Test: `src/utils/imageUrl.test.ts`

**Interfaces:**
- Consumes: `images?: { url: string; caption?: string }[]` on the selected project.
- Produces: a new `{ url, caption: '' }` entry only for valid HTTP(S) URLs.

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { isImageUrl } from './imageUrl.ts';

test('accepts an HTTPS image URL', () => {
  assert.equal(isImageUrl('https://example.com/photo.jpg'), true);
});

test('rejects a non-HTTP URL', () => {
  assert.equal(isImageUrl('file:///photo.jpg'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types src/utils/imageUrl.test.ts`
Expected: FAIL because `imageUrl.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `isImageUrl(value: string): boolean` with `new URL(value)` and an `http:`/`https:` protocol check. Add a controlled `URL รูปภาพ` input and `เพิ่มจาก URL` button inside the existing edit-only image section. On click, append `{ url: value, caption: '' }` through `handleChange` only if `isImageUrl` is true; otherwise show a Thai validation message. Leave the existing file picker, drop handler, caption input, and removal control intact.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types src/utils/imageUrl.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/imageUrl.ts src/utils/imageUrl.test.ts src/components/SectionBudgetDetailed.tsx
git commit -m "feat: add project image URLs"
```

### Task 3: Build and manual flow verification

**Files:**
- Modify: `.env.example` only if it exists; otherwise no file change.

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: exits with status 0.

- [ ] **Step 2: Check the user flow locally**

Run: `npm run dev`
Expected: while signed in, click **แก้ไขข้อมูล** for a round 2 project, then verify file selection, drag-and-drop, URL addition, caption editing, save, and reload.

- [ ] **Step 3: Commit any final focused change**

```bash
git add <only files changed by this feature>
git commit -m "fix: verify project image workflow"
```
