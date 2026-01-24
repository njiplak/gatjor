import type { ScannerMetadata, ScanContext, Finding } from "@/types";
import { BaseScanner } from "@/scanners/base";

const DEFAULT_KEYWORDS = [
  "slot",
  "casino",
  "poker",
  "togel",
  "judi",
  "taruhan",
  "jackpot",
  "betting",
  "gambling",
  "roulette",
  "blackjack",
  "baccarat",
  "sportsbook",
  "lottery",
];

export class GamblingKeywordScanner extends BaseScanner {
  readonly metadata: ScannerMetadata = {
    id: "gambling-keyword",
    name: "Gambling Keyword Detection",
    description: "Detects gambling-related keywords that may indicate SEO spam injection",
    category: "content",
    severity: "medium",
    recommendation:
      "Review the detected content. If unexpected, the file may have been compromised with SEO spam. Remove the malicious content and investigate how it was injected.",
  };

  private keywords: string[];

  constructor(keywords?: string[]) {
    super();
    this.keywords = keywords ?? DEFAULT_KEYWORDS;
  }

  scan(context: ScanContext): Finding[] {
    const findings: Finding[] = [];
    const contentLower = context.content.toLowerCase();

    for (const keyword of this.keywords) {
      const keywordLower = keyword.toLowerCase();
      let searchIndex = 0;

      while (true) {
        const index = contentLower.indexOf(keywordLower, searchIndex);
        if (index === -1) break;

        // Check word boundaries to avoid false positives
        const before = index > 0 ? contentLower[index - 1] : " ";
        const after =
          index + keywordLower.length < contentLower.length
            ? contentLower[index + keywordLower.length]
            : " ";

        const isWordBoundary = (char: string) =>
          /[\s\n\r\t.,;:'"!?()[\]{}<>=+\-*/\\|&^%$#@~`]/.test(char);

        if (isWordBoundary(before!) && isWordBoundary(after!)) {
          const line = this.findLineNumber(context.content, index);
          const column = this.findColumn(context.content, index);

          findings.push(
            this.createFinding(
              context,
              line,
              `Gambling keyword detected: "${keyword}"`,
              { column }
            )
          );
        }

        searchIndex = index + 1;
      }
    }

    return findings;
  }
}
