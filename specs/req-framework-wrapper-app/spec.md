# req Framework 對話式包裝 App（req-framework-wrapper-app）

> **欄位標記說明**：標題前有 `*` 為**必填**段落（即使結論是「無」也要明確寫出）；標題後標 `（選填）` 為視情況補充。

## * 狀態：`approved`

## * 版本歷史

| 版本 | 日期 | 變更摘要 | 觸發者 |
|------|------|----------|--------|
| v1.0 | 2026-04-08 | 初始版本，由 `/req-translate` 從 intake + research 轉譯 | /req-translate |
| v1.1 | 2026-04-08 | 人類 deep review 後修正：submodule 初始化後發現 framework runtime 為 Claude Code 本身（原 Q3 (a) 選項作廢）；放寬效能目標；新增 Session resume / Rollback / 多專案 / Export / Framework upgrade 共 6 條新 AC；新增 v0.1 MVP 範圍段；依據 AskUserQuestion 回饋記錄 CONFLICT-001 解決方向 (D) | 人類 review（framework 維護者） |

## * 來源追溯

- 原始需求：[`intake/raw/2026-04-08-req-framework-wrapper-app.md`](../../intake/raw/2026-04-08-req-framework-wrapper-app.md)
- 調研報告：[`research.md`](./research.md)
- 提出者：Framework 維護者（`adamou0408/req` 作者/貢獻者；身份於 intake 追問中確認）
- 提出日期：2026-04-08

## * 負責人

- Spec 擁有者：Framework 維護者（即提出者）
- 技術負責人：待 `/req-plan` 階段指派（v0.1 bootstrap 必須由人類工程師擔綱）
- 審核者：Framework 維護者（self-review，因為目前是 solo context）
- 審核期限：進入 `/req-plan` 前完成 `/req-review`

## * 依賴關係

- **前置需求**：
  - 外部依賴：
    - `adamou0408/req` framework 本身（本 repo 已以 submodule 形式掛在 `.req-framework/`，**v1.1 起已初始化** 於 commit `67bb4df`）
    - **Claude Code CLI**（若 Q3 選 (a) spawn CLI 路線）或 **Claude Agent SDK**（若 Q3 選 (b) re-host 路線）—— 二擇一，由 `/req-plan` 決定
    - **Anthropic API key**（選 (a)/(b) 皆必要；選 (c) 完全自建時才可換 provider）
    - **Scaffolding 工具鏈**：`create-next-app` / `shadcn` CLI / `better-sqlite3` 或 `drizzle-kit` 或 `supabase` CLI —— 具體組合由 Q1 + `/req-plan` 決定
  - 無其他本 repo 內的前置 spec（這是 `./specs/` 的第一個 feature）
- **後續需求**：無（本 spec 是後續所有 wrapper 功能的 parent spec；細部能力會在日後以獨立 spec 展開）
- **共享資源**：無（首個 feature，尚無可共享的元件）

## * 需求摘要

打造一個對話式網頁 app，作為 `adamou0408/req` framework 的非技術使用者入口：使用者在 chat UI 中用自己的話描述想做的網頁應用，由一個 conversational agent 角色引導走完 req framework 的結構化流程（intake → research → translate → plan → implement → deploy），最終產出一個可實際運行的 **CRUD 級網頁應用**（含資料庫）。MVP 範圍不含完整 SaaS 等級的 auth / multi-tenant。Agent 實作路線**需在 `/req-plan` 階段重新評估** —— 初次 `/req-research` 未納入「spawn Claude Code CLI 作為 runtime」這個事實上可行的路徑（當時 submodule 尚未初始化，research 誤以為 framework 是純 shell script 集合）。三個真實選項詳見 Open question Q3。

## * 使用者故事

### Framework 維護者

