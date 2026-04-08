# CONFLICT-001: 結構化 checkpoint 強制性 vs. 自由流動的對話編輯

## 狀態

已解決（resolved）

## 涉及 Spec

- [`specs/req-framework-wrapper-app/spec.md`](../specs/req-framework-wrapper-app/spec.md)

## 涉及角色

- [`personas/framework-maintainer.md`](../personas/framework-maintainer.md)
- [`personas/non-technical-builder.md`](../personas/non-technical-builder.md)

## 衝突描述

兩個 persona 對「req flow 中的 checkpoint（特別是 `/req-review` 與 `/req-detect-conflicts`）應該多顯眼、多強制」有結構性的對立期望，且雙方各自的 persona 文件都把這條張力列為自己的 top concern。

**Framework 維護者側**（`personas/framework-maintainer.md`）：
- 「最怕」之一：**「Wrapper 因為追求『對話感』而偷偷繞過 framework 的結構化 flow，導致 spec/plan/implement 的 traceability 崩壞」**
- 「常見的利益衝突點」明列：**「對話 UX 的靈活度 vs. req flow 的結構化強制性（例如『使用者想跳過 /review 直接 /implement』該不該擋）」**
- 對應 `spec.md` 第 49 行驗收條件：「Wrapper app 允許維護者在不離開 chat UI 的情況下，**查看並手動仲裁衝突**（對應 `/req-detect-conflicts` / `/req-resolve-conflict`）」 — 隱含 checkpoint 必須以可見、可介入的形式 surface。

**非技術使用者側**（`personas/non-technical-builder.md`）：
- 「最在乎」之一：「能**修改**自己之前說過的話，而不會害怕打壞已經做好的部分」
- 「常見的利益衝突點」明列：**「希望『快速看到成果』vs. 維護者希望『先確認 spec / conflict 再實作』的結構化流程」**、「希望『想到什麼改什麼』vs. 系統需要『維持 traceability』的紀律」、「希望『不要問太多問題』vs. AI 需要『問到足夠資訊』才能產出可跑的 app」
- 對應 `spec.md` 第 55 行驗收條件：「使用者在 chat UI 第一個畫面只看到一個輸入框與友善的開場白，**不**出現 `/intake`、`spec.md`、`persona` 這類 jargon」
- 對應 `spec.md` 第 58 行驗收條件：「使用者可以**在任何 step** 輸入『我想改前面說過的 X』，wrapper 會正確觸發 `/req-iterate` 而不是從頭來過」

**衝突焦點**：若把所有 12 個 slash command 都 surface 為 review 卡片（滿足維護者的 traceability / 仲裁需求），會違反「不出現 jargon、不要問太多」的非技術使用者承諾；反之若把多數 checkpoint 改為背景靜默執行（滿足使用者的流暢感），維護者最怕的「偷偷繞過 framework 的結構化 flow」就會發生。這條張力會直接影響 `/req-plan` 階段的 state machine 設計與 UI 元件清單，不只是文案調整。

## 嚴重度

medium

理由：
- 不是 hard blocker（技術上可同時滿足，但需要明確的 surfacing policy）
- 影響範圍橫跨 UX、state machine、traceability 三層設計，不是單一 UI 細節
- 兩個 persona 各自的 persona 文件都獨立地把這條張力列為 top concern，並非 spec 起草時偶然產生的措辭問題
- 在 strict autonomy 下，沒有人類仲裁前不應由 agent 單方面選邊

## 建議解決方向

由 framework 維護者在 `/req-resolve-conflict` 階段做出政策層裁決，建議產出一份「checkpoint surfacing policy」表格，逐一標註 12 個 slash command：

