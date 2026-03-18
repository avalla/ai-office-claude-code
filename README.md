# AI Office Framework

A file-based virtual agency system for AI-assisted software development. Provides a structured pipeline (router → PRD → ADR → plan → dev → QA → release) with milestones, a full kanban task board, role-based agent guidance, code quality rules, and loop guards — all as Claude Code slash commands.

## Quick Start

```bash
# Install into a project (defaults to current directory)
./install.sh [project-root]

# Then configure it
./setup.sh [project-root]
```

Then in Claude Code:

```
/office:ai-office         ← interactive wizard (start here)
/office:route add a new user profile editing feature
```

## Requirements

- [Claude Code](https://claude.ai/code) CLI
- Bash (macOS / Linux / WSL)

## Commands

| Command | Description |
|---------|-------------|
| `/office:ai-office` | Interactive wizard — discover commands and execute actions step by step |
| `/office:route <request>` | Classify and route a request to the right pipeline stage |
| `/office:status <slug> [state] [owner]` | Get or update pipeline status for a feature |
| `/office:advance <slug> <evidence>` | Advance to next stage, reassign tasks, increment loop guards |
| `/office:validate <slug> <stage>` | Check quality gates before advancing |
| `/office:scaffold <slug> <stage>` | Create PRD / ADR / plan / status / review artifacts |
| `/office:run-tests <slug>` | Run the project test suite; append results + coverage to status file |
| `/office:validate-secrets [path]` | Scan codebase for hardcoded secrets and credentials |
| `/office:review <path> [sectors:]` | Multi-sector review: technical, security (+ secret scan), business, UX |
| `/office:role <agent-name>` | Display an agent's personality and stage-specific focus |
| `/office:milestone <create\|list\|status\|close\|archive>` | Manage milestones; `create` suggests and optionally generates tasks |
| `/office:task-create <title> [ms:] [priority:] [assignee:]` | Add a task (validates milestone exists) |
| `/office:task-move <task-id> <column> [reason]` | Move a task between columns |
| `/office:task-list [column] [ms:] [assignee:]` | View the kanban board |
| `/office:report <status\|investor\|tech-debt\|audit>` | Generate reports |
| `/office:graph [package] [format:]` | Repo dependency visualization |
| `/office:agency [list\|get <name>\|select <name>]` | Manage active agency mode |
| `/office:script <list\|run\|create\|validate> <name>` | Run markdown runbooks |
| `/office:setup` | Interactive project reconfiguration wizard |
| `/office:doctor` | Framework health check |
| `/office:_meta` | Show installed version, check for updates |

## Directory Structure

After install, your project will have:

```
.claude/
├── CLAUDE.md            ← base quality rules (always active in Claude Code)
└── commands/
    └── office/          ← 21 slash commands
        └── .version     ← installed version stamp

.ai-office/
├── office-config.md     ← agency identity & config
├── project.config.md    ← tech stack, agency, quality thresholds, advance_mode
├── agency.json          ← active agency selection
├── milestones/          ← milestone definitions (M1.md, M2.md, …)
├── tasks/
│   ├── BACKLOG/         ← task files: <MS>_T<NNN>-<slug>-<assignee>.md
│   ├── TODO/
│   ├── WIP/
│   ├── REVIEW/
│   ├── DONE/
│   ├── ARCHIVED/        ← old/superseded tasks
│   └── README.md        ← column counts
├── docs/
│   ├── prd/
│   ├── adr/
│   └── runbooks/        ← <slug>-plan.md, -tasks.md, -status.md, -review.md
├── agents/              ← 21 agent profiles (personality, competencies, skills, …)
├── agencies/            ← agency configurations + templates
├── templates/           ← document templates (prd, adr, qa-checklist, …)
├── addons/              ← opt-in rule addons (supabase, react, bun, …)
├── scripts/             ← custom runbooks
└── memory/
```

## Base Rules (CLAUDE.md)

`install.sh` places a `CLAUDE.md` in `.claude/` — Claude Code loads this automatically on every session. It encodes always-on rules covering:

- **Reasoning & scope control** — think before acting, minimal diffs, no hallucinated APIs
- **Code quality** — SOLID principles, DRY with judgment, pure functions, descriptive names
- **TypeScript** — strict mode, no `any`, no unsafe casts, `instanceof` in catch blocks
- **Security** — no secrets in repo, parameterized queries, least privilege, idempotency keys
- **Git** — Conventional Commits, lint/typecheck before committing
- **AI Office workflow** — always start with `/office:route`, record evidence before advancing
- **Task management** — immediate state transitions, required update formats, count sync
- **Loop guards** — hard limits on QA/review/UAT cycles (enforced by `/office:advance`)

### Opt-in Addons

Project-specific rules live in `.ai-office/addons/`. To activate one, add an `@import` line to `.claude/CLAUDE.md`:

```
@.ai-office/addons/supabase.md
```

| Addon | Contents |
|-------|----------|
| `typescript-naming.md` | File naming, identifier casing, boolean/async function prefixes |
| `supabase.md` | RLS policies, migrations, Edge Functions, pgTAP testing |
| `bun-monorepo.md` | Bun runtime preferences, workspace protocol, monorepo layout |
| `frontend-react.md` | Component structure, state management, a11y, performance |
| `react-native.md` | Expo conventions, SecureStore, navigation typing, performance |
| `mcp-usage.md` | MCP tool preferences and AI Office slash command reference |

## Task File Format

Tasks are named `<MS>_T<NNN>-<slug>-<assignee>.md` (e.g. `M1_T003-fix-upload-timeout-developer.md`).

Frontmatter fields: **ID**, **Milestone**, **Priority**, **Status**, **Assignee**, **Dependencies**, **Created**, **Started**, **Completed**, **Estimate**, and a **Time Log** table with per-agent hours.

`M0` is reserved for unscheduled/misc tasks. All other milestones must be created with `/office:milestone create` before tasks can reference them.

## Milestone Workflow

```bash
# 1. Create a milestone — system suggests tasks based on the name
/office:milestone create M1 "Auth & Onboarding" target:2026-04-01
# → suggests ~8 tasks, asks: all | select | edit | none

# Skip the prompt and create all suggested tasks immediately
/office:milestone create M2 "Billing" target:2026-05-01 tasks:yes

# Create milestone only, no tasks
/office:milestone create M3 "Performance" tasks:no

# 2. Check milestone progress
/office:milestone status M1

# 3. Close and archive when done
/office:milestone close M1
/office:milestone archive M1
```

When `tasks:ask` (default) and `advance_mode: manual`, the system shows a suggestion table and offers four options: `all`, `select <numbers>`, `edit`, or `none`. In `advance_mode: auto` or with `tasks:yes`, tasks are created immediately without prompting.

## Loop Guards

`/office:advance` enforces iteration limits to prevent infinite dev↔QA↔review cycles. Counters are tracked in the `## Loop Guards` table inside each `<slug>-status.md`:

| Transition | Guard | Max |
|------------|-------|-----|
| `qa → dev` | `qa_iteration` | 2 |
| `review → dev` | `review_iteration` | 2 |
| `user_acceptance → dev` | `uat_iteration` | 1 |

When a limit is reached the stage is set to `blocked` and reassigned to the Planner with an explicit unblock criteria note.

## Agencies

Six agency templates ship with the framework:

| Agency | Use case |
|--------|----------|
| `software-studio` | Full-stack web/mobile — complete SDLC with all quality gates |
| `lean-startup` | Rapid MVP — minimal process, maximum speed |
| `game-studio` | Game development — interactive experiences and games |
| `creative-agency` | Media & content — creative production pipeline |
| `media-agency` | Video and movie production — pre-production to delivery |
| `penetration-test-agency` | Security testing — pentests, audits, remediation |

Custom agencies can be created with `./create-agency.sh <name>`.

## Project Configuration

`setup.sh` (or `/office:setup`) writes `.ai-office/project.config.md`:

```yaml
---
agency: software-studio
project_name: my-app
typecheck_cmd: "npm run typecheck"
lint_cmd: "npm run lint"
test_cmd: "npm run test"
test_runner: vitest
ui_framework: react
design_system: "shadcn/ui"
coverage_min: 80
lighthouse_min: 90
advance_mode: manual   # manual | auto
---
```

`advance_mode` controls how `/office:advance` behaves:
- `manual` — pauses and asks for confirmation before each stage transition (default)
- `auto` — validates and advances automatically without prompting

Stack presets available via `--stack=<preset>`:

| Preset | Stack |
|--------|-------|
| `node-react` | npm, vitest, React, shadcn/ui |
| `python-fastapi` | mypy, ruff, pytest |
| `go` | go vet, golangci-lint, go test |
| `mobile-rn` | tsc, eslint, jest, React Native |

## Pipeline

```
router → prd → adr → plan → tasks → dev → qa → review → user_acceptance → release → postmortem
                                     ↘ ux_research → design_ui ──────────────────────────────┘
                                                    ↘ security → dev / qa
```

Each stage transition via `/office:advance` automatically reassigns open tasks to the responsible agent for the incoming stage.

## Updating

```bash
# Check installed version vs available
/office:_meta

# Apply update
./update.sh [project-root]
```

## Versioning

The framework version is in `VERSION`. Installing stamps `.claude/commands/office/.version` in the target project. `/office:_meta` compares the two and reports if an update is available.
