# Start Here: Execution Philosophy

Welcome to NaLI. This document outlines the core guidelines for any agent executing tasks on this repository.

## The Core Rule: Incremental Progression

Every feature or bugfix must be executed in small, verifiable steps. Never attempt to write hundreds of lines of code or update multiple files simultaneously without running check scripts.

### 3-Step Execution Cycle

1. **Research & Targeted Reading**: Identify files using `grep_search` and read only the relevant line ranges.
2. **Small Edits**: Modify code using `replace_file_content` or `multi_replace_file_content`. Avoid complete file overwrites.
3. **Targeted Verification**: Run the exact test file affected by the change (e.g., `node --test tests/reports/auth-persistence-linking.test.cjs`) rather than full verification.

## When to Ask vs. When to Proceed

- **Proceed**: Small tweaks, fixing lint/compiler errors, implementing approved tasks in the sprint.
- **Stop & Report**: Destructive database schema changes, user interface adjustments that violate the visual lock, or when key variables are missing.
