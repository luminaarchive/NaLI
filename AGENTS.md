<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NaLI v1.5 Project Instructions

## Project Purpose

NaLI by NatIve is one brand with two modes:

- Public Mode: NaLI Learn & Report.
- Professional Mode: NaLI Field Intelligence.

The current MVP priority is the Public Layer: Field Note / Source to Report Generator. The Professional Layer may be visible as positioning and product information, but must not be presented as a fully live operational system unless the feature is actually implemented and verified.

## Current MVP Scope

Build the smallest working Learn & Report flow:

- Home page explains the two paths.
- Main CTA: "Mulai Susun Laporan".
- `/learn-report` explains the Public Layer.
- `/create-report` lets users choose a template, provide at least one material, accept academic integrity terms, and submit.
- Server route validates input and returns a structured draft report.
- Result page shows the draft label, evidence table, uncertainty note, source verification status, disclaimer, and simple copy/export.
- `/field-intelligence` is informational only for now.
- `/pricing` is a beta pricing placeholder. Do not claim payment is active.

## Local Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Public demo test: `npm run test:demo`
- Full verification, when scope justifies it: `npm run verify`

## Current Architecture Notes

- Framework: Next.js 16 App Router under `src/app`.
- Package manager: npm (`package-lock.json` is present).
- Styling: Tailwind CSS v4 with theme tokens in `src/app/globals.css`.
- Auth: Supabase auth via `src/proxy.ts` and protected `(app)` routes.
- Database: Supabase scaffolding exists. Do not create or modify production schema without a migration.
- Server API routes live under `src/app/api/**/route.ts`.
- Read relevant local Next.js docs in `node_modules/next/dist/docs/` before coding against App Router APIs.

## NaLI Integrity Rules

- Reject empty prompt/material on both client and server.
- Require at least one user-provided material: text note, URL, location, or upload placeholder.
- Require the academic integrity checkbox before report generation/export.
- Every output must say: "Draft bantuan belajar/penulisan berbasis bukti."
- Every output must include the required Public Layer disclaimer:

  "Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa, mengedit, memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir. NaLI tidak boleh digunakan untuk memalsukan data, mengarang referensi, melakukan plagiarisme, atau mengklaim karya AI sebagai karya final tanpa revisi."

- Do not fabricate citations, DOI, statistics, observation data, authors, publishers, timestamps, coordinates, or references.
- User-provided URLs must be labeled as provided by user and not yet verified unless real verification is implemented.
- If Crossref/NCBI verification is not implemented, label it clearly: "Source verification belum aktif di MVP ini."
- Evidence hash, if shown, is only a "digital integrity marker", never legal proof or academic validation.
- Human review is final. NaLI output is draft/support, not final truth.

## Do Not Rules

- Do not use or add wording such as "Generate tugas final", "Buat skripsi selesai", "Kerjakan tugas saya", "Anti ketahuan dosen", or "Bebas plagiarisme dijamin".
- Do not call NaLI a generic AI wrapper, homework cheating tool, fake citation generator, fake data generator, fake scientific claim generator, or fake realtime field intelligence product.
- Do not claim realtime field data, active payment, institutional deployments, legal admissibility, or verified professional integrations unless backed by working implementation and verification.
- Do not expose server secrets with `NEXT_PUBLIC_`.
- Do not commit `.env.local` or print secrets.
- Do not run destructive SQL or modify production Supabase schema without an explicit migration file and review.
- Do not overbuild v1.5 deferred features in the MVP: full review queue, patrol planner, realtime alerts, BirdNET, Neo4j, full Darwin Core institutional export, payment gateway, SOS system, or enterprise dashboard.

## Definition Of Done

- Home page clearly shows Learn & Report and Field Intelligence.
- Public CTA leads to `/create-report`.
- Report form validates at least one material and required academic integrity consent.
- API route validates the same guardrails server-side.
- Output is labeled as a draft and includes the required disclaimer.
- Evidence table, uncertainty note, source verification limitation, and next user steps are visible.
- Copy/export works in a simple format.
- Forbidden academic-cheating wording is absent from UI.
- No fake realtime/payment/institutional claims are introduced.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass, or failures are reported with exact causes.
