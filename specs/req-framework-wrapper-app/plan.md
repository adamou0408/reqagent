# Implementation Plan — REQ Framework Wrapper App v0.1

**Spec**: `specs/req-framework-wrapper-app/spec.md` v1.2
**Status**: draft
**Created**: 2026-04-09

---

## 1. 對應規格

| Spec Section | Plan Coverage |
|---|---|
| 功能需求 §2.1–2.6 | §4 架構設計 全覆蓋 |
| 非技術使用者 AC #1–#9 | §4.5 Surfacing Policy + §4.2 Chat UI + §4.6 Session Resume + §4.7 Error Translation |
| 技術使用者 AC #1–#7 | §4.2 Backend API + §4.2 Scaffolding Sandbox |
| CONSTITUTION 合規 | §8 安全性考量 + §3.3 Observability |
| CONFLICT-001 | §4.5 以 Direction (D) 實作 |

---

## 2. 工作量估算

| Phase | Tasks | Est. Effort |
|---|---|---|
| P0 — 專案骨架 + Docker | 6 | 1 day |
| P1 — Chat 核心 + Claude Code 整合 | 6 | 2 days |
| P2 — 14-command Orchestrator + Surfacing | 5 | 2 days |
| P3 — Review/Conflict 面板 + Scaffolding Sandbox | 5 | 2 days |
| P4 — OpenTelemetry + 收尾 + Docker publish | 5 | 1 day |
| **Total** | **27** | **~8 dev days** |

---

## 3. 技術選型

### 3.1 Frontend + Backend

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **SvelteKit** (adapter-node) | 使用者 Q1=(C) 選擇；輕量、SSR+SPA 混合 |
| UI Library | **shadcn-svelte** | 社群 port of shadcn/ui；Tailwind CSS |
| ORM | **Drizzle ORM** | 類型安全、zero-dependency、SQLite driver |
| Database | **better-sqlite3** | 同步 API、Docker 內單檔 state |
| Realtime | **SSE** via SvelteKit server endpoints | Claude Code CLI stdout → SSE stream |

### 3.2 Runtime & Delivery

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | **Node.js 20 LTS** | SvelteKit adapter-node + Claude Code CLI 依賴 |
| Delivery | **Docker image** (Q2=4) | `ghcr.io/adamou0408/reqagent:v0.1` |
| Claude Code CLI | **@anthropic-ai/claude-code** npm global install in Docker | Q3=(a) subprocess spawn |
| API Key | **OS keychain CLI** on host → `ANTHROPIC_API_KEY` env var into container | Q4=(I)；launcher script 用 `security find-generic-password` (macOS) / `secret-tool lookup` (Linux) / `cmdkey` (Windows) 讀 keychain；若 keychain 為空則 prompt 使用者輸入並存入 keychain |

### 3.3 Observability

| Layer | Choice | Rationale |
|---|---|---|
| SDK | **@opentelemetry/sdk-node** | Q7=(R) Full OpenTelemetry |
| Logs | **OTEL Log Exporter** → stdout (JSON) | CONSTITUTION §3.6 compliance |
| Metrics | **OTEL Metrics** → Prometheus `/metrics` endpoint | request rate, subagent latency, failures |
| Traces | **OTEL Trace Exporter** → stdout (JSON) or OTLP | correlation ID per session, span per command |

---

## 4. 架構設計

### 4.1 Container 架構

```
┌─────────────────────────────────────────────────────┐
│  Docker Container: reqagent:v0.1                    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  SvelteKit App (adapter-node, port 3000)    │    │
│  │                                             │    │
│  │  ┌──────────┐  ┌──────────────────────┐     │    │
│  │  │ Frontend │  │  Backend API Routes  │     │    │
│  │  │ (Svelte) │  │  /api/chat           │     │    │
│  │  │          │  │  /api/projects        │     │    │
│  │  │ Chat UI  │  │  /api/commands        │     │    │
│  │  │ Panels   │  │  /api/sse             │     │    │
│  │  │ Sidebar  │  │  /metrics             │     │    │
│  │  └──────────┘  └──────┬───────────────┘     │    │
│  │                       │                     │    │
│  │              ┌────────▼────────┐            │    │
│  │              │  Orchestrator   │            │    │
│  │              │  (14-cmd router │            │    │
│  │              │   + surfacing)  │            │    │
│  │              └────────┬────────┘            │    │
│  │                       │                     │    │
│  │              ┌────────▼────────┐            │    │
│  │              │  Claude Code    │            │    │
│  │              │  CLI Subprocess │            │    │
│  │              │  (child_process)│            │    │
│  │              └────────┬────────┘            │    │
│  │                       │                     │    │
│  │              ┌────────▼────────┐            │    │
│  │              │  SQLite DB      │            │    │
│  │              │  (mounted vol)  │            │    │
│  │              └─────────────────┘            │    │
│  │                                             │    │
│  │  ┌─────────────────────────────────────┐    │    │
│  │  │  OpenTelemetry SDK                  │    │    │
│  │  │  Logs → stdout | Metrics → /metrics │    │    │
│  │  │  Traces → stdout/OTLP              │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Volume mount: /workspace ← host ~/.reqagent        │
│  Env: ANTHROPIC_API_KEY (from host keychain)        │
└─────────────────────────────────────────────────────┘
```

