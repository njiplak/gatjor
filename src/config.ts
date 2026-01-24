import { parse as parseYaml } from "yaml";

export interface IncludeConfig {
  patterns: string[];
  detect_by_content: boolean;
  content_scan_extensions: string[];
}

export interface ExcludeConfig {
  directories: string[];
  patterns: string[];
  files: string[];
}

export interface ScanFunctionsConfig {
  enable?: string[];
  disable?: string[];
}

export interface OutputConfig {
  format: "html" | "json";
  path: string;
  include_snippets: boolean;
  snippet_lines: number;
  include_recommendations: boolean;
}

export interface GatjorConfig {
  include: IncludeConfig;
  exclude: ExcludeConfig;
  scan_functions: ScanFunctionsConfig;
  output: OutputConfig;
}

const DEFAULT_CONFIG: GatjorConfig = {
  include: {
    patterns: [
      "**/*.php",
      "**/*.php5",
      "**/*.php7",
      "**/*.phtml",
      "**/*.inc",
      "**/*.module",
    ],
    detect_by_content: true,
    content_scan_extensions: [".txt", ".html", ".htm", ".js", ".css", ".jpg", ".png", ".gif", ".ico"],
  },
  exclude: {
    directories: ["vendor/", "node_modules/", ".git/", "tests/", "test/", "cache/", "tmp/"],
    patterns: ["**/composer.lock", "**/package-lock.json", "**/*.min.js", "**/*.min.css"],
    files: [],
  },
  scan_functions: {
    disable: [],
  },
  output: {
    format: "html",
    path: "report.html",
    include_snippets: true,
    snippet_lines: 5,
    include_recommendations: true,
  },
};

export async function loadConfig(configPath: string): Promise<GatjorConfig> {
  const file = Bun.file(configPath);
  const exists = await file.exists();

  if (!exists) {
    return DEFAULT_CONFIG;
  }

  const content = await file.text();
  const parsed = parseYaml(content) as Partial<GatjorConfig>;

  return mergeConfig(DEFAULT_CONFIG, parsed);
}

function mergeConfig(defaults: GatjorConfig, overrides: Partial<GatjorConfig>): GatjorConfig {
  return {
    include: {
      ...defaults.include,
      ...overrides.include,
    },
    exclude: {
      ...defaults.exclude,
      ...overrides.exclude,
    },
    scan_functions: {
      ...defaults.scan_functions,
      ...overrides.scan_functions,
    },
    output: {
      ...defaults.output,
      ...overrides.output,
    },
  };
}

export function getDefaultConfig(): GatjorConfig {
  return structuredClone(DEFAULT_CONFIG);
}
