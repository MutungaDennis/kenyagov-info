import ts from "typescript";

/** @param {string} source */
export function patchManifestSource(source) {
  const file = ts.createSourceFile("handler.mjs", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  /** @type {import('typescript').MethodDeclaration[]} */
  const methods = [];
  /** @param {import('typescript').Node} node */
  function visit(node) {
    if (ts.isMethodDeclaration(node) && node.name.getText(file) === "getMiddlewareManifest") methods.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (methods.length !== 1) throw new Error("Expected one Next.js middleware manifest reader. Review the adapter compatibility patch.");
  const method = methods[0];
  const owner = method.parent;
  if (!ts.isClassDeclaration(owner) && !ts.isClassExpression(owner)) throw new Error("Manifest reader is not a class method.");
  const pages = owner.members.find(member => ts.isMethodDeclaration(member) && member.name.getText(file) === "getPagesManifest");
  if (!pages) throw new Error("Cannot find the adjacent pages manifest reader.");
  /** @param {import('typescript').Expression} expression @returns {import('typescript').Expression} */
  function unwrap(expression) {
    if (ts.isParenthesizedExpression(expression)) return unwrap(expression.expression);
    if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.CommaToken) return unwrap(expression.right);
    return expression;
  }
  /** @param {import('typescript').Node} node @returns {import('typescript').CallExpression[]} */
  function calls(node) {
    /** @type {import('typescript').CallExpression[]} */
    const result = [];
    function walk(child) {
      if (ts.isCallExpression(child)) result.push(child);
      ts.forEachChild(child, walk);
    }
    walk(node);
    return result;
  }
  /** @param {import('typescript').Expression} expression */
  function isLoader(expression) {
    const target = unwrap(expression);
    return (ts.isPropertyAccessExpression(target) && target.name.text === "loadManifest") ||
      (ts.isIdentifier(target) && /^loadManifest\d*$/.test(target.text));
  }
  const loaders = calls(pages).filter(call => isLoader(call.expression));
  if (loaders.length !== 1) throw new Error("Cannot identify OpenNext's inlined manifest loader.");
  /** @param {import('typescript').Node} node */
  function referencesMiddlewareManifest(node) {
    if (
      (ts.isPropertyAccessExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ThisKeyword &&
        node.name.text === "middlewareManifestPath") ||
      (ts.isIdentifier(node) && node.text === "middlewareManifestPath") ||
      (ts.isStringLiteralLike(node) && node.text.includes("middleware-manifest"))
    ) {
      return true;
    }
    return node.forEachChild(referencesMiddlewareManifest) || false;
  }
  /** @param {import('typescript').Expression} expression */
  function isNodeRequire(expression) {
    const target = unwrap(expression);
    return ts.isIdentifier(target) && /^(?:__)?require\d*$/.test(target.text);
  }
  const candidates = calls(method).filter(call => call.arguments.some(referencesMiddlewareManifest));
  const readers = candidates.filter(call => isNodeRequire(call.expression));
  const existingLoaders = candidates.filter(call => isLoader(call.expression));
  if (readers.length === 0 && existingLoaders.length > 0) return source;
  if (readers.length === 0 && candidates.length > 0) {
    throw new Error("Unexpected middleware loader; refusing to change its behavior.");
  }
  // Newer adapters may no longer read the manifest from disk in this method.
  if (readers.length === 0 && !referencesMiddlewareManifest(method)) {
    console.warn(`Middleware manifest reader does not read from disk; leaving it unchanged: ${method.getText(file).slice(0, 300)}`);
    return source;
  }
  if (readers.length === 0) throw new Error("Unexpected middleware manifest access. Review the adapter compatibility patch.");
  let patched = source;
  for (const reader of readers.sort((a, b) => b.expression.getStart(file) - a.expression.getStart(file))) {
    const start = reader.expression.getStart(file);
    const end = reader.expression.end;
    patched = patched.slice(0, start) + loaders[0].expression.getText(file) + patched.slice(end);
  }
  return patched;
}
