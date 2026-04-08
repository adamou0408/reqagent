# Research: req-framework-wrapper-app

- Intake 來源：`./intake/raw/2026-04-08-req-framework-wrapper-app.md`
- 建立日期：2026-04-08
- Autonomy：`strict`
- 被包裝的 framework：`adamou0408/req`（`.req-framework/` 為 submodule，**目前尚未初始化**）

---

## Duplicate scan

本輪 dedup scan 屬於 **trivially empty**，無需比對：

| 檢查項目 | 路徑 | 狀態 |
|---|---|---|
| 既有 specs | `./specs/` | 僅有 `.gitkeep`，無任何 feature slug |
| 既有 personas | `./personas/` | 僅有 `.gitkeep` |
| 既有 conflicts | `./conflicts/` | 僅有 `.gitkeep` |
| Existing features 清單 | `./docs/existing-features.md` | **檔案不存在**（`./docs/` 下只有 `changelog.md`） |
| `src/`、`tests/` | `./src/`、`./tests/` | 皆為空 |

**結論**：沒有任何先前需求可供比對，`matched-existing-feature = none`。這是 reqagent wrapper repo 的首個 intake。

---

## Framework context

透過 WebFetch（共 4 次，已達上限）取得之 `adamou0408/req` 框架理解：

### 核心命令（12 個 slash commands）

```
/req-intake           使用者提交原始需求
/req-research         AI 做 dedup + 可行性分析（本 agent 正在執行的就是此命令）
/req-translate        轉為結構化 spec.md
/req-detect-conflicts 找出角色之間的矛盾
/req-resolve-conflict Human 仲裁衝突
/req-review           Human 核可/退回 spec
/req-plan             AI 產生技術計畫與 tasks.md
/req-implement        AI 寫 code + tests，測試失敗最多自動修 3 次
/req-deploy           部署並做 health check
/req-feedback         持續監測
/req-iterate          需求變更
/req-audit            偵測 spec 與 code 之間的 drift
```

### 技術棧與執行環境

- **100% Shell script** 實作（依 GitHub language bar 所示）
- 框架本身是 **specification + workflow layer**，**不內建 LLM client / API key**
- 設計假設：**在 Claude Code 內執行 slash commands**，由 Claude 本身充當 agent runtime
- 輸出流向：

```
intake/raw/*.md
  → specs/{slug}/research.md
  → specs/{slug}/spec.md + personas/{role}.md
  → (conflicts/ + review)
  → specs/{slug}/plan.md + tasks.md
  → src/ + tests/
```

- `/req-implement` 會寫入 `${REQ_CODE_ROOT}/src/` 與 `${REQ_CODE_ROOT}/tests/`，並自動跑測試；但**是否會呼叫 `create-next-app`、`shadcn add` 等 scaffolding CLI**，在 README 上未明示，傾向由 agent 視需求自行決定。

### 語言規範（AGENTS.md §7.0 摘要）

| 檔案類型 | 主語言 |
|---|---|
| `framework/CONSTITUTION.md`、`framework/AGENTS.md` | English |
| `framework/commands/*.md` | English（可嵌入中文模板欄位） |
| `framework/templates/spec/*.md`、`persona/*.md`、`review.md` | **Chinese** 為主 |
| `templates/intake/*.md` | 中英雙語 |
| **AI 對使用者的對話輸出** | **Chinese** |

本 `research.md` 遵守上述規範：散文以中文撰寫，command / code / tool 名稱保留英文。

### 「非程式設計者友善」的 wrapper 需要抽象掉的項目

1. **Claude Code / IDE 環境**：非技術使用者不會安裝 Claude Code CLI，wrapper 需自帶一個 chat UI 作為 runtime
2. **Slash command 概念**：使用者不該看到 `/req-translate` 這種 jargon，應由 chat agent 自然地推進流程
3. **Git / submodule / 檔案系統**：需將 `specs/*.md`、`personas/*.md` 等產物以圖形化方式呈現（review 卡片、角色卡、衝突對照）
4. **Scaffolding 工具鏈**：使用者不應手動跑 `npm create next-app`；wrapper 需在 `/req-implement` 階段自動呼叫 scaffolder 並提供 preview URL
5. **部署**：`/req-deploy` 需隱藏在「發布」按鈕後面

