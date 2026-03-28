# Codebase Structure

```
gatjor/
├── index.ts              # Entry point
├── index.php             # Test PHP file (for scanning)
├── gatjor.yaml           # Default configuration file
├── package.json          # Dependencies: php-parser, yaml
├── tsconfig.json         # Strict TS, ESNext, path alias @/* -> src/*
├── CLAUDE.md             # AI assistant instructions (use Bun, RTK)
├── docs/
│   └── PRODUCT.md        # Full product spec and roadmap
├── src/
│   ├── cli.ts            # CLI argument parsing and command handling
│   ├── parser.ts         # PHP file parsing logic
│   ├── scanner.ts        # Main scanner orchestration
│   ├── config.ts         # YAML config loading and parsing
│   ├── types.ts          # TypeScript type definitions
│   └── scanners/
│       ├── base.ts       # Base scanner class/interface
│       ├── index.ts      # Scanner registry (exports all scanners)
│       ├── gambling-keyword.ts  # Gambling keyword detection
│       └── dangerous-eval.ts    # eval() usage detection
└── tests/
    └── scanners/
        ├── gambling-keyword.test.ts
        └── dangerous-eval.test.ts
```

**Architecture**: Each scanner is a module in `src/scanners/` with a descriptive ID. Scanners are registered in `src/scanners/index.ts`. The main scanner (`src/scanner.ts`) orchestrates running enabled scanners against parsed PHP files.

**Path alias**: `@/*` maps to `src/*` (configured in tsconfig.json).
