# Other Issues by Unit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single “เรื่องอื่น ๆ” textarea with six unit cards containing two fields each.

**Architecture:** Extend `OtherIssue` with an optional `units` array while retaining legacy `content`. Render structured fields when present and create the six fixed units for old records when editing.

**Tech Stack:** React, TypeScript, existing Google Sheets sync API, Node built-in test runner.

## Global Constraints

- Change only Other Issues and its round-two data.
- Keep legacy `content` readable and add no dependencies.
- Six fixed units each have `item1` and `item2`.

---

### Task 1: Add structured unit model and migration

**Files:**
- Modify: `src/components/SectionOther.tsx`
- Create: `src/components/SectionOther.test.ts`

**Interfaces:**
- Produces: `OtherIssue.units?: UnitIssue[]`
- Produces: `createUnits(content: string): UnitIssue[]`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { createUnits } from './SectionOther.tsx';

test('creates six editable unit records', () => {
  const units = createUnits('');
  assert.equal(units.length, 6);
  assert.deepEqual(units[0], { name: 'ฝ่ายบริหารทั่วไป', item1: '', item2: '' });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/components/SectionOther.test.ts`

- [ ] **Step 3: Write minimal implementation**

```ts
export type UnitIssue = { name: string; item1: string; item2: string };
const UNIT_NAMES = ['ฝ่ายบริหารทั่วไป', 'กลุ่มยุทธศาสตร์และสารสนเทศ', 'กลุ่มส่งเสริมและพัฒนาเกษตรกร', 'กลุ่มส่งเสริมและพัฒนาการผลิต', 'กลุ่มอารักขาพืช', 'สำนักงานเกษตรอำเภอ'];
export const createUnits = (_content: string): UnitIssue[] => UNIT_NAMES.map(name => ({ name, item1: '', item2: '' }));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test src/components/SectionOther.test.ts`

- [ ] **Step 5: Commit**

Run: `git add src/components/SectionOther.tsx src/components/SectionOther.test.ts; git commit -m "feat: add structured other issue units"`

### Task 2: Render and persist two fields per unit

**Files:**
- Modify: `src/components/SectionOther.tsx`

**Interfaces:**
- Consumes: `UnitIssue[]` and `createUnits(content)`.
- Produces: editable 6-card layout with two textareas per card.

- [ ] **Step 1: Write the failing test**

```ts
test('updates only the selected unit item', () => {
  const units = createUnits('');
  const updated = units.map((unit, index) => index === 0 ? { ...unit, item1: 'ติดตามงบประมาณ' } : unit);
  assert.equal(updated[0].item1, 'ติดตามงบประมาณ');
  assert.equal(updated[1].item1, '');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/components/SectionOther.test.ts`

- [ ] **Step 3: Write minimal implementation**

```tsx
const units = issue.units || createUnits(issue.content);
{units.map((unit, index) => (
  <div key={unit.name} className="card">
    <h4>{unit.name}</h4>
    <textarea value={unit.item1} onChange={e => updateUnit(issue.id, index, 'item1', e.target.value)} placeholder="ข้อ 1" />
    <textarea value={unit.item2} onChange={e => updateUnit(issue.id, index, 'item2', e.target.value)} placeholder="ข้อ 2" />
  </div>
))}
```

- [ ] **Step 4: Run test and build**

Run: `node --experimental-strip-types --test src/components/SectionOther.test.ts; npm.cmd run build`

- [ ] **Step 5: Commit**

Run: `git add src/components/SectionOther.tsx src/components/SectionOther.test.ts; git commit -m "feat: split other issues into unit fields"`
