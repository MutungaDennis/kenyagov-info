// lib/html-to-portable-text.ts
export function htmlToPortableText(html: string): any[] {
  if (!html || typeof html !== 'string' || html.trim() === '') return [];

  const blocks: any[] = [];
  let keyCounter = 0;
  const generateKey = () => `k${Date.now()}-${keyCounter++}-${Math.random().toString(36).substr(2, 9)}`;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function processChildren(element: Element): any[] {
    const children: any[] = [];
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        if (text && text.trim()) {
          children.push({ _type: 'span', _key: generateKey(), text: text });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childElement = child as Element;
        const tagName = childElement.tagName.toLowerCase();
        
        if (tagName === 'strong' || tagName === 'b') {
          childElement.childNodes.forEach((grandchild) => {
            if (grandchild.nodeType === Node.TEXT_NODE && grandchild.textContent?.trim()) {
              children.push({ _type: 'span', _key: generateKey(), text: grandchild.textContent, marks: ['strong'] });
            }
          });
        } else if (tagName === 'em' || tagName === 'i') {
          childElement.childNodes.forEach((grandchild) => {
            if (grandchild.nodeType === Node.TEXT_NODE && grandchild.textContent?.trim()) {
              children.push({ _type: 'span', _key: generateKey(), text: grandchild.textContent, marks: ['em'] });
            }
          });
        } else if (tagName === 'u') {
          childElement.childNodes.forEach((grandchild) => {
            if (grandchild.nodeType === Node.TEXT_NODE && grandchild.textContent?.trim()) {
              children.push({ _type: 'span', _key: generateKey(), text: grandchild.textContent, marks: ['underline'] });
            }
          });
        } else if (tagName === 's' || tagName === 'strike') {
          childElement.childNodes.forEach((grandchild) => {
            if (grandchild.nodeType === Node.TEXT_NODE && grandchild.textContent?.trim()) {
              children.push({ _type: 'span', _key: generateKey(), text: grandchild.textContent, marks: ['strike-through'] });
            }
          });
        } else if (tagName === 'code') {
          childElement.childNodes.forEach((grandchild) => {
            if (grandchild.nodeType === Node.TEXT_NODE && grandchild.textContent?.trim()) {
              children.push({ _type: 'span', _key: generateKey(), text: grandchild.textContent, marks: ['code'] });
            }
          });
        } else if (tagName === 'a') {
          const href = childElement.getAttribute('href');
          childElement.childNodes.forEach((grandchild) => {
            if (grandchild.nodeType === Node.TEXT_NODE && grandchild.textContent?.trim()) {
              children.push({ _type: 'span', _key: generateKey(), text: grandchild.textContent, marks: [{ _type: 'link', href: href || '#' }] });
            }
          });
        } else {
          children.push(...processChildren(childElement));
        }
      }
    });
    return children;
  }

  function convertTableToPortableText(tableElement: Element): any {
    const rows: any[] = [];
    const headers: string[] = [];
    const headerRow = tableElement.querySelector('thead tr') || tableElement.querySelector('tr');
    if (headerRow) {
      headerRow.querySelectorAll('th, td').forEach((cell) => {
        const text = cell.textContent?.trim() || '';
        if (text) headers.push(text);
      });
    }
    const dataRows = tableElement.querySelectorAll('tbody tr') || tableElement.querySelectorAll('tr');
    dataRows.forEach((row, index) => {
      if (index === 0 && headers.length > 0) return;
      const cells: string[] = [];
      row.querySelectorAll('td, th').forEach((cell) => cells.push(cell.textContent?.trim() || ''));
      if (cells.length > 0 && cells.some(c => c !== '')) {
        rows.push({ _key: generateKey(), cells });
      }
    });
    if (headers.length === 0 && rows.length === 0) return null;
    return { _type: 'constitutionTable', _key: generateKey(), headers, rows };
  }

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'h2' || tagName === 'h3' || tagName === 'h4') {
        const children = processChildren(element);
        if (children.length > 0) blocks.push({ _type: 'block', _key: generateKey(), style: tagName, children });
      } else if (tagName === 'p') {
        const children = processChildren(element);
        if (children.length > 0) blocks.push({ _type: 'block', _key: generateKey(), style: 'normal', children });
      } else if (tagName === 'ul' || tagName === 'ol') {
        const listStyle = tagName === 'ul' ? 'bullet' : 'number';
        Array.from(element.children).forEach((li) => {
          if (li.tagName.toLowerCase() === 'li') {
            const children = processChildren(li);
            if (children.length > 0) blocks.push({ _type: 'block', _key: generateKey(), style: 'normal', listItem: listStyle, children });
          }
        });
      } else if (tagName === 'blockquote') {
        const children = processChildren(element);
        if (children.length > 0) blocks.push({ _type: 'block', _key: generateKey(), style: 'blockquote', children });
      } else if (tagName === 'table') {
        const tableBlock = convertTableToPortableText(element);
        if (tableBlock) blocks.push(tableBlock);
      }
    }
  });

  return blocks;
}