# Project text contrast

## Goal

Make the displayed plan/result and progress text easier to read on projected slides.

## Change

Set `.feedback-content` to `font-weight: 600` in `SectionBudgetDetailed.tsx`. The rule applies only to read-only project feedback boxes; edit fields, headings, layout, and data are unchanged.

## Check

Build the app successfully and confirm the rule is present in the component style block.
