# Error Recovery Protocol

Steps to recover when a command or compile crashes.

## Flow Mechanics

1. **Audit git tree**: Run `git status` to check modified and unstaged files.
2. **Review test failure reports**: Read the log location returned by the failed task (e.g. `file:///Users/macintosh/.gemini/antigravity/...`). Find the exact stack trace and line failure.
3. **Isolate edits**: Use `git checkout <file>` to revert unstable changes if necessary.
4. **Incremental fix**: Apply one targeted correction, then recheck using a fast compiler or single-file test.
5. **No sweeping rewrites**: Never delete major sections of the code or re-implement complete routes when debugging simple compiler warnings.
