# Giftora second-pass adversarial engineering review

Reviewed 8 November 2026. This review treated the prior engineering report as untrusted and inspected the working-tree diff, call sites, route contracts, and test assertions.

## Confirmed defects found and fixed

| Finding | Impact | Fix |
| --- | --- | --- |
| Heuristic extraction used substring matching, so unrelated words could fabricate interests (`team` → `Tea`, `booking` → `Book`). | Incorrect preference extraction after Gemini failure. | Replaced substring checks with token-boundary matching and added an adversarial regression test. |
| Search write failures raised during `flush()` were not caught by the narrow exception list. | A failed product source, recommendation, or price snapshot write could leak as a 500 instead of being rolled back and reported safely. | Catch, log, roll back, and return a 503 for every persistence exception. SQLite tests force each failure point and assert no rows survive. |
| A guest search called the backend but the result page could not retrieve its unauthenticated search session, then displayed mock data. | The app discarded real API results for guests. | Store the exact transient API result in browser session storage and use it only when the saved server result is unavailable; show a visible status message. |
| Comparison creation accepted another user’s `search_session_id`; duplicate product IDs and nonexistent source IDs were not rejected. | Broken relationship integrity and cross-user reference. | Validate unique source IDs, require every source to exist, and enforce search-session ownership. |
| The health endpoint exposed database host and port publicly. | Unnecessary infrastructure information disclosure. | Removed host and port from the public health payload. |
| Search requests could submit inverted budget bounds. | Ambiguous/empty recommendation behavior. | Added request-level validation. |

## Security findings

- Recipient ownership is checked for chat, search, and occasion creation; search-session ownership is checked for comparison creation.
- Existing recipient, wishlist-item, comparison, and conversation read/delete routes already scope queries to the authenticated user.
- Remaining: no integration test suite uses two authenticated HTTP users against the complete FastAPI app; current ownership tests exercise route functions with an isolated SQLite session.
- Remaining: bearer tokens are stored in browser `localStorage`, which is exposed to XSS. Moving to secure httpOnly cookies would be an architecture/auth-flow change and was not made in this pass.

## AI/adversarial testing

Covered: malformed JSON, empty output, wrong types, partial output, unexpected list structure, timeout/quota-like exceptions, long values, nested structures, invalid explanation IDs, and repeated deterministic fallback behavior.

The fallback leaves unknown budgets unset and no longer derives keywords from substrings. It remains intentionally heuristic: only exact supported terms explicitly present in user text are extracted.

## Transaction and persistence evidence

`tests/test_search_persistence.py` creates an isolated SQLite schema and verifies:

- two identical searches reuse the same provider-identity product source ID;
- each search gets its own search session/recommendation and price snapshot;
- forced `ProductSource`, `Recommendation`, and `PriceSnapshot` failures roll back all search rows;
- an authenticated user cannot create a comparison linked to another user’s search session.

This is application-level transaction evidence only. **MySQL verification was not possible:** no reachable MySQL test database or credentials were supplied. SQLite does not prove MySQL locking, index, collation, JSON, enum, or concurrent upsert behavior.

## Unresolved and potential defects

- There are no Alembic revision files. `database/schema.sql` is destructive (`DROP TABLE`) and cannot safely upgrade an existing database. Fresh/upgrade migration verification is therefore blocked.
- Marketplace connectors remain mock implementations even when credentials are configured; no live provider request is performed. Their mock status is not persisted as a dedicated database field, so catalog consumers cannot reliably distinguish stored mock records from live records.
- Concurrent first-time searches for the same marketplace identity can race between select and insert. The unique constraint protects integrity, but one request may receive 503 instead of retrying the select.
- The complete backend suite depends on a local MySQL connection for health tests and cannot be used as proof of database compatibility in this environment.
- Existing Pydantic v2 deprecation warnings (`class Config`) and naive `datetime.utcnow()` warnings remain.
- `/inspiration` and `/videos` are still linked in UI components without implemented routes.

## Exact verification commands and results

```powershell
# frontend repository root
npm run lint                 # passed
npx tsc --noEmit             # passed

# backend
python -m pytest tests/test_search_persistence.py tests/test_ai_resilience.py tests/test_budget_boundaries.py tests/test_ai_agent.py tests/test_ranking.py -q
# 20 passed
python -m compileall -q app  # passed
```

The prior native Turbopack production build failure remains an environment/toolchain issue on this Windows host (CSS worker startup). It was not claimed as passing here.

## Production readiness assessment

Not production-ready yet. Core AI failure handling and authenticated search persistence are materially safer, but production requires an additive Alembic migration history, a real MySQL integration test database, verified live connector implementations or an explicit mock-only production mode, and a decision on secure browser token storage.
