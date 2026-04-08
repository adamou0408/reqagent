# req Framework 對話式包裝 App（req-framework-wrapper-app）

> **欄位標記說明**：標題前有 `*` 為**必填**段落（即使結論是「無」也要明確寫出）；標題後標 `（選填）` 為視情況補充。

## * 狀態：`draft`

## * 版本歷史

| 版本 | 日期 | 變更摘要 | 觸發者 |
|------|------|----------|--------|
| v1.0 | 2026-04-08 | 初始版本，由 `/req-translate` 從 intake + research 轉譯 | /req-translate |

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
  - 外部依賴：`adamou0408/req` framework 本身（本 repo 已以 submodule 形式掛在 `.req-framework/`，但**尚未初始化**；實作前需先 `git submodule update --init`）
  - 無其他本 repo 內的前置 spec（這是 `./specs/` 的第一個 feature）
- **後續需求**：無（本 spec 是後續所有 wrapper 功能的 parent spec；細部能力會在日後以獨立 spec 展開）
- **共享資源**：無（首個 feature，尚無可共享的元件）

## * 需求摘要

打造一個對話式網頁 app，作為 `adamou0408/req` framework 的非技術使用者入口：使用者在 chat UI 中用自己的話描述想做的網頁應用，由一個 conversational agent 角色引導走完 req framework 的結構化流程（intake → research → translate → plan → implement → deploy），最終產出一個可實際運行的 **CRUD 級網頁應用**（含資料庫）。MVP 範圍不含完整 SaaS 等級的 auth / multi-tenant。Agent 實作路線由 `/req-research` 建議採 **Route B 自建（LangGraph backend + 自寫 Next.js chat UI）**，備案 **Chainlit**。

## * 使用者故事

### Framework 維護者

- **作為** framework 維護者，**我想要** 一個對話式 wrapper app 把 `adamou0408/req` 的 12 個 slash command 對非技術使用者隱藏起來，**以便** 讓不懂 Claude Code / git / CLI 的人也能走完 req 流程並產出可用的 CRUD web app，同時保留 framework 原有的 traceability 與結構化紀律。
- **驗收條件**：
  - [ ] Wrapper app 能將 req framework 的每一個 slash command 映射為 chat agent 的一個 step（或 step group），且每一步都能在 UI 上顯示目前進度（例如「第 3 步 / 共 12 步：整理你的需求」）
  - [ ] Wrapper app 在每個 step 產生的檔案（`intake/raw/*.md`、`specs/{slug}/research.md`、`spec.md`、`plan.md`、`tasks.md`、`personas/*.md`）都寫在與 framework 約定一致的路徑，並可於事後被人類用 `/req-audit` 驗證 drift
  - [ ] Wrapper app 與 framework 的呼叫方式（subprocess shell scripts vs. 讀 `framework/commands/*.md` 作為 prompt）**在 `/req-plan` 階段之前明確決定**，並在本 spec 的 Open questions 被回答後記錄於 `plan.md`
  - [ ] Wrapper app 在 v0.1 可由人類工程師手動完成 bootstrap，**不**要求必須用 wrapper 自己建 wrapper
  - [ ] Wrapper app 允許維護者在不離開 chat UI 的情況下，查看並手動仲裁衝突（對應 `/req-detect-conflicts` / `/req-resolve-conflict`）

### 非技術使用者 / Non-technical Builder

- **作為** 非技術使用者，**我想要** 在一個 chat 介面用自己的話描述我想做的網頁應用，並被 agent 引導一步步補齊細節，**以便** 最後能拿到一個真的可以在瀏覽器裡打開、能讀寫資料庫的 CRUD 網頁應用，整個過程不需要我打開 terminal、安裝開發工具、或看任何 markdown / code。
- **驗收條件**：
  - [ ] 使用者在 chat UI 第一個畫面只看到一個輸入框與友善的開場白，**不**出現 `/intake`、`spec.md`、`persona` 這類 jargon
  - [ ] 使用者在描述需求後，agent 會用**自然語言**（非 slash command）追問 Who / What / Why 與必要的範圍問題
  - [ ] 使用者能在一個 review 卡片上看到「agent 對我的需求的理解」，並可按「確認」或「我想改一下」（對應 `/req-review` 的 approve / reject）
  - [ ] 使用者可以在任何 step 輸入「我想改前面說過的 X」，wrapper 會正確觸發 `/req-iterate` 而不是從頭來過
  - [ ] 使用者最後按一個「發布 / 預覽」按鈕，能在瀏覽器開啟一個可實際使用的 CRUD 網頁應用（至少包含：登入一個內建 demo 帳號、建立 / 編輯 / 刪除 / 查看資料表中的紀錄）
  - [ ] 任何錯誤訊息（包含底層 `/req-implement` 的測試失敗）都會被翻譯為白話，並提供「讓 AI 自己再試一次」的按鈕，而不是讓使用者看到原始 stack trace
  - [ ] 整個流程完成前不要求使用者安裝任何本地工具（wrapper 本體可為本地桌面 app 或 localhost web UI，但對使用者而言只要點一下就能開）