- **作為** framework 維護者，**我想要** 一個對話式 wrapper app 把 `adamou0408/req` 的 12 個 slash command 對非技術使用者隱藏起來，**以便** 讓不懂 Claude Code / git / CLI 的人也能走完 req 流程並產出可用的 CRUD web app，同時保留 framework 原有的 traceability 與結構化紀律。
- **驗收條件**：
  - [ ] Wrapper app 能將 req framework 的每一個 slash command 映射為 chat agent 的一個 step（或 step group），且每一步都能在 UI 上顯示目前進度（例如「第 3 步 / 共 12 步：整理你的需求」）
  - [ ] Wrapper app 在每個 step 產生的檔案（`intake/raw/*.md`、`specs/{slug}/research.md`、`spec.md`、`plan.md`、`tasks.md`、`personas/*.md`）都寫在與 framework 約定一致的路徑，並可於事後被人類用 `/req-audit` 驗證 drift
  - [ ] Wrapper app 與 framework 的呼叫方式（**spawn Claude Code CLI subprocess / Claude Agent SDK re-host / 完全自建 runtime — 三選一**）在 `/req-plan` 階段之前明確決定，並在本 spec 的 Open question Q3 被回答後記錄於 `plan.md`
  - [ ] Wrapper app 在 v0.1 可由人類工程師手動完成 bootstrap，**不**要求必須用 wrapper 自己建 wrapper
  - [ ] Wrapper app 提供一個「**衝突仲裁面板**」UI 元件，可渲染 `conflicts/CONFLICT-*.md` 的內容（涉及 spec / 角色連結、嚴重度、建議方向），維護者選擇一個解決方向後 wrapper 自動更新 conflict 檔案狀態為「已解決」
  - [ ] Wrapper app 提供一個「**Review 面板**」UI 元件，可渲染 `reviews/REVIEW-*.md` 的 checklist，維護者可逐項勾選並按 approve/reject，觸發對應的狀態轉換（`draft → in-review → approved`）
  - [ ] **（新）Rollback visibility**：當 `/req-implement` 達到 3-strike 測試失敗 HARD checkpoint 時，wrapper 提供一個「**測試失敗詳情**」面板，顯示每次重試的 diff、失敗的測試名稱、最後一次的 stack trace 摘要，讓維護者判斷是「放棄此 task」、「手動修 code 後重跑」，還是「退回 spec 修改 AC」
  - [ ] **（新）Framework 升級處理**：維護者可在 wrapper UI 內觸發 `git submodule update --remote .req-framework` 並自動執行 `req-sync-commands.sh`；若新版 framework 的 major version 改變（例如 2.x → 3.x），wrapper 顯示 `MIGRATION.md` 連結並**暫停所有進行中的 session**，直到維護者確認遷移完畢

### 非技術使用者 / Non-technical Builder

- **作為** 非技術使用者，**我想要** 在一個 chat 介面用自己的話描述我想做的網頁應用，並被 agent 引導一步步補齊細節，**以便** 最後能拿到一個真的可以在瀏覽器裡打開、能讀寫資料庫的 CRUD 網頁應用，整個過程不需要我打開 terminal、安裝開發工具、或看任何 markdown / code。
- **驗收條件**：
  - [ ] 使用者在 chat UI 第一個畫面只看到一個輸入框與友善的開場白，**不**出現 `/intake`、`spec.md`、`persona` 這類 jargon
  - [ ] 使用者在描述需求後，agent 會用**自然語言**（非 slash command）追問 Who / What / Why 與必要的範圍問題
  - [ ] 使用者能在一個 review 卡片上看到「agent 對我的需求的理解」，並可按「確認」或「我想改一下」（對應 `/req-review` 的 approve / reject）
  - [ ] 使用者可以在任何 step 輸入「我想改前面說過的 X」，wrapper 觸發 `/req-iterate`，並在 iterate 預覽頁以白話列出「這個修改會影響到需求描述的 A 段、角色 B、以及第 C 步驟的設定」，讓使用者確認後才實際套用
  - [ ] 使用者最後按一個「**預覽**」按鈕（MVP 僅支援 localhost 預覽，**不含外網發布**；外網發布為 v0.2 功能），能在瀏覽器開啟一個可實際使用的 CRUD 網頁應用（至少包含：登入一個內建 demo 帳號、建立 / 編輯 / 刪除 / 查看資料表中的紀錄）
  - [ ] 任何錯誤訊息（包含底層 `/req-implement` 的測試失敗）都會被翻譯為白話，並提供「讓 AI 自己再試一次」的按鈕，而不是讓使用者看到原始 stack trace
  - [ ] 整個流程完成前不要求使用者安裝任何本地工具（wrapper 本體可為本地桌面 app 或 localhost web UI，但對使用者而言只要點一下就能開；若 Q3 選 (a) 則 Claude Code CLI 必須被 wrapper 的 installer **bundle 或背景安裝**，使用者不需獨自處理）
  - [ ] **（新）Session resume**：使用者關閉瀏覽器、斷線、或隔日再回來打開 wrapper，可以從之前停下的 step 繼續；wrapper 在重開時自動列出「進行中的專案」，使用者選一個就能回到當時的對話脈絡與進度
  - [ ] **（新）Rollback 白話解釋**：當底層 `/req-implement` 遇到 3-strike 測試失敗 HARD checkpoint 時，wrapper 向使用者顯示白話訊息（例：「AI 試了 3 次都沒辦法讓程式跑起來，你可以選：① 請 AI 改用另一種做法重試 ② 簡化你之前描述的需求 ③ 暫停，等等再回來」），**絕不**向使用者直接顯示 stack trace 或 test runner 輸出
  - [ ] **（新）多專案**：同一位使用者可以在 wrapper 內同時進行多個不同 app 的開發，每個 app 有獨立的 `specs/{slug}/` 目錄與 chat session；在 chat UI 左側有一個「我的專案」清單可切換，切換時**不丟失**任何一邊的進度
  - [ ] **（新）Export / handoff**：使用者可在任何時候按「匯出」按鈕，取得一個 zip 檔（或 git bundle），內容包含 `specs/{slug}/`、`personas/`、`conflicts/`、生成的 `src/` 與 `tests/`，可直接交給工程師在 wrapper 外繼續開發；匯出檔中附一份白話的 README 說明如何在本機跑起來

