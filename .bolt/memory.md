# Project memory

## Product intent & audience

- Smart Campus room booking system (Practice 12 in a copied/existing project).
- Users can view rooms, their capacity/location/blocked status, and existing bookings on a time axis.
- Likely an educational/practice codebase with incremental exercises across practices.

## Brand personality & voice

- Refer to `.bolt/prompt` for global design instructions (beautiful, production-worthy, non-cookie-cutter).

## Visual design & UX direction

- Built with React + Tailwind CSS; icons from `lucide-react`; no extra UI/theme packages.
- Time UI uses minute-based integers internally (e.g. 540 = 09:00) and label conversion (`labelToMinutes` helper in `App.tsx`).
- Default demo `currentTime` = 08:00 (480 min); default booking interval selectors = 09:00–10:00.

## Decisions, constraints & rationale

- Toolchain: Vite 5.4.8, Vitest 2.1.9, TypeScript (`tsc --noEmit -p tsconfig.app.json`), ESLint.
- Path alias: `@/` → `src/` (no deep relative imports).
- Baseline (all green): 17 tests pass (`src/lib/validation.test.ts`); build OK (1573 modules, ~157 KB JS gzip 50 KB); typecheck OK; lint OK.
- Prior refactor: `labelToMinutes` extraction in `App.tsx` (imported from validation lib, lines 4 & 43–44).
- Sample data model: rooms have `{id, name, building, capacity, blocked}`; bookings have `{id, roomId, start, end, bookedBy}` with start/end in minutes.
  - `r1` = "Newton 101" (Science Block, cap 40, not blocked); bookings `b1` 09:00–10:00 "Prof. Hines", `b2` 13:30–15:00 "Prof. Larsson".

## Open questions & assumptions

- `AGENTS.md` exists and contains project guidance; should be read fresh each turn alongside source files (not chat history).
- Practice numbering implies a sequence of guided exercises; exact next step not yet specified.