1. **必須 surface（hard checkpoint）**：建議至少包含 `/req-review`（spec 核可）、`/req-resolve-conflict`（衝突仲裁）、`/req-deploy`（發布前最後確認）— 對應使用者可理解的卡片形式（「請確認 AI 對你的需求的理解」、「有兩個想法打架了，你想選哪個？」、「準備發布」）。
2. **背景靜默執行，但保留 audit log**：建議包含 `/req-research`、`/req-detect-conflicts`、`/req-audit` — 結果僅在「有發現」時才 surface 為卡片，平常只寫進 `docs/changelog.md`。
3. **使用者觸發的 escape hatch**：對應 `/req-iterate`，由「我想改前面說過的 X」這類自然語句觸發，無須使用者知道指令名稱。
4. 在 `spec.md` 的非功能需求或 UX 段落中新增一條：「checkpoint surfacing policy 由 `/req-plan` 階段的 state machine 設計文件正式定義，並回寫到本 spec 的 v1.1。」
5. 同步更新兩個 persona 的「常見的利益衝突點」段落，註明此衝突已透過分層 surfacing policy 解決，避免後續 spec 重複踩到。

## 對應的 spec 段落

- `specs/req-framework-wrapper-app/spec.md` 第 63–66 行的「衝突標記（選填）」段落（⚠️ 標記）
- 相關驗收條件：第 49 行（維護者 AC：手動仲裁衝突）、第 55 行（使用者 AC：無 jargon 開場）、第 58 行（使用者 AC：任何 step 都可改）

## 決策記錄

| 欄位 | 內容 |
|---|---|
| **選擇方案** | **(D) 逐 checkpoint 分類 + 默認強制** |
| **決策者** | Framework 維護者（intake 提出者；本次 review 以人類身份透過 AskUserQuestion 裁決） |
| **決策日期** | 2026-04-08 |
| **決策管道** | `/req-resolve-conflict ./conflicts/CONFLICT-001.md` 的 HARD checkpoint AskUserQuestion |
| **核心理由** | **與 framework AGENTS.md §5 的分類同構** —— HARD/SOFT checkpoint 加上 strict/balanced/auto 三個 autonomy level 已經是同一分層思路，wrapper 只需建立對應的 UI surfacing 層，不發明新概念，不犧牲任何一個 persona 的核心需求 |

### 方案 (D) 的實作意涵

12 個 slash command 會在 `/req-plan` 階段逐一歸為以下三類之一：

1. **必須 surface 為使用者可見卡片**（對應 framework 的 HARD checkpoint）
   - 預期至少包含：`/req-review`（spec 核可，使用者看到「請確認 AI 對你需求的理解」）、`/req-resolve-conflict`（衝突仲裁，使用者看到「有兩個想法打架了，你想選哪個？」）、`/req-deploy`（發布前最後確認，使用者看到「準備預覽/發布」）
2. **背景執行 + 結果觸發 surface**（對應 framework 的 SOFT checkpoint；僅在「有發現」時跳卡片）
   - 預期至少包含：`/req-research`（無重複發現則靜默）、`/req-detect-conflicts`（無衝突則靜默）、`/req-audit`（無 drift 則靜默）
3. **完全背景**（純機械動作，有 log 即可）
   - 預期至少包含：`/req-translate`、`/req-intake` 的檔案寫入、`/req-autonomy` 的設定切換
4. **使用者觸發的 escape hatch**（獨立通道）
   - 由「我想改前面說過的 X」這類自然語句觸發 `/req-iterate`，使用者無須知道指令名稱

最終分類表由 `/req-plan` 階段的 state machine 設計文件正式定義，並以 checkpoint surfacing policy 表格形式回寫到 `spec.md` 的 v1.2 或 v1.3。

### 後續動作

- [x] 更新 `conflicts/CONFLICT-001.md` 狀態為 `resolved`（本次編輯完成）
- [x] 更新 `specs/req-framework-wrapper-app/spec.md` 衝突標記區 ⚠️ → ✅ 並連回本決策記錄（本次 commit 完成）
- [x] 記錄到 `docs/changelog.md`（本次 commit 完成）
- [ ] 於 `/req-plan` 階段產出完整的 checkpoint surfacing policy 表，並更新 spec 版本
- [ ] 兩個 persona 的「常見的利益衝突點」段可於 persona 下一次同步時註明此衝突已解決（非必要）
