# Changelog

This file logs every spec state transition. Auto-updated by /req-* commands.

## 2026-04-08
- Project initialized via req-init.sh
- `intake`: created `intake/raw/2026-04-08-req-framework-wrapper-app.md` via `/req-intake`
- `research`: created `specs/req-framework-wrapper-app/research.md` via `/req-research` (feasibility: Yellow, no duplicates)
- `translate`: created `specs/req-framework-wrapper-app/spec.md` v1.0 (status `draft`) via `/req-translate`; personas `framework-maintainer` and `non-technical-builder` created (both new, source: human)
- `detect-conflicts`: `specs/req-framework-wrapper-app/spec.md` → 1 conflict detected; `conflicts/CONFLICT-001.md` created (severity: medium)
- `spec edit`: `specs/req-framework-wrapper-app/spec.md` bumped to v1.1 after human deep review — fixed Q3 options (original (a) invalidated by submodule inspection), relaxed performance NFR, added 6 new ACs, added v0.1 MVP scope section
- `personas sync`: `personas/framework-maintainer.md` and `personas/non-technical-builder.md` scenarios synced to spec v1.1 ACs
- `resolve-conflict`: `conflicts/CONFLICT-001.md` status `未解決` → `resolved` via `/req-resolve-conflict`. Decision: **(D) 逐 checkpoint 分類 + 默認強制**. Decider: Framework 維護者 (human checkpoint via AskUserQuestion). Reasoning: **與 framework AGENTS.md §5 的 HARD/SOFT + strict/balanced/auto 分類同構**. Follow-up: checkpoint surfacing policy table to be produced in `/req-plan`.
- `review`: `specs/req-framework-wrapper-app/spec.md` v1.1 status `draft` → `in-review` → **`approved`** via `/req-review`. Reviewer: Framework 維護者 (solo self-review). All 15 checklist items marked `[x]`; 4 open questions (Q1/Q2/Q3/Q6) accepted as structured deferral to `/req-plan`. Review record: `reviews/REVIEW-req-framework-wrapper-app-2026-04-08.md`. Spec ready for `/req-plan`.
