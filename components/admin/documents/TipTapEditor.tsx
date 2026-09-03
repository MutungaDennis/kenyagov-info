// components/admin/documents/TipTapEditor.tsx
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import Blockquote from '@tiptap/extension-blockquote';
import { Table } from '@tiptap/extension-table'; // ✅ Named import
import { TableRow } from '@tiptap/extension-table-row'; // ✅ Named import
import { TableCell } from '@tiptap/extension-table-cell'; // ✅ Named import
import { TableHeader } from '@tiptap/extension-table-header'; // ✅ Named import
import { useEffect } from 'react';

interface TipTapEditorProps {
  content?: string;
  onChange: (html: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Placeholder.configure({ placeholder: 'Start typing your document content here...\n\nUse the toolbar above to format text, add headings, create lists, or insert tables.' }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'govuk-link' } }),
      Underline, 
      Strike, 
      Code, 
      Blockquote,
      Table.configure({ resizable: true, HTMLAttributes: { class: 'govuk-table' } }),
      TableRow,
      TableCell.configure({ HTMLAttributes: { class: 'govuk-table__cell' } }),
      TableHeader.configure({ HTMLAttributes: { class: 'govuk-table__header' } }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const ToolbarButton = ({ onClick, isActive, title, children }: any) => (
    <button type="button" onClick={onClick} className={`tiptap-btn ${isActive ? 'active' : ''}`} title={title}>
      {children}
    </button>
  );

  return (
    <div className="tiptap-wrapper">
      <div className="tiptap-toolbar">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">↩️</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">↪️</ToolbarButton>
        <span className="tiptap-divider"></span>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><strong>B</strong></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><em>I</em></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><u>U</u></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough"><s>S</s></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">&lt;&gt;</ToolbarButton>
        <span className="tiptap-divider"></span>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} isActive={editor.isActive('heading', { level: 4 })} title="Heading 4">H4</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">❝</ToolbarButton>
        <span className="tiptap-divider"></span>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">• List</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">1. List</ToolbarButton>
        <span className="tiptap-divider"></span>
        <ToolbarButton onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} isActive={editor.isActive('link')} title="Insert Link">🔗 Link</ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">🔗❌</ToolbarButton>
        )}
        <span className="tiptap-divider"></span>
        <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table">📊 Table</ToolbarButton>
        {editor.can().deleteTable() && (
          <>
            <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Before">+Row↑</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">+Row↓</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">-Row</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">🗑️ Table</ToolbarButton>
          </>
        )}
      </div>
      <EditorContent editor={editor} className="tiptap-content" />

      <style jsx>{`
        .tiptap-wrapper { border: 1px solid #b1b4b6; border-radius: 0; background: #fff; }
        .tiptap-toolbar { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; background: #f3f2f1; border-bottom: 1px solid #b1b4b6; }
        .tiptap-btn { padding: 6px 10px; border: 1px solid #b1b4b6; background: #fff; cursor: pointer; font-size: 14px; font-family: inherit; transition: all 0.2s; border-radius: 2px; }
        .tiptap-btn:hover { background: #e8e6e3; }
        .tiptap-btn.active { background: #1d70b8; color: #fff; border-color: #1d70b8; }
        .tiptap-divider { width: 1px; background: #b1b4b6; margin: 0 4px; }
        .tiptap-content { min-height: 400px; padding: 20px; font-size: 19px; line-height: 1.6; }
        .tiptap-content :global(.tiptap) { outline: none; }
        .tiptap-content :global(.tiptap p) { margin-bottom: 1.5rem; }
        .tiptap-content :global(.tiptap h2) { font-size: 27px; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #b1b4b6; }
        .tiptap-content :global(.tiptap h3) { font-size: 24px; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .tiptap-content :global(.tiptap h4) { font-size: 19px; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .tiptap-content :global(.tiptap ul), .tiptap-content :global(.tiptap ol) { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .tiptap-content :global(.tiptap li) { margin-bottom: 0.5rem; }
        .tiptap-content :global(.tiptap blockquote) { border-left: 4px solid #1d70b8; padding-left: 1rem; margin: 1.5rem 0; color: #505a5f; font-style: italic; }
        .tiptap-content :global(.tiptap table) { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
        .tiptap-content :global(.tiptap th), .tiptap-content :global(.tiptap td) { border: 1px solid #b1b4b6; padding: 0.75rem; text-align: left; }
        .tiptap-content :global(.tiptap th) { background-color: #f3f2f1; font-weight: bold; }
        .tiptap-content :global(.tiptap a) { color: #1d70b8; text-decoration: underline; }
        .tiptap-content :global(.tiptap code) { background: #f3f2f1; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
        .tiptap-content :global(.tiptap p.is-editor-empty:first-child::before) { content: attr(data-placeholder); float: left; color: #505a5f; pointer-events: none; height: 0; font-style: italic; }
      `}</style>
    </div>
  );
}