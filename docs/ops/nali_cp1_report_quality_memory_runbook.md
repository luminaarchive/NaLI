# Quality Memory Runbook: Founder Console

This operations guide explains how the deterministic Report Quality Memory and Feedback Learning Loop operates, how the founder should interpret the dashboard scores, and how to triage quality issues.

---

## 1. What It Is and What It Is Not

- **It IS**: A deterministic, rule-based telemetry mapping module that aggregates database records (reports, feedback ratings, user comments, rate limit logs) into a consolidated quality report.
- **It IS**: Fully private and safe. It runs regex sanitization to strip keys, paths, and provider names.
- **It IS NOT**: An LLM agent. It does not call any external API or provider model to categorize user feedback or compute the score.
- **It IS NOT**: A real-time webhook alerting engine. It evaluates history on-demand when the Founder Console is loaded.

---

## 2. Score Interpretation

The composite Quality Score is categorized into three status zones:

- **🟢 80 - 100: Healthy (Baik)**
  - System is operating with high prompt stability, low report generation failures, strong user evidence indicators, and positive feedback. No immediate action required.
- **🟡 50 - 79: Attention Suggested (Perlu Perhatian)**
  - Some reports are failing validation or generating weak evidence. Review the *Founder Attention Queue* and check which stage is generating errors.
- **🔴 0 - 49: Immediate Action Required (Perlu Tindakan)**
  - Indicates elevated report failure rates (>30%), severe feedback complaints (e.g. broken layout/generation), or multiple critical bugs. Check the *Suggested Next Fixes* section immediately.

---

## 3. P0–P3 Priority Triage Guide

When issues appear in the *Founder Attention Queue*, triage them according to severity:

### P0: Critical Security/Integrity Threat
- **Indicators**: Failures logs containing references to `integrity`, `security`, or `abuse`.
- **Action**: Check system access logs immediately. Verify if specific IP ranges/sessions are attempting prompt injection or scraping behavior.

### P1: Core Operational Failures
- **Indicators**: Generation failure rates exceeding 30% or multiple "Output Not Useful" user complaints.
- **Action**:
  - Review the *Suggested Next Fixes* section to see which stage (e.g. `ai_generation`, `validation`) has failed.
  - Check OpenRouter/provider API status and confirm if model rate-limits/tokens have been reached.

### P2: User Friction & Clarity
- **Indicators**: High concentration of "Weak Evidence" reports or complaints about "Confusing Wording".
- **Action**:
  - Review the user instruction page (`/learn-report`) to guide users toward providing richer notes.
  - Refine prompt templates to clarify evidence references and validation expectations.

### P3: Polish & Minor Alerts
- **Indicators**: Active rate limit temporary blocks or minor UX complaints.
- **Action**: Monitor session volumes. If rate limits are triggered too frequently, adjust throttle thresholds in rate-limiting middleware configs.

---

## 4. Sparse Data Warning

If the system has just been deployed, or the database tables are empty, the quality score will display as `-1`. 
The console will render a neutral card stating:
`"No quality memory signals collected yet."`
This is expected behavior and does not indicate a system failure. Once users begin generating reports, the score will automatically compile on page refresh.

---

## 5. Future Human Testing Support

When the founder decides to resume human testing:
1. Testers will access `/create-report` to generate test documents.
2. Testers should submit thumbs-down / thumbs-up feedback directly from the result page interface.
3. Comments tagged with special tester IDs or standard friction keywords will immediately update the *Founder Attention Queue* and *Suggested Next Fixes* cards on the console, enabling rapid iterations.
