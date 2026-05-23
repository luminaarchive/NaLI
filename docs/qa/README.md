# QA Documentation & Persona Retesting Index

This directory contains the comprehensive Quality Assurance (QA) and Automated Retesting documentation for the NaLI CP1 MVP Release (Sprint 0.7 - Agentic Answer Quality and Mobile Hardening).

## Documents

1. **[Full Persona Retest Report](nali_cp1_full_persona_retest_report.md)**  
   The primary retest report verifying the final release against 8 user personas (7 target users + 1 abuse tester). Includes the official Go/No-Go decisions:
   - **Human Testing**: GO 🟢
   - **AI Persona Retest**: CONDITIONAL GO 🟡
   - **Paid Launch**: NO-GO 🔴

2. **[Indonesian Production Retest Report](nali_cp1_ai_qa_production_retest_report.md)**  
   A detailed Indonesian-language evaluation of live production endpoints (`https://naliai.vercel.app`) assessing UI/UX responsive rendering across various viewports, API error codes, and persona interactions.

3. **[Live QA Gauntlet Report](nali_cp1_ai_qa_gauntlet_report.md)**  
   The initial agentic QA test suite run locally to verify task classification correctness, short-input safeguards, formatting templates, and compliance with forbidden cheating vocabulary.

## Directory Structure

```
docs/
├── qa/
│   ├── README.md (This file)
│   ├── nali_cp1_full_persona_retest_report.md
│   ├── nali_cp1_ai_qa_production_retest_report.md
│   └── nali_cp1_ai_qa_gauntlet_report.md
└── testing/
    └── nali_cp1_human_testing_guide.md
```