### 4.2 元件拆解

| # | Component | 職責 | 檔案位置 |
|---|---|---|---|
| C1 | **Chat UI** | 訊息串、打字框、進度 bar、toast | `src/routes/(app)/+page.svelte` |
| C2 | **Project Sidebar** | 專案列表、新增/切換專案 | `src/lib/components/Sidebar.svelte` |
| C3 | **Review Panel** | /req-review HARD checkpoint 面板 | `src/lib/components/ReviewPanel.svelte` |
| C4 | **Conflict Panel** | /req-resolve-conflict HARD checkpoint 面板 | `src/lib/components/ConflictPanel.svelte` |
| C5 | **Deploy Panel** | /req-deploy HARD checkpoint 面板 | `src/lib/components/DeployPanel.svelte` |
| C6 | **Plan Popup** | /req-plan ExitPlanMode 白話翻譯 | `src/lib/components/PlanPopup.svelte` |
| C7 | **Chat API** | 接收使用者訊息 → Orchestrator | `src/routes/api/chat/+server.ts` |
| C8 | **SSE Endpoint** | 推送 Claude Code 即時輸出 | `src/routes/api/sse/+server.ts` |
| C9 | **Project API** | CRUD projects in SQLite | `src/routes/api/projects/+server.ts` |
| C10 | **Orchestrator** | 14-command 路由 + surfacing 決策 | `src/lib/server/orchestrator.ts` |
| C11 | **Claude Code Bridge** | child_process.spawn wrapper + stream parser | `src/lib/server/claude-bridge.ts` |
| C12 | **Scaffolding Sandbox** | --ignore-scripts + npm audit gate | `src/lib/server/sandbox.ts` |
| C13 | **DB Layer** | Drizzle schema + migrations | `src/lib/server/db/` |
| C14 | **OTEL Setup** | OpenTelemetry SDK init + exporters | `src/lib/server/telemetry.ts` |
| C15 | **Rollback Panel** | 3-strike 失敗白話面板（重試/簡化/暫停） | `src/lib/components/RollbackPanel.svelte` |
| C16 | **Error Translator** | Claude Code error → 白話訊息 mapper | `src/lib/server/error-translator.ts` |
| C17 | **App Layout** | SvelteKit +layout.svelte：Sidebar + main area | `src/routes/(app)/+layout.svelte` |

### 4.3 元件互動

```
User → C1 (Chat UI)
       │ POST /api/chat
       ▼
     C7 (Chat API) → C10 (Orchestrator)
       │                │
       │    ┌───────────┼──────────────┐
       │    ▼           ▼              ▼
       │  C11        C12           C13 (DB)
       │  (Bridge)   (Sandbox)
       │    │
       │    ▼ spawn claude-code --print
       │    │ stdout/stderr stream
       │    ▼
     C8 (SSE) ←── stream chunks
       │
       ▼
     C1 (Chat UI) ← SSE events render in real-time
       │
       │ HARD checkpoint detected?
       ▼
     C3/C4/C5/C6/C15 (Panel popup) → User decision → C7 → C10 → continue

Sandbox path (during IMPLEMENT):
  C10 → C12 (Sandbox) → npm create / npm install --ignore-scripts → npm audit gate
                         ↓ fail → C16 (Error Translator) → C1 (white-language toast + retry btn)
```

### 4.4 Orchestrator State Machine

