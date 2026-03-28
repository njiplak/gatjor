# Code Style and Conventions

## TypeScript
- Strict mode enabled (`strict: true` in tsconfig)
- ESNext target, module preservation
- Path aliases: `@/*` -> `src/*`
- Module type: ESM (`"type": "module"` in package.json)
- `verbatimModuleSyntax: true` — use `import type` for type-only imports

## Naming
- Scanner IDs use kebab-case (e.g., `gambling-keyword`, `dangerous-eval`)
- Files use kebab-case (e.g., `gambling-keyword.ts`)
- Test files follow pattern: `tests/scanners/<scanner-id>.test.ts`

## Testing
- Uses `bun:test` (import `{ test, expect }` from `"bun:test"`)
- Tests mirror source structure under `tests/`

## Scanner Pattern
- Each scanner is a separate file in `src/scanners/`
- Scanners extend/implement a base from `src/scanners/base.ts`
- All scanners are registered/exported from `src/scanners/index.ts`

## Configuration
- YAML-based config (`gatjor.yaml`)
- Supports include/exclude patterns, scan function enable/disable, output settings
