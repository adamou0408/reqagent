# 💡 我有一個想法 / I Have an Idea

**我是誰 / Who am I**：Framework 維護者（adamou0408/req 本身的作者或貢獻者，想在 framework 外層加上對話式介面給非技術使用者）

**我想要 / I want**：
我想要一個app，來包裝 https://github.com/adamou0408/req 這一個framework，讓不懂程式的人也可以透過此流程，做到開發網頁應用，其中可能也需要對話框的agent角色，可以用到opensouce來修改，或者自行開發也可以。

**為什麼 / Why**：
讓不懂程式的使用者也能透過 req framework 的結構化流程做到開發網頁應用，降低技術門檻。

**補充 / Additional notes**：
- 需要對話框（chat agent）角色來引導使用者，可整合現有開源專案修改或自行開發
- 目標對象為非技術使用者（non-developers）
- 被包裝的 framework：https://github.com/adamou0408/req（本 repo 的 submodule）

**Intake 追問補充（2026-04-08 via AskUserQuestion）**：
- **應用範圍上限**：含資料庫的 CRUD app（如 todo list、小型內部工具、待辦系統等）。先不需要做到完整 SaaS 等級。
- **Agent 實作路線**：不確定 — 希望在 `/research` 階段比較 open source（例如 Open WebUI / LibreChat 等）與自行開發（Claude Agent SDK / LangGraph）的可行性與成本後再決定。
- **提交者身份**：Framework 維護者，意味著這個 wrapper app 會與 `adamou0408/req` 緊密耦合，且可能影響上游 framework 設計。

---

**Metadata**
- Date: 2026-04-08
- Source: `/intake` command
- Submitted via: Claude Code (session on branch `claude/req-framework-wrapper-0Csxz`)
- Raw input preserved verbatim above (per /intake constraint)
