# Project Text Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make project result and progress text readable on projected slides.

**Architecture:** Change the existing `.feedback-content` rule in the detailed-project component. The same class already renders both read-only result and progress boxes, so one CSS declaration covers the requested display without affecting editors or data.

**Tech Stack:** React, TypeScript, component-scoped CSS.

## Global Constraints

- Change only read-only project feedback text.
- Use `font-weight: 600`.
- Do not add dependencies or alter project data.

---

### Task 1: Strengthen project feedback text

**Files:**
- Modify: `src/components/SectionBudgetDetailed.tsx:1350-1364`

**Interfaces:**
- Consumes: existing `.feedback-content` class used by result and progress display boxes.
- Produces: a `font-weight: 600` CSS declaration for those boxes.

- [ ] **Step 1: Verify the target rule**

Run: `rg -n -A10 '^                \\.feedback-content' src/components/SectionBudgetDetailed.tsx`

Expected: the `.feedback-content` rule contains typography declarations but no `font-weight` declaration.

- [ ] **Step 2: Add the minimal styling change**

Add this line inside `.feedback-content`:

```css
font-weight: 600;
```

- [ ] **Step 3: Verify the change and build**

Run: `rg -n -A10 '^                \\.feedback-content' src/components/SectionBudgetDetailed.tsx; npm run build`

Expected: the rule contains `font-weight: 600;` and the build completes successfully.

- [ ] **Step 4: Commit**

```bash
git add src/components/SectionBudgetDetailed.tsx
git commit -m "style: strengthen project feedback text"
```
