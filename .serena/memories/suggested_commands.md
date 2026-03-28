# Suggested Commands

## Development
```bash
# Install dependencies
bun install

# Run the scanner
bun run index.ts scan ./path/to/php-project

# Run with custom output
bun run index.ts scan ./src -o security-report.html

# Run with custom config
bun run index.ts scan ./src -c custom-gatjor.yaml

# Show help
bun run index.ts --help
```

## Testing
```bash
# Run all tests
bun test

# Run specific test file
bun test tests/scanners/gambling-keyword.test.ts
```

## System Utilities (Darwin/macOS)
```bash
git status
git log --oneline
git diff
ls -la
```

## Notes
- Always use `bun` instead of `node`, `npm`, `yarn`, or `pnpm`
- Bun auto-loads `.env` files, no dotenv needed
- No linter or formatter currently configured
- No build step needed (Bun runs TypeScript directly)
