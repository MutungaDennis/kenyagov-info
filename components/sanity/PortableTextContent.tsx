import { PortableText } from '@portabletext/react';
import Link from 'next/link';

const portableTextComponents = {
  block: {
    // Shrank dynamic content headings to clean statutory text proportions
    h1: ({ children }: any) => (
      <h3 className="govuk-heading-m govuk-!-margin-top-4 govuk-!-margin-bottom-2">{children}</h3>
    ),
    h2: ({ children }: any) => (
      <h4 className="govuk-heading-s govuk-!-margin-top-3 govuk-!-margin-bottom-1">{children}</h4>
    ),
    h3: ({ children }: any) => (
      <h5 className="govuk-heading-s govuk-!-margin-top-2 govuk-!-margin-bottom-1">{children}</h5>
    ),

    normal: ({ children }: any) => (
      <p className="govuk-body">
        {children}
      </p>
    ),

    blockquote: ({ children }: any) => (
      <div className="govuk-inset-text">
        {children}
      </div>
    ),
  },

  marks: {
    strong: ({ children }: any) => <strong className="govuk-!-font-weight-bold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,

    internalLink: ({ children, value }: any) => {
      const { chapter, article } = value || {};
      if (!chapter || !article) return <span>{children}</span>;

      return (
        <Link 
          href={`/constitution/${chapter}/${article}`}
          className="govuk-link"
        >
          {children}
        </Link>
      );
    },
  },

  list: {
    // Tightened the bullet and numerical arrays to group lines tightly together
    bullet: ({ children }: any) => (
      <ul className="govuk-list govuk-list--bullet">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="govuk-list govuk-list--number">
        {children}
      </ol>
    ),
  },
};

interface PortableTextContentProps {
  content: any;
  className?: string;
}

export default function PortableTextContent({ content, className = "" }: PortableTextContentProps) {
  if (!content) return null;

  if (typeof content === 'string') {
    return (
      <div className={`whitespace-pre-line govuk-body ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <PortableText value={content} components={portableTextComponents} />
    </div>
  );
}
