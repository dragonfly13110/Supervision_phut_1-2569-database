# Round 2 Equipment Card Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make round-two equipment cards show status, problem, and solution like round one.

**Architecture:** Reuse the existing equipment-card markup and bind it to the round-two asset data. Preserve the existing fields (`status`, `statusText`, `problem`, `solution`) and show the problem box only when a problem has content.

**Tech Stack:** React, TypeScript, existing Sheets API.

## Global Constraints

- Change only round-two equipment presentation.
- Keep round-one data and UI unchanged.
- Add no dependencies.

---

### Task 1: Align the round-two card presentation

**Files:**
- Modify: `src/components/SectionEquipment.tsx`

**Interfaces:**
- Consumes: asset `{ status, statusText, problem, solution }` fields.
- Produces: a card that shows the status and, when present, problem and solution.

- [ ] **Step 1: Verify the current round-two card state**

Run: `npm.cmd run build`

- [ ] **Step 2: Add the shared problem and solution display**

```tsx
{!isEditing && item.problem && item.problem !== '-' && (
  <div className="equipment-issue">
    <div><strong>ปัญหา:</strong> {item.problem}</div>
    <div><strong>แนวทางแก้ไข:</strong> {item.solution || '-'}</div>
  </div>
)}
```

- [ ] **Step 3: Verify the production build**

Run: `npm.cmd run build`
Expected: Vite build completes without TypeScript errors.

- [ ] **Step 4: Commit**

Run: `git add src/components/SectionEquipment.tsx; git commit -m "feat: align round two equipment cards"`
