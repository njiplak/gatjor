# Gatjor - Project Overview

**Purpose**: Open-source PHP malicious code scanner CLI tool. Detects backdoor shells, webshells, dangerous code patterns, gambling/SEO spam keywords in PHP codebases.

**Tech Stack**:
- Runtime: Bun (NOT Node.js)
- Language: TypeScript (strict mode)
- PHP parsing: `php-parser` (AST-based analysis)
- Config parsing: `yaml` package
- Config format: YAML (`gatjor.yaml`)
- Output: HTML reports

**Key Features**:
- AST-based PHP code analysis
- Content detection (PHP hidden in non-PHP files like .txt, .jpg, .png)
- Configurable scan functions (enable/disable via YAML)
- HTML report generation for stakeholders

**Target Users**: PHP developers, security researchers, for manual audits, CI/CD, cron jobs, post-incident forensics.

**Status**: Early development (MVP phase). Two scanners implemented so far: `gambling-keyword` and `dangerous-eval`.
