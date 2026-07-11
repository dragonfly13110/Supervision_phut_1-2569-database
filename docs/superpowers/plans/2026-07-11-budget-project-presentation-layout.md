# Budget Project Presentation Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface all project images directly after progress in a three-column presentation grid.

**Architecture:** Reorder existing JSX blocks in `SectionBudgetDetailed` only. Reuse its current gallery, lightbox, image editing controls, and image data; adjust the grid and remove transform hover behavior.

**Tech Stack:** React, TypeScript, existing Vite build.

## Global Constraints

- Keep existing project data and lightbox behavior.
- Three image columns on desktop, two on tablet, one on mobile.
- Place gallery after progress and before problem/solution.
- Do not add dependencies or hover scale/translate animation.

---

### Task 1: Reorder and present the existing gallery

**Files:**
- Modify: `src/components/SectionBudgetDetailed.tsx`

**Interfaces:**
- Consumes: `project.images`, existing `setLightboxImage`, upload/remove handlers.
- Produces: a responsive, three-column evidence gallery preceding problem and solution.

- [ ] **Step 1: Write the failing structural check**

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source = fs.readFileSync('src/components/SectionBudgetDetailed.tsx', 'utf8');
assert.ok(source.indexOf('รูปภาพประกอบ') < source.indexOf('ปัญหา/อุปสรรค'));
assert.ok(source.includes("gridTemplateColumns: 'repeat(3, 1fr)'"));
```

- [ ] **Step 2: Run check to confirm it fails**

Run: `node --test tests/presentation-layout.test.js`

- [ ] **Step 3: Move the existing image-gallery block**

```tsx
{selectedRound === 'round2' && <ProgressBlock />}
<ImageGallery images={project.images} />
<ProblemAndSolution />
```

- [ ] **Step 4: Set the gallery grid and remove transform hover**

```tsx
style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}
```

- [ ] **Step 5: Run check and build**

Run: `node --test tests/presentation-layout.test.js; npm.cmd run build`

- [ ] **Step 6: Commit**

Run: `git add src/components/SectionBudgetDetailed.tsx tests/presentation-layout.test.js; git commit -m "feat: prioritize project evidence images"`
