import type {
  Scanner,
  ScannerMetadata,
  ScanContext,
  Finding,
  Severity,
} from "@/types";

export abstract class BaseScanner implements Scanner {
  abstract readonly metadata: ScannerMetadata;

  abstract scan(context: ScanContext): Finding[];

  protected createFinding(
    context: ScanContext,
    line: number,
    message: string,
    options?: {
      column?: number;
      snippet?: string;
      severity?: Severity;
      recommendation?: string;
    }
  ): Finding {
    return {
      scannerId: this.metadata.id,
      file: context.relativePath,
      line,
      column: options?.column,
      severity: options?.severity ?? this.metadata.severity,
      message,
      snippet: options?.snippet ?? this.extractSnippet(context.content, line),
      recommendation: options?.recommendation ?? this.metadata.recommendation,
    };
  }

  protected extractSnippet(
    content: string,
    line: number,
    contextLines: number = 2
  ): string {
    const lines = content.split("\n");
    const startLine = Math.max(0, line - contextLines - 1);
    const endLine = Math.min(lines.length, line + contextLines);

    return lines
      .slice(startLine, endLine)
      .map((l, i) => {
        const lineNum = startLine + i + 1;
        const marker = lineNum === line ? ">" : " ";
        return `${marker} ${lineNum.toString().padStart(4)} | ${l}`;
      })
      .join("\n");
  }

  protected findLineNumber(content: string, index: number): number {
    const substring = content.substring(0, index);
    return (substring.match(/\n/g) || []).length + 1;
  }

  protected findColumn(content: string, index: number): number {
    const substring = content.substring(0, index);
    const lastNewline = substring.lastIndexOf("\n");
    return lastNewline === -1 ? index + 1 : index - lastNewline;
  }
}
