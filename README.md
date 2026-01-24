# gatjor

A fast, open-source PHP malicious code scanner built with [Bun](https://bun.sh). Detects backdoor shells, webshells, dangerous code patterns, and SEO spam injections in PHP codebases.

## Why gatjor?

PHP applications are frequent targets for malicious code injection. Attackers inject backdoors, webshells, and spam content into compromised sites. Existing security scanners are often enterprise-focused, expensive, or closed-source with opaque detection rules.

gatjor provides:
- Simple CLI with no complex setup
- Open-source detection rules you can inspect and extend
- Configurable scan functions to match your needs
- Actionable reports with clear recommendations

## Features

- **AST-based analysis** - Uses [php-parser](https://github.com/glayzzle/php-parser) for accurate code analysis
- **Pattern + content detection** - Finds PHP code hidden in non-PHP files (.txt, .jpg, .png, etc.)
- **Configurable** - YAML-based configuration for include/exclude patterns and scan functions
- **HTML reports** - Generate stakeholder-friendly security reports

## Installation

```bash
bun install
```

## Usage

```bash
# Scan a directory
bun run index.ts scan ./path/to/php-project

# Scan with custom output file
bun run index.ts scan ./src -o security-report.html

# Scan with custom config
bun run index.ts scan ./src -c custom-gatjor.yaml

# Show help
bun run index.ts --help
```

## Scan Functions

| ID | Category | Severity | Description |
|----|----------|----------|-------------|
| `gambling-keyword` | Content | Medium | Detects gambling/SEO spam keywords |
| `dangerous-eval` | Code Execution | Critical | Detects `eval()` usage |
| `dangerous-shell-exec` | Command Execution | Critical | Detects `shell_exec()` usage |
| `dangerous-exec` | Command Execution | Critical | Detects `exec()` usage |
| `dangerous-system` | Command Execution | Critical | Detects `system()` usage |
| `dangerous-passthru` | Command Execution | Critical | Detects `passthru()` usage |
| `dangerous-proc-open` | Command Execution | Critical | Detects `proc_open()` usage |
| `dangerous-popen` | Command Execution | Critical | Detects `popen()` usage |
| `dangerous-assert` | Code Execution | High | Detects `assert()` with string argument |
| `dangerous-create-function` | Code Execution | High | Detects `create_function()` usage |
| `dangerous-preg-replace-eval` | Code Execution | Critical | Detects `preg_replace()` with `/e` modifier |
| `dynamic-include` | File Inclusion | High | Detects `include`/`require` with variable paths |

## Configuration

Create a `gatjor.yaml` file to customize scanning:

```yaml
include:
  patterns:
    - "**/*.php"
    - "**/*.phtml"
  detect_by_content: true
  content_scan_extensions: [".txt", ".html", ".jpg", ".png"]

exclude:
  directories: ["vendor/", "node_modules/", ".git/"]
  patterns: ["**/composer.lock"]
  files: ["deploy.php"]

scan_functions:
  enable:
    - gambling-keyword
    - dangerous-eval
    - dangerous-shell-exec
  disable:
    - dangerous-system

output:
  format: html
  path: report.html
  include_snippets: true
  snippet_lines: 5
  include_recommendations: true
```

## Use Cases

- **Manual security audits** - Scan codebases before deployment
- **Automated scanning** - Run via cron jobs for continuous monitoring
- **CI/CD integration** - Fail builds on critical findings
- **Post-incident forensics** - Identify compromised files after a breach

## Roadmap

See [docs/PRODUCT.md](docs/PRODUCT.md) for the full roadmap. Planned features include:

- Obfuscation detection (`eval(base64_decode())`, `eval(gzinflate())`)
- Webshell signature detection
- Hidden iframe injection detection
- Cryptominer pattern detection
- JSON output format
- Preset configurations (`--preset security`, `--preset content`)

## Contributing

Contributions are welcome! You can help by:
- Adding new scan functions
- Contributing keyword lists for spam detection
- Improving detection accuracy
- Reporting false positives/negatives

## License

MIT