```
IDLE → INTAKE → RESEARCH → TRANSLATE → DETECT_CONFLICTS
  │                                          │
  │                              ┌───────────┤
  │                              ▼           ▼ (conflicts > 0)
  │                           PLAN ← RESOLVE_CONFLICT
  │                              │
  │                              ▼ (HARD checkpoint: PlanPopup)
  │                           IMPLEMENT ←─────────┐
  │                              │                 │ (request-changes)
  │                              │    ┌────────────┤
  │                              ▼    │            │
  │                           REVIEW ─┘    3-strike fail → ROLLBACK (C15)
  │                              │                          ↓
  │                              │              user picks: retry / simplify / pause
  │                              ▼ (HARD checkpoint: DeployPanel)
  │                           DEPLOY → DONE
  │
  └── ITERATE (escape hatch, any state)
```

### 4.6 Session Resume

Orchestrator state 持久化到 SQLite（`projects.state` + `projects.orchestrator_snapshot`）。
- **每次 state transition** 時寫入 snapshot（當前 state + pending command + context）
- **重開 wrapper** 時，Chat UI 從 DB 載入「進行中專案」清單
- **使用者選擇專案** → Orchestrator 從 snapshot restore → 繼續下一步
- SSE reconnect：前端用 `EventSource` 自帶 reconnect + `lastEventId`

### 4.7 Error Translation

C16 (Error Translator) 將 Claude Code 的 raw error 轉為白話：
- 維護 `error-patterns.ts`：regex → 白話模板 mapping（~20 常見 pattern）
- 未匹配的 error → 通用訊息「AI 遇到了問題，你可以按『重試』讓它再試一次」
- 每個白話錯誤訊息都附帶 **「讓 AI 再試一次」按鈕** + **「查看技術細節」摺疊區**

### 4.8 Scaffolded App Template

`/req-implement` scaffolding 使用的 CRUD 範本來源：
- **SvelteKit skeleton**：`npm create svelte@latest` (skeleton project)
- **Drizzle + better-sqlite3**：由 Claude Code 根據使用者描述的 entities 自動產生 schema
- **Demo 帳號**：scaffolded app 包含 hardcoded demo user（email: demo@example.com / pass: demo1234）
- **CRUD pages**：Claude Code 根據 schema 生成 `/[entity]` 路由（list / create / edit / delete）
- 此範本不需要預建 — Claude Code 本身就能生成，plan 只需確保 prompt 裡包含這些要求

### 4.5 Surfacing Policy (CONFLICT-001 Direction D)

| # | Command | Classification | Trigger |
|---|---|---|---|
| 1 | `/req-intake` | 🎯 必須 surface | chat 主迴圈 |
| 2 | `/req-research` | 🟡 背景+結果觸發 | duplicate / Red feasibility 時 surface |
| 3 | `/req-translate` | ⚫ 完全背景 | 純檔案寫入 |
| 4 | `/req-detect-conflicts` | 🟡 背景+結果觸發 | conflict > 0 時 surface |
| 5 | `/req-resolve-conflict` | 🎯 必須 surface | HARD checkpoint 衝突仲裁面板 |
| 6 | `/req-review` | 🎯 必須 surface | HARD checkpoint review 面板 |
| 7 | `/req-plan` | 🎯 必須 surface | HARD checkpoint ExitPlanMode 白話卡 |
| 8 | `/req-implement` | 🟡 背景+進度+失敗 surface | 進度 bar；3-strike 失敗 surface rollback 面板 |
| 9 | `/req-deploy` | 🎯 必須 surface | HARD checkpoint 預覽/發布按鈕 |
| 10 | `/req-feedback` | ⚫ 完全背景 | v0.1 stub only |
| 11 | `/req-iterate` | 🔀 escape hatch | 自然語句「我想改前面的 X」觸發 |
| 12 | `/req-audit` | 🟡 背景+結果觸發 | drift > 0 時 surface |
| 13 | `/req-autonomy` | ⚫ 完全背景 | 內部 config |
| 14 | `/req-onboard` | ⚫ 完全背景 | wrapper 首次 init |

**Surface count**: 5 必須 / 4 結果觸發 / 4 完全背景 / 1 escape hatch

---