---

## Feasibility matrix

| 維度 | 評級 | 說明 |
|---|---|---|
| **與 req CLI 整合** | 🟡 Yellow | req 是 shell + markdown，且設計上依賴 Claude Code 做 runtime。Wrapper 要自己帶 LLM client 並重放 slash command 語意（可透過 subprocess 呼叫 framework 的 shell scripts，或讓 wrapper 的 agent 讀取 `framework/commands/*.md` 當 system prompt）。整合路徑可行但**不是現成**。 |
| **Agent 路線 A（開源 fork）** | 🟡 Yellow | 候選專案多，但大多為 generic chat UI，沒有 built-in 的「structured multi-step state machine」概念。需要自行寫 plugin / custom tools 層。 |
| **Agent 路線 B（自建）** | 🟢 Green | Claude Agent SDK 或 LangGraph 皆能直接映射 req 的 12-step DAG。對於 **command-driven 有限狀態** 流程特別合適。 |
| **輸出產生（CRUD app）** | 🟡 Yellow | req 本身能寫 `src/` + `tests/`，但對於「產出可跑的 Next.js + Supabase CRUD」需要 wrapper 預先安裝 scaffolder（`create-next-app`、`shadcn`、`drizzle-kit`、`supabase init` 或 `better-sqlite3`）。Framework README 沒明確保證生成 runnable app，需在 `/req-plan` 階段由 template 約束。 |
| **Security / auth** | 🟢 Green（MVP） / 🟡 Yellow（長期） | MVP 可假設 **single-user、local、localhost-only**；若未來要多租戶則需 auth、每用戶 sandbox、API key 隔離，架構需大改。 |
| **Dog-fooding 可行性** | 🟡 Yellow | 流程上可行（此 intake 本身即為 dog-food 證據），但 **bootstrap 問題**：第一版 wrapper 必須由人類工程師實作，因為目前還沒有 wrapper 可用；dog-fooding 從 v0.2 起才真正成立。 |
| **整體** | 🟡 **Yellow** | 沒有 show-stopper，但多處需設計決策，且 scaffolding 與 CLI 整合是關鍵風險。 |

---

## Agent route comparison

### Route A — 開源專案 fork

以下資訊部分來自一般社群認知，若有疑慮已註記 **[待確認]**：

| 專案 | License [待確認] | Extensibility | 部署成本 | 對 req-flow 的契合度 |
|---|---|---|---|---|
| **Open WebUI** | BSD-3 [待確認] | Tools / Functions / Pipelines 可注入 Python；有 pipeline 機制可做 multi-step | 中（Docker 一鍵） | 🟡 中 — Pipeline 能模擬 step machine，但 UI 仍以「聊天」為主 |
| **LibreChat** | MIT [待確認] | Plugin 系統、Agents endpoint；較偏 multi-model chat | 中 | 🟡 中 — 功能豐富但流程客製工作量不小 |
| **Chainlit** | Apache-2.0 [待確認] | **Python-first，專為 LLM app 的 chat UI**；內建 step / element / action 元件 | 低（pip install） | 🟢 **高** — `cl.Step`、`cl.Action` 可直接映射 req 的 12 步驟 |
| **AnythingLLM** | MIT [待確認] | Workspace + agent skills；偏 RAG 導向 | 中 | 🟡 中 — agent skills 可用，但流程層不夠結構化 |
| **Flowise** | Apache-2.0 [待確認] | 視覺化 LangChain flow builder | 中 | 🟡 中 — 適合原型但 chat UX 需再包一層 |
| **Lobe Chat** | MIT [待確認] | 插件系統、Agent marketplace | 低 | 🔴 低 — 偏消費級 chat，客製 flow 成本高 |

