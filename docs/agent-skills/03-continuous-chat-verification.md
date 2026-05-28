# Continuous Chat Verification

Guidelines to check continuous chat works.

## Flow Mechanics

Users generate reports under a guest session and submit follow-up chat prompts to revise them.

1. **Generation Endpoint**:
   - URL: `/api/reports/generate`
   - Sets the `nali_guest_session` secure cookie.
   - Saves the report with `guest_session_id_hash`.
2. **Chat Endpoint**:
   - URL: `/api/reports/chat`
   - Verifies ownership by inspecting the request cookie.
   - Appends message arrays and triggers model updates.

## Verification Steps

- **Automatic E2E Specs**: Run `npx playwright test tests/e2e/nali-continuous-chat.spec.ts`.
- **Expected Results**: The user generates a report, submits 3 chat messages, refreshes the browser, and verifies the message logs are loaded correctly in the chat panel.
- **Failures**: If database connections drop, check that the system degrades to client-side localStorage recovery without freezing.
