# NaLI CP1 Rate Limit & Error UX — Operations Runbook

## Overview
This runbook provides guidelines for operating and debugging client-side error states, rate limits, and integrity block behaviors in NaLI CP1.

---

## 1. Rate Limit Triggers (429 Status)
- **Endpoint**: `/api/reports/generate`, `/api/reports/chat`
- **Behavior**: Returns `429` status code, sets `Retry-After` header, and yields JSON:
  ```json
  {
    "error": "Kamu telah mengirimkan terlalu banyak kueri.",
    "code": "RATE_LIMIT",
    "retryAfterSeconds": 30
  }
  ```
- **UI State**:
  1. Composer/submit buttons are disabled.
  2. A glassmorphic `NaliAlert` is rendered with an amber warning layout.
  3. A pulsing countdown badge (e.g. `[ 30s ]`) displays next to the title.
  4. Once `retryAfterSeconds` hits `0`, a `"Coba Lagi"` button appears to let the user resubmit.

---

## 2. Integrity Block Triggers (400 / Specific Code)
- **Trigger**: Server blocks requests trying to generate fake citations, plagiarism evasion, academic cheating, or fake data.
- **UI State**:
  1. Glassmorphic red error `NaliAlert` displays explaining academic integrity policies.
  2. A `"Ubah Materi"` action button is provided.
  3. Clicking the button clears the error state and refocuses the composer/text input.

---

## 3. Network or Server Errors (5xx Status / Fetch Failure)
- **Trigger**: Server offline or network connection dropped.
- **UI State**:
  1. Red error alert is rendered.
  2. A `"Coba Lagi"` action button is immediately displayed (no countdown).
  3. Clicking retry resubmits the last query.

---

## 4. Verification Check
To run local verification of rate limits and error mappings:
```bash
# Run public errors and mapping suite
node --test tests/reports/rate-limit-error-ux.test.cjs
```
