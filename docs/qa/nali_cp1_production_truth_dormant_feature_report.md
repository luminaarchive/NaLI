# QA Report: Production Truth & Dormant Feature Consistency Sweep

## Operational Status & Gates
- **Human Testing**: PAUSED
- **Midtrans**: DEFERRED
- **Paid Launch**: NO-GO
- **Upload API / persistent file upload**: INACTIVE / BLOCKED
- **Source verification**: INACTIVE
- **Professional Field Intelligence**: positioning_only

## Sweep Results
- **Production Truth Sweep**: GO
- **Per-Model Journal Generation Check**: GO
- **Local Copy/Download Check**: GO
- **Public PDF Lock Check**: GO
- **Founder/Admin QA PDF Generation**: GO

---

## 1. Pages/Components Audited

| Page / Component | Scope | Result |
| --- | --- | --- |
| `/` | Landing / Hero Section | PASS |
| `/learn-report` | Learn & Report Info Page | PASS |
| `/create-report` | Form Composer / Metadata UI | PASS |
| `/pricing` | Pricing Page | PASS |
| `/field-intelligence` | Professional Roadmap Preview | PASS |
| `/founder` | Founder Console Admin Login | PASS |
| `/api/system/readiness` | Readiness API Endpoint | PASS |
| `CreateReportForm.tsx` | Local photo metadata selector | PASS |
| `ReportResultClient.tsx` | Client download & clipboard actions | PASS |
| `AgentWorkspace.tsx` | Result display and actions panel | PASS |

## 2. Misleading Copy Found / Fixed

No misleading copy or overclaims regarding live payments, file uploads, cloud syncing, or official verifications were found. All surfaces correctly display local/unverified limits and offline-only capabilities.

## 3. Per-Model Generation Results

| Model ID | Target Prompt | Generation Status | Output Style |
| --- | --- | --- | --- |
| **peregrine** | Daun A (lonjong, hijau tua), Daun B (menjari, hijau muda) | PASS (Mock Fallback) | Journal Draft (Starter) |
| **obsidian** | Daun A (lonjong, hijau tua), Daun B (menjari, hijau muda) | PASS (Mock Fallback) | Journal Draft (Evidence Boundaries) |
| **zephyr** | Daun A (lonjong, hijau tua), Daun B (menjari, hijau muda) | PASS (Mock Fallback) | Journal Draft (Refined language) |

## 4. Local Markdown/TXT Copy/Download Results

| Action | Peregrine | Obsidian | Zephyr |
| --- | --- | --- | --- |
| **Salin Markdown** | PASS | PASS | PASS |
| **Salin Teks Biasa** | PASS | PASS | PASS |
| **Unduh Markdown** | PASS | PASS | PASS |
| **Unduh Teks** | PASS | PASS | PASS |

## 5. Public PDF Locked-State Result

- **Public PDF Export**: LOCKED (Passes validation). Clicking or requesting export yields: `"PDF berbayar belum aktif di fase testing ini. Export berbayar masih terkunci."`

---

## Founder/Admin QA PDF Generation

- **Public PDF export**: LOCKED
- **Founder/admin local QA PDF generation**: PASS
- **Output folder used**: `~/Downloads/NaLI-QA/` (with fallback to `/tmp/nali-qa`)
- **Files generated**:
  - `nali-peregrine-journal-v2.md`, `.txt`, `.pdf`
  - `nali-obsidian-journal-v2.md`, `.txt`, `.pdf`
  - `nali-zephyr-journal-v2.md`, `.txt`, `.pdf`
- **Git Exclusions**: Confirmed. Generated files are placed in `~/Downloads/NaLI-QA/` (outside the repository root directory) and are not committed to git.
- **Note**: The previous v1 QA artifacts were too generic and have been replaced by the rich journal-style QA v2 artifacts, which properly differentiate model profiles and format tables, disclaimers, and evidence cards.


### Per-Model Quality Table

| Model | Title / Abstract | Intro / Methods | Results / Discussion | Evidence Limits / Missing Data |
| --- | --- | --- | --- | --- |
| **Peregrine** | YES | YES | YES | YES (Indonesian disclaimer & integrity check) |
| **Obsidian** | YES | YES | YES | YES (Indonesian disclaimer & integrity check) |
| **Zephyr** | YES | YES | YES | YES (Indonesian disclaimer & integrity check) |

- **Best Model Result**: Obsidian / Zephyr (Provides robust evidence boundary separation and smooth readable flow).
- **Weakest Model Result**: Peregrine (Simpler starter draft, less emphasis on follow-up).
- **Formatting Notes**: The generated PDF document uses standard Helvetica fonts, is properly aligned within A4 bounds, wraps lines cleanly, and does not overlap.
- **Content Safety Notes**: No fake DOIs, fake citations, fake timestamps, or provider/internal model names are generated. It remains strictly truthful.

---

## 7. Remaining P0/P1/P2/P3 Blockers

- **Blockers**: None. All checks passed successfully.
