import type { AST } from "@/parser";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type ScannerCategory =
  | "command-execution"
  | "code-execution"
  | "file-inclusion"
  | "content"
  | "obfuscation"
  | "webshell";

export interface ScanContext {
  content: string;
  filePath: string;
  relativePath: string;
  ast: AST | null;
}

export interface Finding {
  scannerId: string;
  file: string;
  line: number;
  column?: number;
  severity: Severity;
  message: string;
  snippet?: string;
  recommendation: string;
}

export interface ScannerMetadata {
  id: string;
  name: string;
  description: string;
  category: ScannerCategory;
  severity: Severity;
  recommendation: string;
}

export interface Scanner {
  readonly metadata: ScannerMetadata;
  scan(context: ScanContext): Finding[];
}
