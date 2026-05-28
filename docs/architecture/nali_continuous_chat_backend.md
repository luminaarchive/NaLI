# NaLI Workspace: Continuous Chat & Report Revision Architecture

This document specifies the technical design, data flows, and security measures supporting real continuous chat and iterative report revision inside the NaLI Nature & Evidence Intelligence platform.

## Architecture Diagram

The continuous chat engine coordinates data synchronization between the stateless client composer and the secure server database using cryptographically hashed access tokens:

```
┌────────────────────────────────┐       Initial Submit       ┌───────────────────────────────┐
│       HomeQueryBox.tsx         ├───────────────────────────>│ POST /api/reports/generate    │
│  (Homepage search box input)   │                            │ (Integrity Audit & neutral LLM│
└────────────────────────────────┘                            │   Mock/OpenRouter generator)  │
                                                              └──────────────┬────────────────┘
                                                                             │
                                                                             │ Returns Report + Access Token
                                                                             ▼
┌────────────────────────────────┐     Reopen history/refresh ┌───────────────────────────────┐
│     AgentWorkspace.tsx         │<───────────────────────────┤ URL: /report/[id]?token=TOKEN │
│  (Polished workspace control)  │                            │ Cache: localStorage           │
└──────────────┬─────────────────┘                            └───────────────────────────────┘
               │
               │ Send iterative revision instruction (methods, conclusion, etc.)
               ▼
┌────────────────────────────────┐
│    POST /api/reports/chat      │
│  (Secure DB Thread Revision)   │
└──────────────┬─────────────────┘
               │
               ├─> 1. Rate Limit Audit (token/composite keys)
               ├─> 2. Hardcoded Academic Integrity Filter
               ├─> 3. Task Action Classifier (taskClassifier.ts)
               ├─> 4. Load Conversation History (AgentMessage[])
               ├─> 5. Call LLM for iterative JSON diff update
               ├─> 6. Run Output Guard (outputGuard.ts)
               ├─> 7. Persist updated Report + Message history to DB
               │
               ▼
   Returns updated message list & revised structured document preview
```

---

## Data Models & Schema Mechanics

The workspace persistence strategy bridges high-reliability server storage and lightweight local offline caching:

### 1. Database Persistence
In cloud mode (Supabase enabled), reports are stored inside the `reports` table. Conversational thread history, execution logs, and auditor checklist details are persisted inside the `reports.processing_metadata` JSONB column under the `agent_thread` namespace:
- `agent_thread.messages`: An array of `AgentMessage` objects documenting all turns.
- `agent_thread.summary`: Concise summary of earlier turns, used to compress historical context when history exceeds 50 messages.
- `agent_thread.active_run_status`: Locks the execution flow (`running`, `completed`, `failed`) to prevent race conditions or double-submits.

### 2. Browser Cache Cache Persistence
To ensure instantaneous loads and seamless offline access, `AgentWorkspace.tsx` mirrors workspace states inside the browser's `localStorage` namespace:
- `nali-report:[id]`: Caches the full `ReportResult` JSON payload.
- `nali-messages:[id]`: Caches the message sequence list.
- `nali-report-access:[id]`: Holds the SHA-256 access token.
- `nali-threads`: Tracks recent user threads inside the sidebar list.

---

## Security & Integrity Guardrails

To prevent academic cheating, citation fabrication, and model leaks, the chat handler enforces strict server-side rules:

1. **Composite Rate Limits**: Uses the composite key `(key_hash, action_type)` to enforce rate limiting at the server boundary before LLM invocation.
2. **Hardcoded Input Filters**: Rejects empty inputs, final-assignment-generation requests without user materials, fake citation lookup requests, and plagiarism-evasion requests. Prompt instructions alone are not trusted; validation runs inside the backend logic block.
3. **Task Classification**: Evaluates iterative instructions to align the updated sections strictly with the user's focus (e.g., adding conclusion sections, formalizing wording, building tables).
4. **Secrets Sandbox**: API models, keys, and tokens remain fully protected on the server side. No `NEXT_PUBLIC_` variables or OpenRouter credentials are exposed in the browser bundle.
