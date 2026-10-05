# Frontend conventions (MUST follow)

Three non-negotiable UI rules for this app. Full detail lives in the project
skills `shared-ui-components`, `thin-page-files`, and `micro-components` —
invoke them when doing UI work.

## 1. All UI components come from `src/components/shared`

- Import UI building blocks only via `@/components/shared/...`.
- Never hand-roll an inline `<button>`/`<input>`/table/spinner/modal/etc. when a
  shared component exists, and never import UI from outside `shared`.
- If a needed component is missing, **create it inside `src/components/shared`
  first** (add to the folder's `index.ts` barrel if there is one), then use it.
- Existing: `CustomButton`, `Loader` (root, default exports);
  `@/components/shared/form` (RHFZodForm + all `Form*`/`Plain*` fields);
  `@/components/shared/table` (`DataTable`);
  `@/components/shared/shadcn` (56 shadcn/ui primitives, new-york style on
  Tailwind v4 — Button, Dialog, Card, Select, etc., via the folder barrel).

## 2. `page.tsx` (and route files) stay thin — only call components

- Route files (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`) only
  compose and render components. No detailed JSX, business logic, state,
  data-fetching, or handlers inline — push all of it into components.

## 3. Decompose every component into small sub-components

- This applies to all components, not just `page.tsx`. A feature/screen
  component (e.g. `UsersScreen`) must not inline multiple sections of
  JSX/logic — split each section (header, filters, table, modal, etc.) into
  its own named sub-component, and keep nesting until each piece is small
  and single-purpose.
- Generic, reusable pieces still go in `src/components/shared` (rule 1).
  Feature-specific pieces that aren't generic enough for shared live in the
  feature's own folder, composed from shared components.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