## 衝突標記（選填）

- ✅ **CONFLICT-001（已解決，severity: medium）**：原張力是「結構化 checkpoint 強制性」vs.「自由流動的對話編輯」。2026-04-08 由 framework 維護者透過 `/req-resolve-conflict` 的 HARD checkpoint AskUserQuestion 裁決，採 **(D) 逐 checkpoint 分類 + 默認強制**。核心理由：**與 framework AGENTS.md §5 的 HARD/SOFT checkpoint + strict/balanced/auto 三層分類同構**，wrapper 只需建立對應的 UI surfacing 層，不發明新概念。完整決策記錄見 [`conflicts/CONFLICT-001.md`](../../conflicts/CONFLICT-001.md) 的「決策記錄」段。
  - **落地動作**：12 個 slash command 的分類表由 `/req-plan` 階段的 state machine 設計文件正式定義（預期分為：必須 surface / 背景+結果觸發 / 完全背景 / escape hatch 四種），並以 checkpoint surfacing policy 表格形式回寫到本 spec 的 v1.2 或 v1.3。
- 其他衝突：無（目前僅兩個 persona，其他潛在張力已被 research.md 的 Open questions 涵蓋）

## * 非功能需求

- **效能**（v1.1 依現實放寬；原 v1.0 對 subagent-heavy command 的硬性 P95 目標不切實際）：
  - **簡單 command**（`/req-intake`、`/req-iterate`、`/req-review`、`/req-autonomy`）：agent streaming 起始 P50 ≤ 4 秒 / P95 ≤ 10 秒
  - **涉及 subagent 的 command**（`/req-research`、`/req-detect-conflicts`、`/req-plan`、`/req-implement`、`/req-deploy`、`/req-audit`）：**無硬性 P95 上限**，但 UI **必須**在 2 秒內顯示「AI 正在 ___（目前步驟白話描述）」的進度條或動畫，且**不得出現連續 5 秒以上的靜默畫面**
  - **Happy path 總時長 ≤ 90 分鐘**（含使用者答題時間，不含 `/req-implement` 底下的實際 `npm install`/`next build`/測試執行時間；後者依技術棧與機器性能而波動，僅記為「預估額外 5–20 分鐘」）
- **相容性**：
  - 瀏覽器：近 2 年的 Chrome / Safari / Firefox
  - Wrapper runtime：至少支援 Linux / macOS；Windows 視 `/req-plan` 決定
  - Framework 相容性：以 `adamou0408/req` **v2.3.0** 為基準（與本 repo `.req.config.yml` 的 `last_synced_version` 一致）
- **可維運性**：wrapper 與 framework 的版本耦合必須透過 submodule pin，升級 framework 有獨立 `/req-iterate` 流程

## * 安全性需求

- **資料分類**：
  - 使用者輸入的需求描述 → **內部**（可能包含產品構想，不應外流）
  - 產出的 CRUD app 內 demo 資料 → **公開**（僅範例資料）
  - LLM API key（若自建 Route B）→ **機密**（絕不可出現在前端 bundle / git history）
- **認證需求**：
  - MVP：**single-user local 模式**，wrapper 綁定本機 loopback，不做 user login
  - 長期：若改為 hosted，需加 user auth；本 spec **不** 承諾長期模式
- **授權需求**：
  - MVP：無；所有操作都是 single-user
  - 產出的 CRUD app 內建之 demo auth 另由 `/req-plan` 的 scaffolding template 決定
- **加密需求**：
  - 傳輸：LLM API 呼叫必須走 HTTPS
  - 靜態：本機檔案（`intake/`、`specs/`）不額外加密，依賴 OS file permission
