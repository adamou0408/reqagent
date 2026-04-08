# Framework 維護者 / Framework Maintainer

## 基本描述
- **誰是這個角色**：`adamou0408/req` framework 的作者或核心貢獻者，同時負責推動這個 wrapper app 的落地。對 shell script、markdown-driven workflow、Claude Code runtime、git submodule 等概念非常熟悉。
- **主要職責**：
  - 維護 req framework 的 12 個 slash command 與對應模板
  - 設計 wrapper app 與 framework 之間的呼叫介面（subprocess / prompt replay / JSON API）
  - 在 wrapper app 尚未成熟前，**親自實作 v0.1**（bootstrap 階段）
  - 評估 wrapper app 的需求是否要反向影響上游 framework 設計
- **技術熟悉度**：熟練（shell、markdown workflow、LLM agent、CLI tooling 皆能 hands-on）
- **使用頻率**：每天（wrapper app 就是他的主要工作產物之一）

## 核心需求
- **最在乎**：
  - Wrapper 的 agent runtime 能忠實重現 framework 原本在 Claude Code 裡的行為（語意保真度）
  - Wrapper 與 framework 之間**耦合度可控**，升級 framework 不會一次炸掉整個 wrapper
  - Dog-fooding 路徑清楚 —— v0.2 之後能用 wrapper 開發 wrapper 自己
  - 非技術使用者真的能在不看 CLI 的情況下完成一個 CRUD app
- **最怕**：
  - Wrapper 因為追求「對話感」而偷偷繞過 framework 的結構化 flow，導致 spec/plan/implement 的 traceability 崩壞
  - 使用者被 hidden prompt 搞混、不知道自己現在在哪個 step
  - 為了一週 PoC 選了難以後續替換的 open source 方案，最後變成技術債
  - Framework 層與 wrapper 層的需求變更互相拉扯，卻沒有地方記錄雙向衝突
- **典型工作場景**：
  - 在本 repo 的 `claude/req-framework-wrapper-*` 分支上 hands-on 寫 code
  - 在 wrapper 的 chat UI 中 walk through 非技術使用者的流程，驗證每一個 step
  - 把發現的問題回寫到 `adamou0408/req` 的 framework commands 或 templates
  - 需要決定某個需求「屬於 wrapper 還是屬於 framework」

## 與其他角色的關係
- **會和哪些角色互動**：
  - 非技術使用者（Non-technical builder）—— 觀察他們使用 wrapper 的過程、蒐集痛點
  - 對話式 agent（系統角色，非 persona）—— 設計它的 prompt / state machine / tool 介面
- **常見的利益衝突點**：
  - 想加在 wrapper 的功能 vs. 該加在 framework 本身（層次歸屬衝突）
  - 對話 UX 的靈活度 vs. req flow 的結構化強制性（例如「使用者想跳過 /review 直接 /implement」該不該擋）
  - 技術選型的長期彈性（自建）vs. PoC 速度（Chainlit 等）
