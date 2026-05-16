// components/sanity/PortableTextContent.tsx
import { PortableText } from '@portabletext/react';
import Link from 'next/link';

const portableTextComponents = {
  block: {
    // Headings
    h1: ({ children }: any) => (
      <h1 className="govuk-heading-xl govuk-!-margin-top-9">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="govuk-heading-l govuk-!-margin-top-9">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="govuk-heading-m govuk-!-margin-top-6">{children}</h3>
    ),

    // Normal paragraphs with better spacing for legal text
    normal: ({ children }: any) => (
      <p className="govuk-body-l govuk-!-margin-bottom-6 leading-relaxed">
        {children}
      </p>
    ),

    // Blockquote / Inset for emphasis
    blockquote: ({ children }: any) => (
      <div className="govuk-inset-text govuk-!-margin-bottom-6">
        {children}
      </div>
    ),
  },

  marks: {
    strong: ({ children }: any) => <strong className="govuk-!-font-weight-bold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,

    // ✅ Internal Constitution Article Links
    internalLink: ({ children, value }: any) => {
      const { chapter, article } = value || {};
      if (!chapter || !article) return <span>{children}</span>;

      return (
        <Link 
          href={`/constitution/${chapter}/${article}`}
          className="govuk-link govuk-link--no-visited-state"
        >
          {children}
        </Link>
      );
    },
  },

  list: {
    bullet: ({ children }: any) => (
      <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="govuk-list govuk-list--number govuk-!-margin-bottom-6">{children}</ol>
    ),
  },
};

interface PortableTextContentProps {
  content: any;
  className?: string;
}

export default function PortableTextContent({ content, className = "" }: PortableTextContentProps) {
  if (!content) return null;

  // Fallback for plain string (old data)
  if (typeof content === 'string') {
    return (
      <div className={`whitespace-pre-line leading-relaxed govuk-body-l ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`govuk-!-margin-bottom-6 ${className}`}>
      <PortableText value={content} components={portableTextComponents} />
    </div>
  );
}