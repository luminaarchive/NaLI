# Quality Signals Audit: Report Quality Memory

This document audits the available and missing quality signals in NaLI CP1, defines the data sources, establishes the privacy model, and outlines the scoring strategy for the deterministic Report Quality Memory / Feedback Learning Loop.

## 1. Available Quality Signals (CP1 Sandbox/Production)

The following structured telemetry and event metadata are active in CP1 and available for deterministic analysis:

| Data Area | Source / DB Field | Telemetry / Signals | Quality Relevance |
| :--- | :--- | :--- | :--- |
| **Evidence Quality** | `reports.evidence_strength` | `"strong"`, `"high"`, `"medium"`, `"weak"`, `"low"`, `"none"` | Directly indicates report validity. High-quality inputs yield strong evidence. |
| **Failure Rates** | `reports.status` | Count of `"failed"` statuses compared to total attempts. | Indicates system reliability and prompt stability. |
| **Failure Stages** | `reports.failure_stage` | `"validation"`, `"ai_generation"`, `"integrity_filter"`, etc. | Locates where in the pipeline failure occurs. |
| **Feedback Ratings** | `feedback.rating` | Binary `"helpful"` (thumbs up) vs `"not_helpful"` (thumbs down). | Direct user satisfaction sentiment. |
| **Feedback Text** | `feedback.comment` | Friction keyword flags compiled via deterministic string matching. | Categorizes UX, wording, rate-limit, and export confusion. |
| **Usage / Cost** | `api_usage_logs.cost` | Aggregated model and provider cost metrics. | Detects cost spikes and usage anomalies. |
| **Rate Limiting** | `rate_limits.locked_until` | Count of active temporary blocks on user sessions. | Indicates automated abuse or severe workflow friction. |

---

## 2. Missing/Deferred Quality Signals (Sprint 0.5/CP2+)

The following signals are explicitly missing or deferred in CP1:
- **Live Mobile Browser Viewport Metrics**: Virtual keyboard layout overlays and touch-target collision metrics are unrecorded (requires client-side telemetry).
- **Payment Success Verification**: Since Midtrans is skipped, actual transaction state mapping (e.g. `settlement` vs `deny`) remains unverified in production.
- **Official Observation Hash Verification**: No PostGIS or H3 spatial integrity tracking is active.
- **Darwin Core Data Validator**: Institutional compliance flags are inactive.

---

## 3. Privacy Model & Sanitization

To ensure that internal monitoring data remains safe and secure for the founder console, we enforce a strict **deterministic sanitization pipeline** before any text logs or metrics are mapped into Report Quality Memory:

- **Access Token Removal**: Matches and strips patterns matching `sk-[a-zA-Z0-9_-]{24,}`.
- **Sensitive String Hashing**: Matches and replaces SHA-256 and 40+ char hex hashes with `[HASH]` tags.
- **Secrets Redaction**: Redacts instances of `guest_session_id`, `access_key`, `secret`, `token`, and `api_key` with value blocks.
- **Path Stripping**: Replaces system folder references `/Users/...` with `[PATH]` to prevent local system structure leaks.
- **Provider Concealment**: Replaces specific third-party model provider names (e.g. OpenAI, OpenRouter, Claude, GPT) with `[PROVIDER]` to protect brand integrity.

---

## 4. Scoring Strategy

Report Quality Score is computed deterministically out of 100 points:

1. **Evidence Quality (40 points max)**:
   - Strong/High: Weight `1.0`
   - Medium: Weight `0.6`
   - Low/Weak/None: Weight `0.1`
   - Score: `(Weighted Evidence Sum / Total Evaluated) * 40`

2. **Failure Rate (25 points max)**:
   - Score: `(1 - Failed Reports / Total Reports) * 25`

3. **Feedback Sentiment (20 points max)**:
   - Score: `(Helpful Feedback / Total Feedback) * 20`

4. **Friction Absence (15 points max)**:
   - Mentions of bugs, confusing wording, mobile layout, export/payment, or rate-limits reduce the remaining score.
   - Score: `(1 - Friction Mentions / Total Feedback) * 15` (Clamped at 0 minimum)
