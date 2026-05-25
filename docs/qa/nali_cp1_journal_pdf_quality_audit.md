# QA Audit: Journal & PDF Quality Issues

This document details the audit of why the initial Peregrine, Obsidian, and Zephyr model QA artifacts were generic, messy, and lacking professional journal-style layouts, and how this has been resolved in CP1.

## Identified Issues

### 1. Mesh / Generic Output (No Model Differentiation)
- **Severity**: P1
- **Root Cause**: The mock report fallback builder (`buildMockDraftReport` in `src/lib/reports/reportGenerator.ts`) returned the exact same static content for all three models (only the `model_used` label differed). 
- **Affected Files**: `src/lib/reports/reportGenerator.ts`
- **Resolution**: Created a dedicated journal contract (`src/lib/reports/journalReportContract.ts`) that maps model IDs to specific behavior, matching the expected profiles (Peregrine: concise, beginner-friendly; Obsidian: strict evidence boundaries, focus on uncertainty/limitations; Zephyr: polished academic narrative).

### 2. Lack of PDF Layout Hierarchy & Spacing
- **Severity**: P1
- **Root Cause**: The PDF generator (`src/lib/reports/pdf.ts`) split markdown by line, stripped markdown symbols, and printed plain text lines sequentially with no cover title bar, no horizontal lines for section division, no custom card blocks, and no margin handling.
- **Affected Files**: `src/lib/reports/pdf.ts`
- **Resolution**: Built a professional header title banner, drew light-blue divider lines under all section headers, implemented custom drawing bounds, and added footer page numbers.

### 3. Broken Table Formatting in PDFs
- **Severity**: P2
- **Root Cause**: The previous renderer treated markdown tables like normal text. Characters in Helvetica are proportionally spaced, which caused columns to skew, overlap, or look completely unaligned.
- **Affected Files**: `src/lib/reports/pdf.ts`
- **Resolution**: Designed a dedicated table parser inside the PDF generation loop. It parses markdown table rows, wraps cell text individually, computes dynamic column widths, draws vertical dividers, and applies zebra-striped row backgrounds.

### 4. Poor Disclaimer and Evidence Placeholder Layout
- **Severity**: P2
- **Root Cause**: Disclaimer notes and evidence/photo placeholders were rendered as raw plain text bullet points. They looked like general checklist text.
- **Affected Files**: `src/lib/reports/pdf.ts`
- **Resolution**: Created specific warning callout blocks (red border, light red fill) for the academic integrity disclaimer and custom evidence cards (green border, light green fill) for photo/evidence slots.

---

## Safety and Truth Constraints (What Must NOT Be Faked)

- **No Fake Citations**: Do not invent fake DOIs, academic articles, or books.
- **No Fake Field Data**: Do not invent fake species names, parent tree names, or coordinates.
- **No Image Fabrication**: Because upload is inactive in CP1, the photo slot must explicitly state "Foto belum tersedia (Upload dinonaktifkan di CP1)" and never show dummy image hashes as verified evidence.
- **No Paid Bypass**: Public PDF download remains locked under payment checks.
