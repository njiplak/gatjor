import { test, expect, describe } from "bun:test";
import { DangerousEvalScanner } from "@/scanners/dangerous-eval";
import { parsePhp } from "@/parser";
import type { ScanContext } from "@/types";

function createContext(content: string, useAst: boolean = true): ScanContext {
  return {
    content,
    filePath: "/test/file.php",
    relativePath: "file.php",
    ast: useAst ? parsePhp(content, "file.php") : null,
  };
}

describe("DangerousEvalScanner", () => {
  test("should have correct metadata", () => {
    const scanner = new DangerousEvalScanner();

    expect(scanner.metadata.id).toBe("dangerous-eval");
    expect(scanner.metadata.category).toBe("code-execution");
    expect(scanner.metadata.severity).toBe("critical");
  });

  test("should detect eval() with AST", () => {
    const scanner = new DangerousEvalScanner();
    const context = createContext(`<?php
      $code = "echo 'hello';";
      eval($code);
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(1);
    expect(findings[0].message).toContain("eval()");
    expect(findings[0].line).toBe(3);
  });

  test("should detect eval() with user input as critical", () => {
    const scanner = new DangerousEvalScanner();
    const context = createContext(`<?php
      eval($_GET['code']);
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(1);
    expect(findings[0].severity).toBe("critical");
    expect(findings[0].message).toContain("untrusted input");
  });

  test("should detect eval() with $_POST", () => {
    const scanner = new DangerousEvalScanner();
    const context = createContext(`<?php
      eval($_POST['cmd']);
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(1);
    expect(findings[0].severity).toBe("critical");
  });

  test("should detect eval() with $_REQUEST", () => {
    const scanner = new DangerousEvalScanner();
    const context = createContext(`<?php
      eval($_REQUEST['code']);
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(1);
    expect(findings[0].severity).toBe("critical");
  });

  test("should detect multiple eval() calls", () => {
    const scanner = new DangerousEvalScanner();
    const context = createContext(`<?php
      eval($code1);
      eval($code2);
      eval($code3);
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(3);
  });

  test("should work without AST (regex fallback)", () => {
    const scanner = new DangerousEvalScanner();
    const context = createContext(
      `<?php
      eval($code);
    ?>`,
      false
    );

    const findings = scanner.scan(context);

    expect(findings.length).toBe(1);
    expect(findings[0].message).toContain("eval()");
  });

  test("should return empty array for clean file", () => {
    const scanner = new DangerousEvalScanner();
    const context = createContext(`<?php
      function hello() {
        return "Hello, World!";
      }
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(0);
  });

  test("should not match 'eval' in strings or comments", () => {
    const scanner = new DangerousEvalScanner();
    const context = createContext(`<?php
      // eval() is dangerous
      $str = "eval is a function";
      /* eval should not be used */
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(0);
  });

  test("should include snippet in findings", () => {
    const scanner = new DangerousEvalScanner();
    const context = createContext(`<?php
eval($code);
?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(1);
    expect(findings[0].snippet).toBeDefined();
    expect(findings[0].snippet).toContain("eval");
  });

  test("should detect eval with complex expressions", () => {
    const scanner = new DangerousEvalScanner();
    const context = createContext(`<?php
      eval(base64_decode($_GET['code']));
    ?>`);

    const findings = scanner.scan(context);

    expect(findings.length).toBe(1);
    expect(findings[0].severity).toBe("critical");
  });
});
