# Token Saving Rules

Rules to minimize context window bloat and reduce cost.

## Top rules

1. **Grepping before reading**: Never use `view_file` on complete files to find code structures. Run `grep_search` (`rg`) to isolate line numbers first.
2. **Restrict view range**: When using `view_file`, specify exact `StartLine` and `EndLine` parameters. Never read more than 100 lines at once unless necessary.
3. **Avoid full builds**: Do not compile or run `npm run build` or `npm run verify` continuously. Build only at the end of the sprint or during full integration testing.
4. **Targeted test execution**: Run individual unit test files directly rather than triggering the entire test suite.
5. **No duplicate file listing**: Avoid listing folder contents recursively. List directories only when seeking file structures.
