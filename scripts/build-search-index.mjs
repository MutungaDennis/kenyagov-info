import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const publicFields = new Set(['title', 'description', 'summary', 'heading', 'text', 'label', 'name', 'intro', 'content', 'answer', 'question']);
const clean = value => value.replace(/&nbsp;|&#x20;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, ' ').trim();

/** Read visible literals, never execute page modules or index server code/config. */
export function extractPageText(source, filename = 'page.tsx') {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const text = [];
  let title = '', description = '';
  function visit(node) {
    if (ts.isJsxElement(node) && /^(script|style|nav)$/i.test(node.openingElement.tagName.getText(ast))) return;
    if (ts.isJsxText(node)) text.push(node.text);
    if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteralLike(node.expression)) text.push(node.expression.text);
    if (ts.isJsxAttribute(node) && publicFields.has(node.name.getText(ast)) && node.initializer && ts.isStringLiteral(node.initializer)) text.push(node.initializer.text);
    if (ts.isPropertyAssignment(node) && publicFields.has(node.name.getText(ast).replace(/['"]/g, '')) && ts.isStringLiteralLike(node.initializer)) {
      const key = node.name.getText(ast).replace(/['"]/g, '');
      text.push(node.initializer.text);
      if (key === 'title' && !title) title = node.initializer.text;
      if (key === 'description' && !description) description = node.initializer.text;
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return { title: clean(title), description: clean(description), content: clean(text.join(' ')) };
}

export function buildSearchIndex(root = process.cwd()) {
  const curated = JSON.parse(fs.readFileSync(path.join(root, 'public/data/site-search-pages.json'), 'utf8'));
  const pages = new Map(curated.filter(p => !/^\/(admin|api|auth|studio|search)(\/|$)/.test(p.path)).map(p => [p.path, p]));
  function walk(dir, segments = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (/^(admin|api|auth|studio|search|_.*|\[.*|@.*|.*test.*)$/.test(entry.name)) continue;
        walk(path.join(dir, entry.name), entry.name.startsWith('(') ? segments : [...segments, entry.name]);
      } else if (entry.name === 'page.tsx') {
        const source = fs.readFileSync(path.join(dir, entry.name), 'utf8');
        if (/\b(?:requireAdmin|requireAdminApi)\s*\(/.test(source) || /robots\s*:\s*\{\s*index\s*:\s*false/.test(source)) continue;
        const extracted = extractPageText(source);
        const route = '/' + segments.join('/');
        const previous = pages.get(route);
        if (extracted.content.length < 60 && !previous) continue;
        pages.set(route, { title: previous?.title || extracted.title || segments.at(-1)?.replace(/-/g, ' ') || 'CitizenGuide.KE', path: route,
          snippet: previous?.snippet || extracted.description || extracted.content.slice(0, 220),
          keywords: previous?.keywords || [], type: previous?.type || 'Page', content: extracted.content });
      }
    }
  }
  walk(path.join(root, 'app'));
  const output = [...pages.values()].sort((a, b) => a.path.localeCompare(b.path));
  fs.writeFileSync(path.join(root, 'public/data/site-search-content.json'), JSON.stringify(output));
  console.log(`Public search index: ${output.length} pages (${Math.round(JSON.stringify(output).length / 1024)} KiB)`);
  return output;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildSearchIndex();
