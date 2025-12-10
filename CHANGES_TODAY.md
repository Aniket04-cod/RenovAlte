# RenovAlte - Changes Made Today (22 Nov 2025)

This file documents all code and config changes made today, with explanations for each.

---

## 1. Frontend: constants alignment
**File:** `frontend/src/utils/constants.ts`
- Updated all option values to match backend serializer choices exactly (e.g., `heating_system_type`, `insulation_type`, `window_type`, `neighbor_impacts`, etc.).
- **Why:** Prevents 400 errors due to invalid choice values sent to backend.

## 2. Frontend: Add heritageProtection to plan data
**File:** `frontend/src/pages/Planning/ProjectSetupWizard.tsx`
- Added `heritageProtection` to the `planData` object sent to `onGeneratePlan`.
- **Why:** Backend requires `heritage_protection` field; missing it caused validation errors.

## 3. Frontend: Correct mapping for heritage_protection
**File:** `frontend/src/pages/Planning/Planning.tsx`
- Changed payload mapping to send `heritageProtection` as `heritage_protection` (was incorrectly sending `neighborImpact`).
- **Why:** Ensures backend receives correct field; fixes required field error.

## 4. Frontend: Omit null/undefined optional fields
**File:** `frontend/src/pages/Planning/Planning.tsx`
- Changed payload construction to only include optional fields if they have values (do not send as `null`).
- **Why:** DRF ChoiceFields with `required=False` but not `allow_null=True` reject `null` values; omitting fixes 'may not be null' errors.

## 5. Frontend: Add payload and error logging
**File:** `frontend/src/pages/Planning/Planning.tsx`
- Added `console.log` for both object and JSON string of request payload.
- Improved error handling to log API error responses.
- **Why:** Makes debugging request/response easier and faster.

## 6. Backend: Add debug logging for request data and serializer errors
**File:** `backend/core/api/planning_work/views.py`
- Added logging of incoming request data and serializer errors before validation.
- **Why:** Allows quick diagnosis of which fields/values are invalid or missing.

## 7. Backend: (Planned, not yet applied) Harden GeminiService
**File:** `backend/core/api/planning_work/services.py`
- Plan to guard optional SDK imports, remove hard-coded API key, lazily initialize model, and fall back to `MockGeminiService` if key/SDK missing.
- **Why:** Prevents server crashes if SDK/key missing, avoids secrets in source, and makes backend robust for dev/prod.

## 8. General: Testing and validation
- Restarted backend and frontend servers after each change.
- Used browser DevTools (Console and Network tabs) and backend logs to validate fixes.
- **Why:** Ensures changes work and errors are resolved.

---

**Summary:**
These changes fixed the main API validation errors, ensured frontend and backend are aligned, and improved debugging. The app now generates plans successfully for valid inputs. Remaining: harden backend GeminiService for production robustness.

---

## 9. Backend: Performance optimizations (fast model, caching, timeout, compact prompt)
**File:** `backend/core/api/planning_work/services.py`
- Removed hard-coded API key usage; now reads `GEMINI_API_KEY` from env. Defensive import of `google-generativeai`.
- Added fast/pro model selection via env (`AI_FAST_MODEL`, `AI_PRO_MODEL`, `AI_QUALITY_DEFAULT`), defaults to fast.
- Implemented file-based caching in `.cache/` keyed by normalized request payload.
- Added hard timeout (`AI_TIMEOUT_MS`, default 12000 ms) and graceful fallback plan on timeout.
- Logged timings for prompt build, LLM call, parse, and total.
- Slimmed and clarified the prompt to reduce tokens while preserving schema rules.
- Returned `cached` and `timings` fields in the service result for observability.
- **Why:** Reduce latency and cost, improve reliability and debuggability without new infrastructure.

## 10. Backend: Pass optional quality flag from API
**File:** `backend/core/api/planning_work/views.py`
- Forwarded optional `quality` from request body to the service to allow `fast | pro | auto` selection per request.
- **Why:** Enables hybrid strategy (fast by default, pro when explicitly requested).

## 11. Backend: Lightweight RAG + pro escalation
**File:** `backend/core/api/planning_work/services.py`
- Added a small built-in knowledge base and `_rag_context()` to select 3–5 goal-aware bullets.
- Injected a compact "Context (RAG hints)" section into the prompt via new `rag_context` parameter.
- Added one-shot "pro" escalation when quality is `auto` and the parsed plan looks weak (phases/gantt not exactly 6).
- Annotate timings with `escalated: true` when pro retry succeeds.
- **Why:** Improve relevance and consistency without introducing external infra or large token cost.