**Top 2 候選**：

1. **Chainlit** — Python、輕量、原生支援 step/action，對「把 12 個 slash command 擬人化」的 UX 最直接。但 UI 自訂度相對受限。
2. **Open WebUI** — 生態最活躍、Docker 部署成熟，Pipeline 機制可承載複雜 flow。代價是需要寫較多 plugin 程式碼。

### Route B — 自建

| 方案 | 優點 | 缺點 |
|---|---|---|
| **Claude Agent SDK**（TypeScript/Python） | 與 Claude Code 行為最一致；subagent、tool use、streaming 都是一級公民；與 req framework 假設的 runtime 契合 | 綁定 Anthropic；UI 要另外做 |
| **LangGraph** | **有限狀態機**語意非常契合 req 的 12-step DAG；node-based，容易追蹤 state；可換 LLM provider | 框架學習曲線；UI 要另外做 |
| **Thin custom Next.js + streaming backend** | 最大彈性、最佳 UX；前後端同棧，利於後續一鍵產出 CRUD app（因為 scaffold 目標也是 Next.js） | 所有 agent 基礎設施自己寫；工作量最大 |

### 建議

**初步推薦：Route B 的 LangGraph（backend）+ 自建 Next.js chat UI（frontend）**，原因：

1. req 的 12 個 command 本質就是一個 **有限狀態機**，LangGraph 的 node/edge 模型幾乎 1:1 對應
2. 前端用 Next.js 使得 **MVP 的 CRUD 產出可以與 wrapper 同棧**，dog-fooding 更順
3. 保留換 LLM provider 的彈性（framework 目前只綁 Claude，但使用者層面不該被綁）

**備案：Chainlit** — 如果團隊想在一週內就有可 demo 的版本，Chainlit 的 `cl.Step` + `cl.Action` 可極快搭出 PoC，事後再決定是否轉自建。

---

## Open questions for /translate

以下問題在 `/req-translate` 階段需要使用者或 framework 維護者回答：

1. **Scaffolding stack 鎖定**：MVP 是否鎖定 Next.js + SQLite（或 Supabase）+ shadcn？或允許使用者選 Python/Flask？鎖定程度會決定 `/req-plan` 的 template 形狀。
2. **Runtime 部署模式**：Wrapper 是「local desktop app」（Electron / Tauri）、「local CLI + browser UI」、還是「hosted multi-user SaaS」？這會直接改變 auth / sandbox / persistence 設計。
3. **Req framework 呼叫方式**：Wrapper 是 (a) 直接 subprocess 呼叫 `.req-framework/framework/scripts/*.sh`，還是 (b) 讀取 `framework/commands/*.md` 當 prompt 讓自己的 LLM 執行同樣語意？二者在語意保真度與耦合度上有顯著差異。
4. **非技術使用者的上限**：使用者是「完全不會讀 code」還是「會看成果但不會寫」？前者需要把 `spec.md` / `tasks.md` 也翻譯成自然語言卡片。
5. **Dog-fooding 觸發點**：第幾個 milestone 開始用 wrapper 自己開發 wrapper？v0.1 由人類撰寫 Route B 的 LangGraph 骨架，v0.2 起改由 wrapper 本身的 `/req-iterate` 推動？
6. **上游 framework 是否需要新增 API**：例如加一個 `req --json` 模式，讓 wrapper 不必解析 markdown，就可以和 framework 程式化互動。這會反向影響上游。

---

## Recommended next step

**建議進入 `/req-translate`**，並在 translate 階段優先處理上列 Open question 1、2、3（scaffolding stack、runtime 模式、framework 呼叫方式），因為這三題會分叉出完全不同的 spec 形狀。

- Feasibility overall：**🟡 Yellow** — 可做，但設計決策密集，非純執行題
- 無 duplicate 可合併，故不需 `/req-iterate`
- 因為 `autonomy_level: strict`，translate 之後仍須經 human `/req-review` 方可進 `/req-plan`
