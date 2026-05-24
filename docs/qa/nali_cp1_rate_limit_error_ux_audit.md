# NaLI CP1 Rate Limit & Error UX Audit

This document audits the current user-facing error states, messages, and UI representation within NaLI CP1, identifying problems, mobile constraints, and proposing minor optimizations.

## 1. Existing Error States & Messages

The codebase currently yields these primary error scenarios:

| Scenario | Code/Status | Current Frontend Display / Copy | Target UX / Safe Categorization |
|---|---|---|---|
| **Rate Limit** | `429` | `"Terlalu banyak percobaan. Coba lagi beberapa saat lagi."` | `RATE_LIMIT` |
| **Abuse Block** | `400` / `FAKE_CITATION_REQUEST` | `"Hasil diblokir karena terdeteksi kata-kata yang melanggar integritas..."` | `INTEGRITY_BLOCK` |
| **Weak Materials**| `400` / Local check | `"Masukkan minimal satu bahan dulu: catatan..."` | `WEAK_INPUT` |
| **Export Locked** | `402` / `insufficient_credits` | `"Kredit energi Anda tidak cukup."` / `"Pembayaran ekspor premium..."` | `EXPORT_LOCKED` |
| **Unauthorized** | `401` / `403` | `"Laporan tidak ditemukan atau akses tidak sah."` | `UNAUTHORIZED` |
| **System/Network**| `502` / Network timeout | `"Koneksi ke server gagal. Coba lagi setelah jaringan stabil."` | `NETWORK_OR_SERVER` |

---

## 2. Identified Problems & Mobile Risks

1. **Direct Raw Output Display**: 
   The frontend UI directly renders `payload.error` as a string. If the server throws a database or openrouter crash (e.g. stack traces, key leakages, internal JSON keys), the user is exposed to raw developer jargon.
2. **Poor Mobile Readability & Layout**:
   Standard alert boxes use small paddings and simple styles. When long Indonesian sentences or raw errors appear, they can easily cause overflow-x bugs on 360px wide viewport screens.
3. **No Dynamic Retry Assistance**:
   Exceeded rate limits (`429`) include a `Retry-After` header and `retryAfterSeconds` metric on the backend, but the frontend ignores it, giving the user no guidance on when they can type again.
4. **Export Misunderstandings**:
   When Midtrans is deferred, unlocking PDF states display payments error cues without stating that payments are deferred on purpose in this beta version.

---

## 3. Proposed Fixes

1. **Structured Error Component (`NaliAlert.tsx`)**:
   Implement a clean, glassmorphic responsive alert banner component supporting variants (`info`, `warning`, `error`, `success`, `locked`). Incorporate accessible roles (`role="alert"` or `aria-live`).
2. **Error Normalization Handler**:
   Use `normalizePublicError` in all catch blocks and API fetch flows to translate codes/status numbers into user-friendly Indonesian titles, explanations, and actionable next steps.
3. **Expose Countdown Timers**:
   Leverage the `retryAfterSeconds` payload returned by the rate limit endpoint, letting the user know they can resubmit in a specific number of seconds rather than spamming refresh.
