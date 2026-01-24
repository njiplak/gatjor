import Engine from "php-parser";

// Create parser instance with default options
const parser = new Engine({
  parser: {
    extractDoc: true,
    php7: true,
    locations: true,
    suppressErrors: true,
  },
  ast: {
    withPositions: true,
    withSource: true,
  },
});

export type AST = ReturnType<typeof parser.parseCode>;
export type ASTNode = AST["children"][number];

export function parsePhp(code: string, filename: string = "unknown.php"): AST | null {
  try {
    return parser.parseCode(code, filename);
  } catch {
    return null;
  }
}

export function walkAst(
  node: ASTNode | AST,
  callback: (node: ASTNode, parent: ASTNode | AST | null) => boolean | void,
  parent: ASTNode | AST | null = null
): void {
  // Call callback - if it returns true, stop traversing children
  if ("kind" in node && callback(node as ASTNode, parent) === true) {
    return;
  }

  // Walk children
  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child && typeof child === "object") {
        walkAst(child as ASTNode, callback, node);
      }
    }
  }

  // Walk common node properties that contain child nodes
  const nodeAny = node as Record<string, unknown>;
  const childProps = [
    "body",
    "expr",
    "expression",
    "source",
    "left",
    "right",
    "arguments",
    "items",
    "what",
    "alternate",
    "consequent",
    "test",
    "init",
    "value",
    "key",
    "offset",
  ];

  for (const prop of childProps) {
    const value = nodeAny[prop];
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === "object" && "kind" in item) {
            walkAst(item as ASTNode, callback, node);
          }
        }
      } else if ("kind" in value) {
        walkAst(value as ASTNode, callback, node);
      }
    }
  }
}

export function findNodes(
  ast: AST | null,
  predicate: (node: ASTNode) => boolean
): ASTNode[] {
  if (!ast) return [];

  const results: ASTNode[] = [];

  walkAst(ast, (node) => {
    if (predicate(node)) {
      results.push(node);
    }
  });

  return results;
}

export function findFunctionCalls(ast: AST | null, functionName: string): ASTNode[] {
  return findNodes(ast, (node) => {
    if (node.kind !== "call") return false;

    const call = node as { kind: "call"; what: { kind: string; name?: string } };
    if (call.what?.kind === "name" && call.what?.name === functionName) {
      return true;
    }

    return false;
  });
}

export function findNodesByKind(ast: AST | null, kind: string): ASTNode[] {
  return findNodes(ast, (node) => node.kind === kind);
}
