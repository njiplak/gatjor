import type { Scanner } from "@/types";
import type { ScanFunctionsConfig } from "@/config";

// Import all scanners
import { GamblingKeywordScanner } from "@/scanners/gambling-keyword";
import { DangerousEvalScanner } from "@/scanners/dangerous-eval";

// Register all available scanners
const ALL_SCANNERS: Scanner[] = [
  new GamblingKeywordScanner(),
  new DangerousEvalScanner(),
  // Add new scanners here as they are created:
  // new DangerousExecScanner(),
  // etc.
];

export function getAllScanners(): Scanner[] {
  return ALL_SCANNERS;
}

export function getScannerById(id: string): Scanner | undefined {
  return ALL_SCANNERS.find((s) => s.metadata.id === id);
}

export function getEnabledScanners(config: ScanFunctionsConfig): Scanner[] {
  const { enable, disable } = config;

  // If 'enable' is specified, only use those scanners
  if (enable && enable.length > 0) {
    return ALL_SCANNERS.filter((s) => enable.includes(s.metadata.id));
  }

  // Otherwise, use all scanners except those in 'disable'
  if (disable && disable.length > 0) {
    return ALL_SCANNERS.filter((s) => !disable.includes(s.metadata.id));
  }

  // Default: all scanners enabled
  return ALL_SCANNERS;
}

export function listScanners(): void {
  console.log("\nAvailable scan functions:\n");

  const byCategory = new Map<string, Scanner[]>();

  for (const scanner of ALL_SCANNERS) {
    const category = scanner.metadata.category;
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(scanner);
  }

  for (const [category, scanners] of byCategory) {
    console.log(`  ${category}:`);
    for (const scanner of scanners) {
      console.log(`    - ${scanner.metadata.id}`);
      console.log(`      ${scanner.metadata.description}`);
    }
    console.log("");
  }
}

// Re-export scanner classes for direct testing
export { GamblingKeywordScanner } from "@/scanners/gambling-keyword";
export { DangerousEvalScanner } from "@/scanners/dangerous-eval";
