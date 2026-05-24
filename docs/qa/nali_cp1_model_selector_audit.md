# Model Selector & Processing Profiles Audit

This document audits the workspace inputs, composer forms, and backend generation endpoints in NaLI CP1 to prepare for adding the model selection options.

## 1. Locked System Gates

All core system gates are strictly mapped and verified:
- **Human Testing**: PAUSED
- **Midtrans**: DEFERRED
- **Paid Launch**: NO-GO
- **Founder Monitoring**: GO
- **Mobile Composer Optimization**: CONDITIONAL GO
- **Rate Limit/Error UX**: GO
- **Report Quality Memory**: GO

---

## 2. Pre-Implementation Audit Findings

### Report Creation Form & Workspace
- Input forms (`CreateReportForm.tsx` and `AgentWorkspace.tsx`) had no options for selecting model profiles. 
- Form submission payloads defaulted to mode parameters (`mode: selectedMode`) and template types, but did not include any model metadata.

### Backend Endpoints
- The endpoint `/api/reports/generate` received the POST payload, but only validated report modes (`draft_from_materials` vs. `start_from_zero`). It called the AI provider using a single static system prompt without profile-specific guidelines.
- Normalized report results and database records used a generic `model_used` value ("NaLI Preview Engine" or "nali"), offering no visibility into different quality levels for the founder.

---

## 3. Profile Design Specifications

We define three processing profiles:

1. **Peregrine**:
   - Focus: Speed, early drafts, and basic structuring.
   - Guard: Must not claim highest accuracy or verified evidence.

2. **Obsidian**:
   - Focus: Factual evidence boundaries, separating claims from inferences, and strict uncertainty notes.
   - Guard: Must not claim field verification or official validation.

3. **Zephyr**:
   - Focus: Personal context adapters ("Make It Mine"), voice adaptation, natural readability, and academic clarity.
   - Guard: Must never claim to bypass AI detection or Turnitin checkers.
