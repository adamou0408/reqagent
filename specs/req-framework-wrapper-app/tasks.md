# Tasks — REQ Framework Wrapper App v0.1

**Plan**: `specs/req-framework-wrapper-app/plan.md`
**Created**: 2026-04-09

---

## Phase 0 — 專案骨架 + Docker

- [ ] **T01** — Init SvelteKit project with `npm create svelte@latest`, adapter-node, TypeScript strict
  - Output: `package.json`, `svelte.config.js`, `tsconfig.json`, `vite.config.ts`
- [ ] **T02** — Install + configure Tailwind CSS + shadcn-svelte (Button, Card, Dialog, Input, Badge)
  - Output: `tailwind.config.js`, `src/lib/components/ui/`
- [ ] **T03** — Install + configure Drizzle ORM + better-sqlite3; create schema (projects w/ orchestrator_snapshot, messages, conflicts tables)
  - Output: `src/lib/server/db/schema.ts`, `src/lib/server/db/index.ts`, `drizzle.config.ts`
- [ ] **T04** — Create Dockerfile: Node 20 base → npm install → Claude Code CLI global install → SvelteKit build → ENTRYPOINT
  - Output: `Dockerfile`, `.dockerignore`
- [ ] **T05** — Create host launcher script: detect Docker → read ANTHROPIC_API_KEY from OS keychain CLI (`security`/`secret-tool`/`cmdkey`) or prompt → store in keychain → `docker run -e`
  - Output: `scripts/launch.sh`
- [ ] **T06** — Verify: `docker build` succeeds, `docker run` starts SvelteKit on port 3000, health endpoint `/api/health` returns 200
  - Output: passing smoke test

---

## Phase 1 — Chat 核心 + Claude Code 整合

- [ ] **T07** — Implement Claude Code Bridge (C11): `child_process.spawn` wrapper with `--output-format json --print`, stdout stream parser, error handling
  - Output: `src/lib/server/claude-bridge.ts`
- [ ] **T08** — Implement SSE endpoint (C8): server-sent events from Claude Code Bridge stream → client
  - Output: `src/routes/api/sse/+server.ts`
- [ ] **T09** — Implement Chat API (C7): POST `/api/chat` accepts user message, creates DB record, forwards to Orchestrator stub
  - Output: `src/routes/api/chat/+server.ts`
- [ ] **T10** — Implement Chat UI (C1): message list (scrollable), input box, SSE listener, auto-scroll, loading indicator
  - Output: `src/routes/(app)/+page.svelte`, `src/lib/components/ChatMessage.svelte`
- [ ] **T11** — Implement Project Sidebar (C2): project list from DB, create new project, switch active project
  - Output: `src/lib/components/Sidebar.svelte`, `src/routes/api/projects/+server.ts`
- [ ] **T12** — Implement Project API (C9): GET/POST/PATCH `/api/projects`, list/create/update project in SQLite
  - Output: `src/routes/api/projects/+server.ts`, `src/routes/api/projects/[id]/+server.ts`

---

## Phase 2 — 14-command Orchestrator + Surfacing

- [ ] **T13** — Implement Orchestrator core (C10): state machine (IDLE→INTAKE→…→DONE), command router, project state transitions
  - Output: `src/lib/server/orchestrator.ts`
- [ ] **T14** — Implement surfacing logic: classify each command per §4.5 policy table; emit SSE events with `type: 'surface' | 'background' | 'progress'`
  - Output: surfacing logic in `orchestrator.ts`, SSE event types
- [ ] **T15** — Wire 🎯 必須-surface commands (intake, resolve-conflict, review, plan, deploy): each triggers corresponding frontend panel/popup
  - Output: routing in orchestrator + frontend panel triggers
- [ ] **T16** — Wire 🟡 結果觸發 commands (research, detect-conflicts, implement, audit): background execution + conditional surface on threshold
  - Output: background runner + threshold checks in orchestrator
- [ ] **T17** — Wire ⚫ 完全背景 + 🔀 escape hatch commands (translate, feedback, autonomy, onboard, iterate): silent execution + iterate NLU trigger
  - Output: background runner + iterate intent detection

