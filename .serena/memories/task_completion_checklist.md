# Task Completion Checklist

When a coding task is completed, ensure:

1. **Tests pass**: Run `bun test` to verify all tests pass
2. **Type check**: Run `bun run tsc --noEmit` (if applicable) to check for type errors
3. **New scanners**: If a new scanner was added:
   - Create the scanner file in `src/scanners/`
   - Register it in `src/scanners/index.ts`
   - Add a test file in `tests/scanners/<scanner-id>.test.ts`
   - Document the scanner ID in `gatjor.yaml` comments
4. **No linter/formatter configured yet** — follow existing code style manually

Note: No CI/CD pipeline is set up yet. Testing is manual via `bun test`.