## 5. 風險評估

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Claude Code CLI API 不穩定或輸出格式變更 | 中 | 高 | Bridge 層 (C11) 用 `--output-format json` + 寬鬆 parser；version pin in Dockerfile |
| R2 | shadcn-svelte 與官方 shadcn 差異導致 UI 碎片 | 低 | 中 | 只用 Button/Card/Dialog/Input/Badge 5 個基礎元件 |
| R3 | SQLite 在 Docker volume mount 上效能問題 | 低 | 低 | WAL mode 開啟；DB 直接放在 mounted volume `/workspace/data/reqagent.db`（統一位置，不做 tmpdir sync） |
| R4 | OpenTelemetry SDK bundle 過大影響啟動時間 | 低 | 低 | Tree-shake；只載入 node SDK 不載 browser SDK |
| R5 | Docker Desktop 授權問題（企業 Mac > 250 人） | 中 | 中 | 文件說明替代方案（Colima、Rancher Desktop）；v0.2 評估 Tauri |

---

## 6. 資料模型變更

### 6.1 SQLite Schema (Drizzle)

```typescript
// projects table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(), // nanoid
  name: text('name').notNull(),
  description: text('description'),
  state: text('state').notNull().default('intake'),
  // intake|research|translate|conflicts|plan|implement|review|deploy|done
  orchestratorSnapshot: text('orchestrator_snapshot', { mode: 'json' }), // session resume
  specPath: text('spec_path'),
  planPath: text('plan_path'),
  workspacePath: text('workspace_path'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// messages table
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  role: text('role').notNull(), // user|assistant|system
  content: text('content').notNull(),
  metadata: text('metadata', { mode: 'json' }), // command, surfacing info
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// conflicts table
export const conflicts = sqliteTable('conflicts', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  conflictId: text('conflict_id').notNull(), // e.g. CONFLICT-001
  description: text('description').notNull(),
  resolution: text('resolution'), // null until resolved
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
});
```

### 6.2 Migration Strategy

- Drizzle Kit `push` for v0.1 (single-user, no production migration needed)
- Schema versioning via Drizzle snapshots in `drizzle/` dir

---

## 7. 部署影響評估

### 7.1 基礎建設變更

- 新增 `Dockerfile` + `.dockerignore`
- 新增 `docker-compose.yml` (optional dev convenience)
- GitHub Actions workflow for building + pushing to `ghcr.io`

### 7.2 CI/CD 流程變更

- 新增 GitHub Actions: `build-docker.yml`
  - Trigger: push to `main` with tag `v*`
  - Steps: build → test → push to GHCR

### 7.3 資料庫遷移

- 無生產資料庫；SQLite 檔案隨 Docker volume 建立
- `drizzle-kit push` 在 container 首次啟動時執行

### 7.4 環境變數 / 密鑰

| Variable | Source | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | Host keychain via launcher script → `docker run -e` | Yes |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | User config (optional) | No |
| `PORT` | Default 3000 | No |

### 7.5 外部服務依賴

| Service | Usage | Failure Mode |
|---|---|---|
| Anthropic API | Claude Code CLI → API calls | Wrapper 顯示 error toast + retry button |
| npm registry | Scaffolding `npm create svelte@latest` | Error toast + retry button；offline template cache 為 v0.2 |

### 7.6 回滾策略

- Docker image tagged by version: rollback = `docker pull reqagent:v0.0` (previous)
- SQLite DB in volume: backup before upgrade via launcher script

---

## 8. 安全性考量

| # | Concern | Mitigation |
|---|---|---|
| S1 | API key in Docker env var 可被 `docker inspect` 看到 | 文件警告；v0.2 改用 Docker secrets |
| S2 | Scaffolding npm packages 可能有 malware | `--ignore-scripts` + `npm audit --audit-level=high` gate (Decision 6) |
| S3 | Claude Code 產生的 shell commands 可能有注入 | Container 本身是 sandbox；scaffolder 白名單只允許 `npm`/`npx`/`node` |
| S4 | XSS via Claude output rendered in chat | Svelte 預設 escape HTML；只在 markdown renderer 用 `{@html}` + DOMPurify |
| S5 | SQLite injection | Drizzle ORM parameterized queries；無 raw SQL |

---

## 9. Spec Amendments

| # | Amendment | Reason | Approved By |
|---|---|---|---|
| A1 | AC #7 新增 Docker Desktop 例外 | Q2=(4) Docker 與 AC #7「不要求安裝本地工具」衝突；Decision 5=(α) 放寬 | User (Batch 2) |
