import { test, expect, describe } from "bun:test";
import { GamblingKeywordScanner } from "@/scanners/gambling-keyword";
import type { ScanContext } from "@/types";

function createContext(content: string): ScanContext {
  return {
    content,
    filePath: "/test/file.php",
    relativePath: "file.php",
    ast: null, // Content-based scanner doesn't need AST
  };
}

describe("GamblingKeywordScanner", () => {
  test("should have correct metadata", () => {
    const scanner = new GamblingKeywordScanner();

    expect(scanner.metadata.id).toBe("gambling-keyword");
    expect(scanner.metadata.category).toBe("content");
    expect(scanner.metadata.severity).toBe("medium");
  });

  test("should detect gambling keywords", () => {
    const scanner = new GamblingKeywordScanner();
    const context = createContext(`<?php
      echo "Welcome to our casino!";
      $slot = "jackpot winner";
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(3);
    expect(findings.map((f) => f.message)).toContain(
      'Gambling keyword detected: "casino"'
    );
    expect(findings.map((f) => f.message)).toContain(
      'Gambling keyword detected: "slot"'
    );
    expect(findings.map((f) => f.message)).toContain(
      'Gambling keyword detected: "jackpot"'
    );
  });

  test("should return correct line numbers", () => {
    const scanner = new GamblingKeywordScanner();
    const context = createContext(`<?php
// line 2
// line 3
$casino = true;
?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(1);
    expect(findings[0].line).toBe(4);
  });

  test("should not match partial words", () => {
    const scanner = new GamblingKeywordScanner();
    const context = createContext(`<?php
      $encasino = "not a match";
      $casinoing = "not a match";
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(0);
  });

  test("should be case insensitive", () => {
    const scanner = new GamblingKeywordScanner();
    const context = createContext(`<?php
      echo "CASINO";
      echo "Casino";
      echo "cAsInO";
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(3);
  });

  test("should support custom keywords", () => {
    const scanner = new GamblingKeywordScanner(["customword", "testword"]);
    const context = createContext(`<?php
      echo "customword here";
      echo "casino not detected";
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(1);
    expect(findings[0].message).toBe('Gambling keyword detected: "customword"');
  });

  test("should return empty array for clean file", () => {
    const scanner = new GamblingKeywordScanner();
    const context = createContext(`<?php
      function hello() {
        return "Hello, World!";
      }
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(0);
  });

  test("should include snippet in findings", () => {
    const scanner = new GamblingKeywordScanner();
    const context = createContext(`<?php
echo "casino";
?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(1);
    expect(findings[0].snippet).toBeDefined();
    expect(findings[0].snippet).toContain("casino");
  });

  test("should detect multiple occurrences of same keyword", () => {
    const scanner = new GamblingKeywordScanner();
    const context = createContext(`<?php
      $a = "casino";
      $b = "casino";
      $c = "casino";
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(3);
  });
});
