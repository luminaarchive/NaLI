# Commit & Push Protocol

Guidelines to keep repository branches clean and safely aligned.

## Git Steps

1. **Inspect changes**: Run `git diff --stat` to review modified files.
2. **Exclude secrets**: Verify that no keys, tokens, or plaintext secrets are in files.
3. **Exclude temporary artifacts**: Ensure `.next/`, `test-results/`, and mock keys are not added. Check `.gitignore`.
4. **Stage files**: Stage all code additions and documentation.
5. **Commit locally**: Write a clean, meaningful message detailing changes (or use the exact commit message requested by the user).
6. **Compare HEAD and origin**: Verify local HEAD aligns with origin/main by checking `git rev-parse HEAD` and `git ls-remote origin main` (if remote access is allowed/enabled).