- **審計日誌**：
  - Wrapper 必須記錄每一次對 framework 的呼叫（哪個 slash command、輸入、輸出路徑）於 `docs/changelog.md` 或等效 log，確保 `/req-audit` 可用
- **個資處理**：
  - 預設**不**蒐集 PII；若使用者在需求描述中自行貼入個資，wrapper 應在 chat UI 提醒並不上傳到 LLM 之外的服務

## * 成功指標

- **目標 1**：一位完全不會寫 code 的測試使用者，能在 ≤ **90 分鐘** 內獨立（無工程師協助）從「我想做一個 X」走到「瀏覽器裡可操作的 CRUD app」。
  - **「成功」精確定義**：使用者可在瀏覽器內對**至少一張資料表**執行完整的 create / read / update / delete 四個動作，且使用者在過程中不需打開 terminal、不需手動編輯任何 `.md` 或 code 檔案。
  - **Measurable**：以 **≥ 5 位** 受試者做 usability test（要求樣本涵蓋不同年齡層與非技術背景——至少 1 位 ≥ 50 歲、至少 1 位無任何 SaaS 重度使用經驗），成功率 ≥ **60%**（v1.0 原訂 2/3 ≈ 67%，v1.1 因樣本放大與難度現實化而略為放寬）
- **目標 2**：Wrapper 產生的 `specs/{slug}/*.md` 通過 `/req-audit` 檢查、與對應 `src/` drift 為 0
  - **「drift」精確定義**：`/req-audit` 的輸出報告中 `unimplemented acceptance criteria`、`orphaned source files`、`spec-code mismatches` 三個欄位皆為 0
  - **Measurable**：`/req-audit` 在每個 milestone（v0.1 GA、v0.2 GA、…）後執行一次，結果寫入 `docs/changelog.md`
- **目標 3**：從 v0.2 起，wrapper 自身的下一個 feature 可完全由 wrapper 自己的流程完成（dog-food milestone）
  - **「完全」精確定義**：一個新 `intake/raw/*.md` 檔從 `/req-intake` 到 `/req-deploy` 的整條 pipeline，**100% 透過 chat UI 觸發**（不包含 git submodule 管理這類純維運動作，這些仍可在 terminal 做）
  - **Measurable**：由 framework 維護者在 `/req-iterate` 時正式宣告並錄影存證
- **量測方式**：
  - Usability test 以錄影 + 事後訪談方式進行
  - `/req-audit` 由 CI（或人類手動）定期執行並記錄結果於 `docs/changelog.md`
  - Dog-food milestone 由 framework 維護者在 `/req-iterate` 時宣告

## * v0.1 MVP 範圍（Scope）

本段於 v1.1 新增，明確界定「v0.1 必須交付什麼」與「v0.2+ 才做什麼」，避免 `/req-plan` 把所有 AC 一次拆成 tasks。

### ✅ v0.1 必須交付（In-scope）

1. **Chat UI 主體**：單一專案的對話式介面、白話追問 Who/What/Why 與範圍、無 jargon 的首頁
2. **Framework runtime 接入**：至少一個 Q3 選項能跑通完整的 intake → research → translate → review → plan → implement → deploy pipeline（具體哪個由 `/req-plan` 決定）
3. **Scaffolding 綁定**：至少一個技術棧組合能從對話一路生成可跑的 CRUD app（參考預設：Next.js + SQLite + shadcn，由 Q1 定）
4. **衝突仲裁面板**：能渲染並關閉 `conflicts/CONFLICT-*.md`
5. **Review 面板**：能渲染並批准 `reviews/REVIEW-*.md`
6. **Session resume**：單一機器、單一使用者，重開 wrapper 可從斷點繼續
7. **Rollback UX**：3-strike 測試失敗的白話解釋與三選項（重試 / 簡化需求 / 暫停）
8. **預覽功能**：localhost 預覽生成出的 CRUD app
9. **匯出功能**：一鍵把整個 `specs/` + 生成 `src/` 匯出為 zip / git bundle
10. **基本審計**：每次 framework call 寫入 `docs/changelog.md` 供事後 `/req-audit`

### ❌ v0.1 不做（Out-of-scope，延到 v0.2+）

