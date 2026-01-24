import { loadConfig } from "@/config";
import { collectFiles, collectSingleFile, type ScannableFile } from "@/scanner";

const VERSION = "0.1.0";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};

function log(message: string) {
  console.log(message);
}

function error(message: string) {
  console.error(`${colors.red}Error:${colors.reset} ${message}`);
}

function success(message: string) {
  console.log(`${colors.green}${message}${colors.reset}`);
}

function info(message: string) {
  console.log(`${colors.cyan}${message}${colors.reset}`);
}

function showHelp() {
  log(`
${colors.bold}gatjor${colors.reset} - PHP malicious code scanner

${colors.yellow}Usage:${colors.reset}
  gatjor scan <path> [options]
  gatjor --help
  gatjor --version

${colors.yellow}Commands:${colors.reset}
  scan <path>    Scan PHP files for malicious code patterns

${colors.yellow}Options:${colors.reset}
  -o, --output <file>    Output report file path (default: report.html)
  -c, --config <file>    Config file path (default: gatjor.yaml)
  -h, --help             Show this help message
  -v, --version          Show version number

${colors.yellow}Examples:${colors.reset}
  ${colors.dim}# Scan a directory${colors.reset}
  gatjor scan ./src

  ${colors.dim}# Scan with custom output${colors.reset}
  gatjor scan ./src -o security-report.html

  ${colors.dim}# Scan with custom config${colors.reset}
  gatjor scan ./src -c custom-gatjor.yaml
`);
}

function showVersion() {
  log(`gatjor v${VERSION}`);
}

interface ScanOptions {
  path: string;
  output: string;
  config: string;
}

function parseArgs(args: string[]): { command: string | null; options: Partial<ScanOptions>; flags: Set<string> } {
  const options: Partial<ScanOptions> = {};
  const flags = new Set<string>();
  let command: string | null = null;
  let i = 0;

  while (i < args.length) {
    const arg = args[i]!;

    if (arg === "-h" || arg === "--help") {
      flags.add("help");
    } else if (arg === "-v" || arg === "--version") {
      flags.add("version");
    } else if (arg === "-o" || arg === "--output") {
      options.output = args[++i];
    } else if (arg === "-c" || arg === "--config") {
      options.config = args[++i];
    } else if (arg === "scan") {
      command = "scan";
      // Next non-flag argument is the path
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith("-")) {
        options.path = nextArg;
        i++;
      }
    } else if (!arg.startsWith("-") && !command) {
      // Unknown command
      command = arg;
    }

    i++;
  }

  return { command, options, flags };
}

async function scanDirectory(options: ScanOptions): Promise<void> {
  const { path: scanPath, output, config: configPath } = options;

  info(`Scanning: ${scanPath}`);
  log(`${colors.dim}Output:  ${output}${colors.reset}`);
  log(`${colors.dim}Config:  ${configPath}${colors.reset}`);
  log("");

  // Load configuration
  const config = await loadConfig(configPath);

  // Check if path is a file or directory
  const file = Bun.file(scanPath);
  const isFile = await file.exists();

  let files: ScannableFile[] = [];

  if (isFile) {
    // Single file scan
    const scannableFile = await collectSingleFile(scanPath, config);
    if (scannableFile) {
      files = [scannableFile];
    } else {
      error(`File does not match any include patterns or contain PHP code: ${scanPath}`);
      process.exit(1);
    }
  } else {
    // Directory scan
    try {
      files = await collectFiles(scanPath, config);
    } catch (err) {
      error(`Failed to scan directory: ${scanPath}`);
      process.exit(1);
    }
  }

  if (files.length === 0) {
    log(`${colors.yellow}Warning:${colors.reset} No scannable files found in ${scanPath}`);
    return;
  }

  // Show file collection summary
  const patternMatched = files.filter((f) => f.matchedBy === "pattern").length;
  const contentMatched = files.filter((f) => f.matchedBy === "content").length;

  info(`Found ${files.length} file(s) to scan`);
  if (patternMatched > 0) {
    log(`${colors.dim}  - ${patternMatched} matched by pattern${colors.reset}`);
  }
  if (contentMatched > 0) {
    log(`${colors.dim}  - ${contentMatched} detected by PHP content${colors.reset}`);
  }
  log("");

  // TODO: Implement actual scanning logic
  log(`${colors.dim}[Scan logic not yet implemented]${colors.reset}`);
  log("");

  // Show files that will be scanned (first 10)
  log(`${colors.dim}Files to scan:${colors.reset}`);
  const displayFiles = files.slice(0, 10);
  for (const f of displayFiles) {
    const marker = f.matchedBy === "content" ? `${colors.yellow}[content]${colors.reset}` : "";
    log(`  ${f.relativePath} ${marker}`);
  }
  if (files.length > 10) {
    log(`  ${colors.dim}... and ${files.length - 10} more${colors.reset}`);
  }
  log("");

  success(`Scan complete. Report saved to: ${output}`);
}

export async function run(argv: string[]): Promise<void> {
  // Skip first two args (bun and script path)
  const args = argv.slice(2);

  const { command, options, flags } = parseArgs(args);

  // Handle flags first
  if (flags.has("help") || args.length === 0) {
    showHelp();
    return;
  }

  if (flags.has("version")) {
    showVersion();
    return;
  }

  // Handle commands
  if (command === "scan") {
    if (!options.path) {
      error("Missing scan path. Usage: gatjor scan <path>");
      process.exit(1);
    }

    const scanOptions: ScanOptions = {
      path: options.path,
      output: options.output || "report.html",
      config: options.config || "gatjor.yaml",
    };

    await scanDirectory(scanOptions);
  } else if (command) {
    error(`Unknown command: ${command}`);
    log(`Run ${colors.cyan}gatjor --help${colors.reset} for usage information.`);
    process.exit(1);
  } else {
    showHelp();
  }
}
