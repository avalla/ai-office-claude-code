# Changelog

## 1.2.1 — 2026-03-18

### Added

**`/office:milestone create` — task generation:**
- New optional argument `tasks:yes|no|ask` (default: `ask`)
- After creating the milestone file, the system reasons about the milestone name plus any related PRD/ADR context to suggest 4–12 tasks covering the full pipeline (backend, API, UI, tests, security, docs)
- Each suggestion includes title, assignee (agent-mapped by task type), priority, and estimate
- In `ask` mode with `advance_mode: manual`: presents a table and asks `all | select <numbers> | edit | none`
- In `ask` mode with `advance_mode: auto`, or with `tasks:yes`: creates all tasks immediately
- The milestone file's `## Definition of Done` is auto-populated from the suggested task titles
- Task numbers are auto-assigned sequentially within the milestone

**New commands (3):**
- `/office:run-tests <slug>` — runs `test_cmd` from `project.config.md`, parses runner output (vitest, jest, pytest, go test), appends `## Test Results` with per-suite breakdown and coverage % to `<slug>-status.md`; warns if coverage is below `coverage_min`
- `/office:validate-secrets [path]` — scans the codebase for hardcoded secrets using pattern matching (passwords, API keys, tokens, private keys, AWS IDs, GitHub tokens); allowlists env-var placeholders and test fixtures; shows redacted snippets and remediation advice
- `/office:role <agent-name>` — displays an agent's `personality.md` enriched with stage-specific focus guidance; warns if viewing a non-active agent's role for the current pipeline state

**Base rules (`CLAUDE.md`):**
- `skeleton/.claude/CLAUDE.md` — always-on quality rules installed at `.claude/CLAUDE.md` in every project; ported and adapted from Windsurf `base-*` + `global.md` + `task-management.md` rule files; covers reasoning & scope control, code quality, TypeScript strict rules, security, git conventions, AI Office workflow, task state transitions, and loop guards

**Opt-in addons (`skeleton/.ai-office/addons/`):**
- `typescript-naming.md` — file naming, identifier casing, boolean/async function prefixes
- `supabase.md` — RLS policies, migrations, Edge Functions, pgTAP patterns
- `bun-monorepo.md` — Bun runtime preferences, workspace protocol, monorepo layout
- `frontend-react.md` — component structure, state management, a11y, performance
- `react-native.md` — Expo conventions, SecureStore, navigation typing
- `mcp-usage.md` — MCP tool preferences and AI Office slash command reference

Addons are activated by adding `@.ai-office/addons/<name>.md` to `.claude/CLAUDE.md`.

### Changed

- `review.md` — **Technical sector**: added TypeScript-specific checks (`any`, unsafe `as` casts, non-null assertions `!`, `@ts-ignore`), SOLID principle checks (S/O/L/I/D each with concrete detection heuristics); **Security sector**: added systematic secret pattern scan (grep for passwords, API keys, tokens, private keys, AWS IDs) with allowlist
- `scaffold.md` — `status` template now includes a `## Loop Guards` table with `qa_iteration`, `review_iteration`, `uat_iteration` counters initialized to 0
- `advance.md` — step 4 now explicitly reads the `## Loop Guards` table, increments the applicable counter, writes it back to the status file, and blocks with `blocked_reason` when the limit is reached (previously the guard logic was described but not given a concrete read/write procedure)
- `doctor.md` — expected command count updated from 18 to 21; output format example updated to reflect v1.2.0
- `install.sh` — copies `skeleton/.claude/CLAUDE.md` to `.claude/CLAUDE.md` (skip if already exists); copies `skeleton/.ai-office/addons/` to `.ai-office/addons/` (skip if already exists)

---

## 1.1.0 — 2026-03-18

### Added
- `setup.sh` — interactive project setup wizard (agency selection, tech stack, thresholds)
- `/office:setup` command — in-editor reconfiguration wizard
- `agencies/` bundle — 5 agency templates ship with the framework (software-studio, lean-startup, game-studio, creative-agency, penetration-test-agency)
- `project.config.md` format — per-project config read by `validate` and `review` commands
- `commands/office/setup.md` — new `/office:setup` slash command

### Changed
- `validate.md` — reads `typecheck_cmd`, `lint_cmd`, `test_cmd`, `coverage_min`, `lighthouse_min` from `project.config.md`; falls back to npm defaults
- `review.md` — reads `design_system` and `ui_framework` for a project-specific UX sector check
- `doctor.md` — added project config and version stamp checks; updated expected command count to 16
- `install.sh` — now hints to run `setup.sh` when `project.config.md` is missing

---

## 1.0.0 — 2026-03-18

Initial release. 15 commands covering the full AI Office pipeline:

- `route` — request routing to pipeline stages
- `status` — get/set pipeline status for a slug
- `advance` — advance to next stage with evidence
- `validate` — quality gate checks per stage
- `scaffold` — create PRD/ADR/plan/review artifacts
- `task-create` — add tasks to the kanban board
- `task-move` — move tasks between columns
- `task-list` — view the board
- `report` — status/investor/tech-debt/audit reports
- `review` — multi-sector document/code review
- `graph` — repository dependency visualization
- `agency` — list/inspect/activate an agency mode
- `script` — run repeatable markdown runbooks
- `doctor` — framework health check
- `_meta` — show installed version and check for updates
