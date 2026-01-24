# Gatjor

An open-source PHP code scanner to detect malicious code patterns such as backdoor shells, webshells, attack vectors, and suspicious content like gambling keywords.

## Problem Statement

PHP applications are frequent targets for malicious code injection. Attackers inject backdoors, webshells, and spam content (gambling, SEO spam) into compromised sites. Developers and site owners need a simple, reliable way to:

- Detect malicious code patterns in their PHP codebase
- Generate reports to present findings to stakeholders
- Automate scanning via cron jobs or CI pipelines
- Customize detection rules for their specific needs

Existing solutions are often:
- Enterprise-focused and expensive
- Closed-source with opaque detection rules
- Difficult to extend with new attack patterns

## Target Users

- **Primary**: All developers working with PHP codebases
- **Secondary**: Security researchers, open-source contributors
- **Use cases**:
  - Manual security audits
  - Automated scanning via cron jobs
  - CI/CD pipeline integration
  - Post-incident forensics

## Proposed Solution

Gatjor is a lightweight CLI tool that:

1. **Scans PHP files** for malicious code patterns using AST analysis (php-parser)
2. **Generates HTML reports** suitable for stakeholder presentations
3. **Uses configurable scan functions** - users enable/disable specific detections
4. **Supports community-contributed rules** - keyword lists and detection patterns are open for contribution

## Core Principles

- **Simple**: Easy-to-use CLI, no complex setup
- **Open**: Open-source with community-contributed detection rules
- **Configurable**: Users choose which scan functions to run
- **Actionable**: Reports include findings with clear recommendations

## Technical Approach

### Detection Engine

- **Parser**: [php-parser](https://github.com/nikic/PHP-Parser) for AST-based analysis
- **Layers**: Each scan function operates independently with its own ID
- **Keywords**: External files (txt format) for community-contributed keyword lists

### Scan Functions

Each scan function has a descriptive ID with internal mapping. Users configure which functions to enable/disable.

#### MVP Scan Functions

| ID | Category | Description |
|----|----------|-------------|
| `gambling-keyword` | Content | Detects gambling-related keywords from keyword list |
| `dangerous-shell-exec` | Command Execution | Detects `shell_exec()` usage |
| `dangerous-exec` | Command Execution | Detects `exec()` usage |
| `dangerous-system` | Command Execution | Detects `system()` usage |
| `dangerous-passthru` | Command Execution | Detects `passthru()` usage |
| `dangerous-proc-open` | Command Execution | Detects `proc_open()` usage |
| `dangerous-popen` | Command Execution | Detects `popen()` usage |
| `dangerous-eval` | Code Execution | Detects `eval()` usage |
| `dangerous-assert` | Code Execution | Detects `assert()` with string argument |
| `dangerous-create-function` | Code Execution | Detects `create_function()` usage |
| `dangerous-preg-replace-eval` | Code Execution | Detects `preg_replace()` with `/e` modifier |
| `dynamic-include` | File Inclusion | Detects `include`/`require` with variable paths |

### Configuration

Configuration via `gatjor.yaml`:

```yaml
# gatjor.yaml

# Scan functions to enable (if omitted, all are enabled)
enable:
  - gambling-keyword
  - dangerous-shell-exec
  - dangerous-exec
  - dangerous-eval

# Scan functions to disable
disable:
  - dangerous-system

# Files and directories to ignore
ignore:
  - vendor/
  - tests/
  - deploy.php
  - scripts/maintenance.php
```

### CLI Interface

```bash
# Basic scan (outputs HTML report)
gatjor scan <path>

# Scan with custom output path
gatjor scan <path> -o report.html

# Scan with custom config
gatjor scan <path> -c custom-gatjor.yaml

# List available scan functions
gatjor list
```

### Output

HTML report containing:
- Summary of findings (total files scanned, issues found)
- List of detections with:
  - File path
  - Line number
  - Scan function ID that triggered
  - Code snippet
  - Severity level
  - Recommendation
- Suitable for presentation to stakeholders

## Keyword Lists

Keywords are stored in external files for easy community contribution:

```
keywords/
├── gambling.txt
├── casino.txt
└── ...
```

Example `gambling.txt`:
```
slot
casino
poker
togel
judi
taruhan
jackpot
betting
```

## Roadmap

### v1.0 - MVP

- [ ] CLI with `scan` and `list` commands
- [ ] HTML report output
- [ ] YAML configuration support
- [ ] MVP scan functions:
  - [ ] Gambling keyword detection
  - [ ] Dangerous function detection (shell_exec, exec, system, passthru, proc_open, popen)
  - [ ] Code execution detection (eval, assert, create_function, preg_replace /e)
  - [ ] Dynamic include/require detection
- [ ] File/directory ignore via config
- [ ] External keyword file support

### v2.0 - Extended Detection

- [ ] Obfuscation detection:
  - [ ] `eval-base64` - eval(base64_decode()) patterns
  - [ ] `eval-gzinflate` - eval(gzinflate()) patterns
  - [ ] `string-concat-obfuscation` - suspicious string building
- [ ] Webshell signature detection
- [ ] Hidden iframe injection detection
- [ ] Cryptominer pattern detection
- [ ] SEO spam injection detection

### v3.0 - Community & Presets

- [ ] Preset configurations:
  - [ ] `--preset security` - all backdoor/shell detections
  - [ ] `--preset content` - gambling, spam keywords
  - [ ] `--preset all` - everything
- [ ] Community rule repository
- [ ] Auto-update rules from remote source
- [ ] JSON output format option
- [ ] CI/CD integration guides

### Future Considerations

- IDE/editor plugins
- GitHub Action
- Watch mode for development
- Severity threshold configuration
- Custom rule authoring documentation

## Success Metrics

- Easy to install and run (single command)
- Comprehensive detection with low false positives
- Reports that non-technical stakeholders can understand
- Active community contributing keyword lists and detection rules

## References

- [php-parser](https://github.com/nikic/PHP-Parser) - PHP AST parser
- [OWASP PHP Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html)