## 衝突標記（選填）

- ⚠️ **CONFLICT-001（未解決，severity: medium）**：**Framework 維護者**希望保留 `/req-review`、`/req-detect-conflicts` 這類結構化 checkpoint 的強制性與可仲裁性；而**非技術使用者**希望「想到什麼改什麼、不要被問太多、不要看到 jargon」。經 `/req-detect-conflicts` 評估，這條張力被兩個 persona 文件各自獨立列為 top concern，且會影響 `/req-plan` 的 state machine 設計與 UI 元件清單，已正式記錄為 [`conflicts/CONFLICT-001.md`](../../conflicts/CONFLICT-001.md)，待 `/req-resolve-conflict` 由人類仲裁。
- 其他衝突：無（目前僅兩個 persona，其他潛在張力已被 research.md 的 Open questions 涵蓋）

## * 非功能需求

- **效能**：
  - 單一 chat message 的 agent 回應 P50 ≤ 4 秒、P95 ≤ 10 秒（streaming 起始）
  - 從使用者第一次描述需求到拿到可預覽的 CRUD app，happy path 總時長 ≤ 30 分鐘（MVP 目標）
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

- **目標 1**：一位完全不會寫 code 的測試使用者，能在 ≤ 60 分鐘內獨立（無工程師協助）完成一個 todo list CRUD app 並在瀏覽器打開使用（measurable：以 3 位受試者做 usability test，成功率 ≥ 2/3）
- **目標 2**：Wrapper 產生的 `specs/{slug}/*.md` 通過 `/req-audit` 檢查、與對應 `src/` drift 為 0（measurable：`/req-audit` 在每個 milestone 的自動執行結果）
- **目標 3**：從 v0.2 起，wrapper 自身的下一個 feature 可完全由 wrapper 自己的流程完成（dog-food milestone；measurable：一個 `intake/` 檔從 `/req-intake` 到 `/req-deploy` 完全透過 chat UI 觸發）
- **量測方式**：
  - Usability test 以錄影 + 事後訪談方式進行
  - `/req-audit` 由 CI（或人類手動）定期執行並記錄結果於 `docs/changelog.md`
  - Dog-food milestone 由 framework 維護者在 `/req-iterate` 時宣告

## 開放問題（選填）

以下六題由 `/req-research` 標記為 `/req-translate` 階段必須解決，但本 spec **僅部分凍結**，其餘交給 `/req-review` 與 `/req-plan` 決定：

- [ ] **Q1 — Scaffolding stack 鎖定**：MVP 是否鎖定 Next.js + SQLite（或 Supabase）+ shadcn？或允許使用者選擇其他技術棧？
  - 本 spec 的 User Story 已隱含「CRUD 網頁應用 + demo 登入 + 瀏覽器可開」的最小承諾，但**未鎖定特定 stack**，待 `/req-plan` 決定
- [ ] **Q2 — Runtime 部署模式**：本地桌面 app（Electron / Tauri）/ 本地 CLI + 瀏覽器 UI / hosted SaaS？
  - 本 spec 的安全性需求已先假設 MVP 為 single-user local；確切 runtime 形式待 `/req-plan`
- [ ] **Q3 — Framework 呼叫方式**：(a) subprocess 執行 `.req-framework/framework/scripts/*.sh` vs. (b) 讀 `framework/commands/*.md` 當作 prompt 讓 wrapper 自己的 LLM 重放語意
  - 本 spec 已將此列為 Framework 維護者 user story 的驗收條件之一（必須在 `/req-plan` 前明確決定）
- [ ] **Q4 — 非技術使用者上限**：「完全不會讀 code」還是「會看成果但不會寫」？前者需把 `spec.md` / `tasks.md` 也翻譯成白話卡片
  - 本 spec 預設採**前者**（更保守），但 `/req-plan` 可依 usability test 結果放寬
- [ ] **Q5 — Dog-fooding 觸發點**：v0.1 由人類工程師手寫；v0.2 起切換為 wrapper 自建，是否正確？若否需調整 success metric 3
- [ ] **Q6 — 上游 framework 是否需要新增 programmatic API**：例如 `req --json`，讓 wrapper 不必解析 markdown。本 spec **不**強制，但若 `/req-plan` 發現 Q3 選 (a) 會卡在輸出解析上，必須回頭對上游 framework 開一個獨立 intake
