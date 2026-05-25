# Operations Runbook: Production Truth & Model Generation QA

This runbook describes how to execute the production truth audit, verify model-specific routing, and produce founder/admin local QA artifacts.

## Running the Production Truth Sweep

1. **Verify Wording Compliance**:
   Ensure no public routes (Landing, Pricing, Composer) contain active claims about file uploads, third-party sat/alert integrations (NASA, GFW), or active paid checkouts.
2. **Execute Assertions**:
   Verify all constraints by running:
   ```bash
   node --test tests/reports/production-truth-dormant-features.test.cjs
   ```

## Model Generation Tests

1. **Routing Validation**:
   Validate that the route parameter `selectedModel` is correctly routed to `peregrine`, `obsidian`, or `zephyr`, with invalid ones falling back safely to `peregrine`. Run:
   ```bash
   node --test tests/reports/per-model-journal-generation.test.cjs
   ```

2. **Generating Local QA Artifacts**:
   Run the local QA script to compile Markdown, plain text, and PDF documents for inspection:
   ```bash
   node scratch/generate_qa_artifacts.cjs
   ```
   This will output the files to the `/tmp/nali-qa` folder.

## QA PDF Inspection Guidelines

Inspect the generated PDF documents in the `/tmp/nali-qa` folder for the following:
- Clear title and abstract.
- Exact adherence to user-provided evidence (no fake species, DOIs, or locations).
- Complete Indonesian disclaimers and integrity boxes.
- Clean text formatting, word wrapping, and page boundaries (no overlaps).

## Git Commit Constraints

- Never add `/tmp/` files or the `/tmp/nali-qa` directory to the git stage.
- Keep the `scratch/generate_qa_artifacts.cjs` script untracked or in the `scratch/` directory.
