// lib/portable-text-to-html.ts
export function portableTextToHtml(blocks: any[]): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  
  let html = '';
  let inList = false;
  let listType = '';

  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue;

    if (block._type === 'block') {
      const isList = block.listItem === 'bullet' || block.listItem === 'number';
      const currentListType = block.listItem === 'bullet' ? 'ul' : 'ol';

      const childrenHtml = (block.children || []).map((child: any) => {
        if (!child || typeof child !== 'object') return '';
        const text = typeof child.text === 'string' ? child.text : '';
        if (!text) return '';
        
        let formattedText = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

        const marks = child.marks || [];
        
        const linkMark = marks.find((m: any) => typeof m === 'object' && m._type === 'link');
        if (linkMark && linkMark.href) {
          formattedText = `<a href="${linkMark.href}" class="govuk-link">${formattedText}</a>`;
        }

        if (marks.includes('strong') || marks.includes('bold')) formattedText = `<strong>${formattedText}</strong>`;
        if (marks.includes('em') || marks.includes('italic')) formattedText = `<em>${formattedText}</em>`;
        if (marks.includes('underline')) formattedText = `<u>${formattedText}</u>`;
        if (marks.includes('strike-through') || marks.includes('strike')) formattedText = `<s>${formattedText}</s>`;
        if (marks.includes('code')) formattedText = `<code>${formattedText}</code>`;

        return formattedText;
      }).join('');

      if (isList) {
        if (!inList || listType !== currentListType) {
          if (inList) html += `</${listType}>`;
          html += `<${currentListType}>`;
          inList = true;
          listType = currentListType;
        }
        html += `<li>${childrenHtml}</li>`;
      } else {
        if (inList) {
          html += `</${listType}>`;
          inList = false;
        }

        if (block.style === 'h2') html += `<h2>${childrenHtml}</h2>`;
        else if (block.style === 'h3') html += `<h3>${childrenHtml}</h3>`;
        else if (block.style === 'h4') html += `<h4>${childrenHtml}</h4>`;
        else if (block.style === 'blockquote') html += `<blockquote>${childrenHtml}</blockquote>`;
        else html += `<p>${childrenHtml}</p>`;
      }
    } else if (block._type === 'constitutionTable') {
      if (inList) { html += `</${listType}>`; inList = false; }
      
      html += '<table class="govuk-table">';
      if (block.caption) html += `<caption class="govuk-table__caption">${block.caption}</caption>`;
      
      if (block.headers && Array.isArray(block.headers)) {
        html += '<thead class="govuk-table__head"><tr class="govuk-table__row">';
        block.headers.forEach((header: any) => {
          html += `<th scope="col" class="govuk-table__header">${String(header || '')}</th>`;
        });
        html += '</tr></thead>';
      }
      
      if (block.rows && Array.isArray(block.rows)) {
        html += '<tbody class="govuk-table__body">';
        block.rows.forEach((row: any) => {
          if (row && Array.isArray(row.cells)) {
            html += '<tr class="govuk-table__row">';
            row.cells.forEach((cell: any) => {
              html += `<td class="govuk-table__cell">${String(cell || '')}</td>`;
            });
            html += '</tr>';
          }
        });
        html += '</tbody>';
      }
      html += '</table>';
    }
  }
  
  if (inList) html += `</${listType}>`;
  return html;
}