---
name: micro-components
description: >-
  ENFORCE whenever creating or editing ANY React component in this repo
  (feature screens, section components, anything under src/components), not
  just page.tsx. Every component must be decomposed into the smallest
  reasonable sub-components — no large monolithic component holding many
  unrelated chunks of JSX/logic. Works alongside `thin-page-files` (page.tsx
  only calls components) and `shared-ui-components` (reusable building blocks
  live in src/components/shared): this skill governs everything in between —
  the feature-level component tree.
---

# Micro components (decompose aggressively)

A "screen" or "feature" component (e.g. `UsersScreen`, `OrderDetails`,
`SettingsPanel`) must not be one big file that renders everything inline. Break
it down recursively into small, single-purpose sub-components until each piece
does one clear thing.

## Hard rules

1. **One concern per component.** If a component renders more than one
   logical section (a header + a filter bar + a table + a modal), each section
   becomes its own component file, and the parent just composes them.
2. **Extract on sight.** If you're about to write a sizeable inline JSX block,
   a repeated markup pattern, or a chunk of logic tied to a specific bit of
   UI, pull it into its own named component instead of leaving it inline in
   the parent.
3. **Push logic down, not sideways.** Business logic, data-fetching, and
   state for a given piece of UI should live in (or right next to, via a
   hook) the sub-component that uses it — not hoisted into the top-level
   screen component just to avoid making a new file.
4. **Reusable building blocks still go to shared.** If a sub-component you're
   extracting is generic (a button, input, card, table row, etc. — not tied to
   this one feature), it belongs in `src/components/shared` per the
   `shared-ui-components` skill. Feature-specific sub-components (not generic
   enough for shared) live in the feature's own folder, e.g.
   `src/components/users/UsersTableRow.tsx`, and are composed FROM shared
   components.
5. **Keep nesting until pieces are small.** Don't stop at one level — if a
   sub-component is itself doing too much, split it again.

## Good shape

```tsx
// src/components/users/UsersScreen.tsx
export function UsersScreen() {
  return (
    <div>
      <UsersHeader />
      <UsersFilters />
      <UsersTable />
      <CreateUserModal />
    </div>
  );
}
```

Not:

```tsx
// Bad: one component doing header + filters + table + modal inline
export function UsersScreen() {
  return (
    <div>
      <div className="flex justify-between">{/* header markup */}</div>
      <div className="flex gap-2">{/* filter markup, filter state */}</div>
      <table>{/* table markup, sorting logic, pagination */}</table>
      {open && <div className="modal">{/* modal markup, form state */}</div>}
    </div>
  );
}
```

## Before finishing a component edit

- Does this file render more than one logical section inline? → split each
  section into its own component.
- Is there a block of JSX you can name ("this is the header", "this is the
  filter bar")? → that name should be a separate component file.
- Could someone read just the top-level component and understand the whole
  screen from the names of the pieces it renders, without reading their
  internals? If not, decompose further.
