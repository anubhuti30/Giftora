# Engineering changelog

## 2026-11-08

- Hardened Gemini extraction with structured Pydantic validation, safe fenced-JSON parsing, per-field normalization, and deterministic fallbacks that do not manufacture budgets or preferences.
- Added resilience coverage for malformed, empty, partial, mistyped, reversed-budget, timeout, quota-failure, and unexpected-structure responses.
- Added production configuration validation for JWT secrets, debug mode, and CORS origins.
- Corrected health/readiness evaluation so database failures are observable and return HTTP 503.
- Added consistent API envelopes for validation, database, and unexpected server errors.
- Made frontend hydration lint-compliant and removed unused icon/data imports.
- Removed remote Google-font build dependency, using system fallback stacks so restricted CI can compile without a network trust store.
- Configured Turbopack’s root explicitly to avoid an ancestor lockfile being selected.
- Restored validated Gemini match-explanation generation with a short timeout, a bounded transient retry, strict product-ID filtering, and deterministic verified-data-only fallback.
- Removed fabricated planner defaults and the budget-filter bypass; results now respect explicit budget ceilings.
- Added ownership checks for recipient/conversation references in search, chat, and occasion writes.
- Made authenticated search persistence transactional: marketplace sources are upserted by provider identity, prices are snapshotted, and persistent IDs are returned for downstream wishlist/comparison actions.
- Connected the discovery results page to the saved backend search response; local catalog data is now a visible fallback only when the API cannot load results.