1. **外網發布**（publish to public URL / 雲端部署）
2. **多使用者 / 多租戶 / auth**
3. **多技術棧自選**（v0.1 只鎖一個預設組合）
4. **Dog-fooding 自建**（v0.1 必須由人類工程師手建；v0.2 起啟用 self-host 流程）
5. **`/req-plan` / `/req-implement` / `/req-audit` 等技術面向產物的白話翻譯卡片**（Q4 預設保守「完全不讀 code」；是否延到 v0.2 由 `/req-plan` 裁決）
6. **自動 framework 升級**（v0.1 僅提供手動觸發；自動偵測新版並發通知為 v0.2 功能）
7. **多專案 session 的跨機器同步**（v0.1 專案清單只在本機）

### 🔄 有條件 in-scope（依 Q1/Q2/Q3 結果決定）

1. **Claude Code CLI bundling**：若 Q3 選 (a)，wrapper 的 installer 必須 bundle 或自動安裝 Claude Code CLI
2. **Desktop app 打包**：若 Q2 選「本地桌面 app」，v0.1 即需 Electron / Tauri 打包；若選「localhost web UI」則只需啟動腳本

---

## 開放問題（選填）

以下六題由 `/req-research` 標記為必須在 `/req-plan` 前解決。v1.1 更新 Q3 的選項描述（原 (a) 基於錯誤假設作廢）：

- [ ] **Q1 — Scaffolding stack 鎖定**：MVP 是否鎖定 Next.js + SQLite（或 Supabase）+ shadcn？或允許使用者選擇其他技術棧？
  - 本 spec 的 User Story 已隱含「CRUD 網頁應用 + demo 登入 + 瀏覽器可開」的最小承諾，但**未鎖定特定 stack**，待 `/req-plan` 決定
  - v0.1 scope 限定**只鎖一個預設組合**，自選式延到 v0.2
- [ ] **Q2 — Runtime 部署模式**：本地桌面 app（Electron / Tauri）/ 本地 CLI + 瀏覽器 UI / hosted SaaS？
  - 本 spec 的安全性需求已先假設 MVP 為 single-user local；hosted SaaS **明確排除** v0.1
  - 剩下的「桌面 app vs localhost web UI」二選一由 `/req-plan` 決定
- [ ] **Q3 — Framework 呼叫方式**（**原 (a) 選項作廢** —— submodule 初始化後於 v1.1 review 確認 framework **沒有** per-command shell script，12 個 slash command 都以 `.claude/commands/req-*.md` 形式安裝為 Claude Code 的 slash command，真正的 runtime 是 Claude Code 本身）。重寫後的三個真實選項：
  - **(a) Spawn Claude Code CLI subprocess**：wrapper 把 `claude` CLI 當 subprocess 叫起來，翻譯使用者自然語言為 `/req-*` slash command 後丟給它執行。Subagent / ExitPlanMode / hooks / permissions 全部免費繼承。成本：使用者機器需有 Claude Code CLI + Anthropic API key（由 wrapper installer 處理 bundling）
  - **(b) Claude Agent SDK re-host**：用 Claude Agent SDK 在 wrapper 內建 agent session，載入 `framework/commands/*.md` 為 system prompt、`framework/agents/*.md` 為 subagent 定義。不需 CLI binary，但要自己處理 ExitPlanMode / hooks / permissions 等細節
  - **(c) 完全自建 runtime**：LangGraph / 其他框架從零重建 12-step state machine，不綁 Anthropic。工作量最大、忠實度最低、後續 framework 升級成本最高。對應原 `/req-research` 的 Route B 建議
  - 本 spec 已將此列為 Framework 維護者 user story 的驗收條件之一（必須在 `/req-plan` 前明確決定）
  - **使用者於 v1.1 review 階段選擇：保留到 `/req-plan` 再決**
- [ ] **Q4 — 非技術使用者上限**：「完全不會讀 code」還是「會看成果但不會寫」？前者需把 `spec.md` / `tasks.md` 也翻譯成白話卡片
  - 本 spec 預設採**前者**（更保守），但技術面向產物的白話翻譯卡片已在 v1.1 MVP scope 中明確排除 v0.1，可由 `/req-plan` 依 usability test 結果決定是否拉回
- [ ] **Q5 — Dog-fooding 觸發點**：v0.1 由人類工程師手寫；v0.2 起切換為 wrapper 自建，是否正確？若否需調整 success metric 3
  - v1.1 MVP scope 已確定 dog-fooding 排除 v0.1
- [ ] **Q6 — 上游 framework 是否需要新增 programmatic API**：例如 `req --json`，讓 wrapper 不必解析 markdown
  - 若 Q3 選 (a) 則 Q6 **不需要**（Claude Code 自己處理 markdown）
  - 若 Q3 選 (b) 或 (c) 且發現輸出解析很痛，必須回頭對上游 framework 開一個獨立 intake
