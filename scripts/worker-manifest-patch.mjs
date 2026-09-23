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
  const readers = calls(method).filter(call => call.arguments.some(arg => ts.isPropertyAccessExpression(arg) && arg.expression.kind === ts.SyntaxKind.ThisKeyword && arg.name.text === "middlewareManifestPath"));
  if (readers.length !== 1) throw new Error("Unexpected middleware manifest access. Review the adapter compatibility patch.");
  const reader = readers[0];
  if (isLoader(reader.expression)) return source; // upstream fixed, or already patched
  const target = unwrap(reader.expression);
  if (!ts.isIdentifier(target) || !/^(?:__)?require\d*$/.test(target.text)) throw new Error("Unexpected middleware loader; refusing to change its behavior.");
  const start = reader.expression.getStart(file);
  const end = reader.expression.end;
  return source.slice(0, start) + loaders[0].expression.getText(file) + source.slice(end);
}
