# Audit: NaLI CP1 Debounced Input Validation

This document audits the client-side and server-side input validation mechanisms for NaLI CP1 Sprint 0.7.

## Current Validation Behavior

Before this sprint, NaLI performed immediate synchronous check checks inside the component `handleSubmit` function:
1. **Empty State Check (Form)**:
   - For `draft_from_materials`, it checked if any material existed (catatan, lokasi, URL, or ringkasan).
   - For `start_from_zero`, it checked if `mainText` was non-empty.
2. **Consent Check (Form)**:
   - Checked if the academic integrity checkbox `integrityConsent` was ticked.
3. **Empty State Check (Composer/Chat)**:
   - Synchronous blank checks on submitting follow-up inputs.

## Gaps Identified

1. **Immediate Execution/Typing Lag**:
   - Running complex regex checks on every keypress causes performance lag, especially on resource-constrained mobile viewports.
2. **No Evasion Block**:
   - The client side did not check for academic-cheating evasion terms ("bypass turnitin", "buat data palsu", "humanizer", etc.) before hitting the server.
3. **No Bad URL Validation**:
   - Users could input malformed URLs (e.g. text instead of full http/https URLs) and send them to the API, causing server or model errors.
4. **Unsupported Features warnings**:
   - Users trying to request file uploads or paid exports in the prompt fields weren't guided on the client side, causing downstream server rejection.
5. **No Warning for Weak Input**:
   - Short/weak user inputs (e.g., between 15-40 characters) were passed straight to the model without warning that the output quality will be minimal.

## Safe Client-Side Validation Scope

To provide an optimal UX, client-side validation should:
1. **Hard Block**:
   - Empty input.
   - Too short input (< 15 chars for form, < 4 chars for composer).
   - Repeated characters/spam pattern.
   - Academic cheating keywords.
   - Malformed URLs (invalid format).
   - Missing integrity consent.
2. **Warning / Guide (No Block)**:
   - Weak beginner input (15 - 40 characters).
   - Overlong inputs (> 6,000 characters).
   - Inquiries about inactive features (uploads, source lookups, payments).

## What Must Remain Server-Side

- **Authoritative Integrity Filtering**:
  - The server must run its own strict sanitization rules to block abuse because client-side state can be bypassed by manual API calls.
- **Rate Limiting**:
  - Requires Redis/database-backed IP/session key counting.
- **Provider Error Diagnostics**:
  - Inspecting upstream AI provider connection resets or outages.

## Performance Risks & Solutions

- **Risk**: Expensive regex/patterns loops run on huge text blocks.
  - *Solution*: Pre-guard checks using length limits. Clamp main text scanning, and use a debounced wrapper (300-600ms) to ensure validation only triggers after the user pauses typing.

## Recommended Minimal Implementation

- **Helper module**: `src/lib/reports/inputValidation.ts` exporting pure, synchronous, deterministic functions.
- **Debounce hook**: `src/lib/reports/useDebouncedValidation.ts` using `setTimeout` to debounce status calculation and correctly cleaning up timers on component unmount.
- **Aesthetic Alert Integration**: Use the custom `NaliAlert` component to display validation alerts directly beneath inputs.