---

## Phase 3 — Review/Conflict 面板 + Scaffolding Sandbox

- [ ] **T18** — Implement Review Panel (C3): HARD checkpoint UI for `/req-review` — shows spec compliance checklist, approve/reject/request-changes buttons
  - Output: `src/lib/components/ReviewPanel.svelte`
- [ ] **T19** — Implement Conflict Panel (C4): HARD checkpoint UI for `/req-resolve-conflict` — shows conflict description, resolution options, confirm button
  - Output: `src/lib/components/ConflictPanel.svelte`
- [ ] **T20** — Implement Deploy Panel (C5): HARD checkpoint UI for `/req-deploy` — preview link, publish button, rollback option
  - Output: `src/lib/components/DeployPanel.svelte`
- [ ] **T21** — Implement Plan Popup (C6): HARD checkpoint UI for `/req-plan` ExitPlanMode — plain-language summary of plan, approve/reject buttons
  - Output: `src/lib/components/PlanPopup.svelte`
- [ ] **T22** — Implement Scaffolding Sandbox (C12): workspace isolation per project, `npm install --ignore-scripts`, `npm audit --audit-level=high` gate, allowed-commands whitelist
  - Output: `src/lib/server/sandbox.ts`
- [ ] **T22a** — Implement Rollback Panel (C15): 3-strike failure → white-language panel with retry/simplify/pause options
  - Output: `src/lib/components/RollbackPanel.svelte`
- [ ] **T22b** — Implement Error Translator (C16): regex→白話 mapping for ~20 common error patterns + generic fallback + retry button + collapsible tech details
  - Output: `src/lib/server/error-translator.ts`, `src/lib/server/error-patterns.ts`
- [ ] **T22c** — Implement Session Resume: Orchestrator snapshot persist on state transition, project list on reopen, restore from snapshot, SSE reconnect with lastEventId
  - Output: updates to `orchestrator.ts`, `+layout.svelte`, `sse/+server.ts`
- [ ] **T22d** — Implement App Layout (C17): +layout.svelte with Sidebar + main chat area responsive layout
  - Output: `src/routes/(app)/+layout.svelte`

---

## Phase 4 — OpenTelemetry + 收尾 + Docker publish

- [ ] **T23** — Implement OTEL setup (C14): `@opentelemetry/sdk-node` init, log exporter (stdout JSON), metrics exporter (`/metrics` Prometheus), trace exporter (stdout/OTLP)
  - Output: `src/lib/server/telemetry.ts`
- [ ] **T24** — Instrument key spans: per-chat-request trace, per-command span, claude-bridge subprocess span, scaffolder span
  - Output: span creation in C7, C10, C11, C12
- [ ] **T25** — Add correlation ID: generate per-session ID, propagate through all log/metric/trace entries
  - Output: middleware in `src/hooks.server.ts`
- [ ] **T26** — End-to-end Docker test: build image → run container → send chat message → verify full pipeline (intake → translate → plan popup) works
  - Output: passing E2E test script `scripts/e2e-test.sh`
- [ ] **T27** — GitHub Actions workflow: build Docker image on tag push → push to `ghcr.io/adamou0408/reqagent:v0.1`
  - Output: `.github/workflows/build-docker.yml`

---

## Task Dependencies

```
T01 → T02 → T03 → T04 → T05 → T06
                    ↓
              T07 → T08 → T09 → T10 → T22d (layout)
                           ↓
              T11 → T12 → T13 → T14 → T15 → T16 → T17
                                              ↓
                                 T18, T19, T20, T21, T22a (parallel)
                                              ↓
                                      T22 → T22b → T22c
                                              ↓
                                 T23 → T24 → T25 → T26 → T27
```

---

## Definition of Done (per task)

1. Code compiles without errors (`npm run check`)
2. Relevant component renders / endpoint responds correctly
3. No OWASP top-10 vulnerabilities introduced
4. Docker build still succeeds (regression check from T06 onward)
