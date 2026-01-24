import type { GatjorConfig } from "@/config";
import { join } from "path";

export interface ScannableFile {
  path: string;
  relativePath: string;
  matchedBy: "pattern" | "content";
}

const PHP_OPENING_TAGS = ["<?php", "<?=", "<?"];

async function containsPhpCode(filePath: string): Promise<boolean> {
  try {
    const file = Bun.file(filePath);
    const content = await file.text();

    for (const tag of PHP_OPENING_TAGS) {
      if (content.includes(tag)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

function matchesAnyPattern(filePath: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    const glob = new Bun.Glob(pattern);
    if (glob.match(filePath)) {
      return true;
    }
  }
  return false;
}

function isInExcludedDirectory(filePath: string, excludedDirs: string[]): boolean {
  for (const dir of excludedDirs) {
    const normalizedDir = dir.endsWith("/") ? dir : `${dir}/`;
    if (filePath.startsWith(normalizedDir) || filePath.includes(`/${normalizedDir}`)) {
      return true;
    }
  }
  return false;
}

function hasContentScanExtension(filePath: string, extensions: string[]): boolean {
  const lowerPath = filePath.toLowerCase();
  return extensions.some((ext) => lowerPath.endsWith(ext.toLowerCase()));
}

export async function collectFiles(
  scanPath: string,
  config: GatjorConfig
): Promise<ScannableFile[]> {
  const files: ScannableFile[] = [];
  const seenPaths = new Set<string>();

  // Phase 1: Collect files matching include patterns
  for (const pattern of config.include.patterns) {
    const glob = new Bun.Glob(pattern);

    try {
      for await (const match of glob.scan({ cwd: scanPath, onlyFiles: true })) {
        if (seenPaths.has(match)) continue;

        // Check exclusions
        if (isInExcludedDirectory(match, config.exclude.directories)) continue;
        if (matchesAnyPattern(match, config.exclude.patterns)) continue;
        if (config.exclude.files.includes(match)) continue;

        seenPaths.add(match);
        files.push({
          path: join(scanPath, match),
          relativePath: match,
          matchedBy: "pattern",
        });
      }
    } catch {
      // Pattern scan failed, continue
    }
  }

  // Phase 2: Content-based detection for suspicious extensions
  if (config.include.detect_by_content) {
    const allFilesGlob = new Bun.Glob("**/*");

    try {
      for await (const match of allFilesGlob.scan({ cwd: scanPath, onlyFiles: true })) {
        if (seenPaths.has(match)) continue;

        // Check exclusions
        if (isInExcludedDirectory(match, config.exclude.directories)) continue;
        if (matchesAnyPattern(match, config.exclude.patterns)) continue;
        if (config.exclude.files.includes(match)) continue;

        // Only check files with content scan extensions
        if (!hasContentScanExtension(match, config.include.content_scan_extensions)) continue;

        const fullPath = join(scanPath, match);
        if (await containsPhpCode(fullPath)) {
          seenPaths.add(match);
          files.push({
            path: fullPath,
            relativePath: match,
            matchedBy: "content",
          });
        }
      }
    } catch {
      // Scan failed, continue
    }
  }

  return files;
}

export async function collectSingleFile(
  filePath: string,
  config: GatjorConfig
): Promise<ScannableFile | null> {
  const file = Bun.file(filePath);
  const exists = await file.exists();

  if (!exists) {
    return null;
  }

  // Check if matches include patterns
  for (const pattern of config.include.patterns) {
    const glob = new Bun.Glob(pattern);
    if (glob.match(filePath)) {
      return {
        path: filePath,
        relativePath: filePath,
        matchedBy: "pattern",
      };
    }
  }

  // Check content-based detection
  if (config.include.detect_by_content) {
    if (await containsPhpCode(filePath)) {
      return {
        path: filePath,
        relativePath: filePath,
        matchedBy: "content",
      };
    }
  }

  return null;
}
