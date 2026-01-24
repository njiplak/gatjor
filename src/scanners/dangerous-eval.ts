import type { ScannerMetadata, ScanContext, Finding } from "@/types";
import { BaseScanner } from "@/scanners/base";
import { findNodesByKind } from "@/parser";

interface EvalNode {
  kind: "eval";
  source: Record<string, unknown>;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export class DangerousEvalScanner extends BaseScanner {
  readonly metadata: ScannerMetadata = {
    id: "dangerous-eval",
    name: "Dangerous eval() Detection",
    description: "Detects eval() function calls which can execute arbitrary PHP code",
    category: "code-execution",
    severity: "critical",
    recommendation:
      "Remove or replace eval() with safer alternatives. If eval() is necessary, ensure the input is strictly validated and sanitized. Consider using json_decode() for data parsing or include() for dynamic code loading with whitelisted paths.",
  };

  scan(context: ScanContext): Finding[] {
    const findings: Finding[] = [];

    // Use AST-based detection if available
    if (context.ast) {
      const evalNodes = findNodesByKind(context.ast, "eval");

      for (const node of evalNodes) {
        const evalNode = node as EvalNode;
        const line = evalNode.loc?.start.line ?? 1;
        const column = evalNode.loc?.start.column;

        // Check if eval source contains user input
        const hasUserInput = this.checkForUserInput(evalNode);

        findings.push(
          this.createFinding(
            context,
            line,
            hasUserInput
              ? "eval() called with potentially untrusted input - critical security risk"
              : "eval() function detected - potential code execution vulnerability",
            {
              column,
              severity: hasUserInput ? "critical" : "high",
            }
          )
        );
      }
    } else {
      // Fallback to regex-based detection
      const evalPattern = /\beval\s*\(/g;
      let match;

      while ((match = evalPattern.exec(context.content)) !== null) {
        const line = this.findLineNumber(context.content, match.index);
        const column = this.findColumn(context.content, match.index);

        findings.push(
          this.createFinding(
            context,
            line,
            "eval() function detected - potential code execution vulnerability",
            { column }
          )
        );
      }
    }

    return findings;
  }

  private checkForUserInput(evalNode: EvalNode): boolean {
    // Check if source contains superglobal access ($_GET, $_POST, $_REQUEST, etc.)
    const userInputPatterns = ["_GET", "_POST", "_REQUEST", "_COOKIE", "_SERVER", "_FILES"];

    const sourceStr = JSON.stringify(evalNode.source);
    for (const pattern of userInputPatterns) {
      if (sourceStr.includes(pattern)) {
        return true;
      }
    }

    return false;
  }
}
