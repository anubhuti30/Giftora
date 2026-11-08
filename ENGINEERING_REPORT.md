# Engineering report

## Completed improvements

- **AI reliability:** Gemini responses now pass through a strict schema boundary. Empty, malformed, non-object, unavailable, quota, and timeout responses activate a deterministic fallback. Invalid fields become unknown instead of guessed; valid fields from a partial response are retained.
- **Security/configuration:** production startup now rejects the known development secret, short secrets, enabled debug mode, and an empty configured CORS origin list.
- **Backend correctness:** the health endpoint now evaluates the actual database connection flag and returns 503 when unavailable. Central handlers provide predictable validation, database, and internal-error payloads.
- **Frontend quality:** fixed all reported lint violations, eliminated remote-font compilation dependency, and set an explicit Turbopack root.
- **Persistence and integration:** authenticated searches now write an atomic search session, provider-identified product-source records, recommendation records, and price snapshots. The results page reads that saved search instead of silently replacing it with the mock catalogue.

## Verification

| Check | Result |
| --- | --- |
| `python -m pytest --collect-only -q tests` (from `backend`) | Passed: 17 tests collected. |
| `python -m pytest tests/test_ai_resilience.py -q` | Passed: 5 resilience tests. The full suite exceeds this environment's 30-second command window while probing the unavailable local MySQL service. |
| Focused backend suite (`AI resilience`, `AI agent`, `ranking`) | Passed: 11 tests. |
| `npm run lint` | Passed. |
| `npx next build --webpack` | Production assets/manifests generated after the font change. |
| `npm run build` (Turbopack) | Unresolved environment/toolchain failure: Next 16.4.5 exits its CSS worker before connection on this Windows host. This is reproducible even outside the sandbox. |
| Database migration verification | Not runnable: the project has no Alembic revision files and no configured local MySQL instance supplied to the audit. |

## Remaining limitations

- Amazon, Flipkart, and Myntra are mock-only connector implementations; configured credentials currently do not enable live searches.
- No versioned Alembic migration history exists. `database/schema.sql` contains destructive `DROP TABLE` statements and must not be used against production data.
- Search persistence still creates placeholder catalog records and catches errors without returning an explicit persistence failure.
- `/inspiration` and `/videos` are linked by UI components but have no route pages.
- The frontend retains demo/local-storage state for several resources, so it is not yet fully backend-authoritative.

## Files changed

- `backend/app/services/ai_service.py` — validated AI extraction and safe fallback behavior.
- `backend/tests/test_ai_resilience.py` — failure-mode coverage.
- `backend/app/core/config.py`, `backend/app/main.py`, `backend/app/api/routes/health.py` — deployment validation, CORS, exception envelopes, readiness correctness.
- `src/app/layout.tsx`, `src/app/globals.css`, `next.config.ts` — reproducible frontend build behavior.
- `src/components/layout/*`, `src/context/*` — lint-compliant client hydration.
- `README.md`, `AUDIT_REPORT.md`, `ENGINEERING_CHANGELOG.md`, `ENGINEERING_REPORT.md` — accurate capabilities, audit findings, and verification record.
