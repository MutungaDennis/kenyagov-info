import { PortableText } from '@portabletext/react';
import Link from 'next/link';

const portableTextComponents = {
  block: {
    // Shrank dynamic content headings to clean statutory text proportions
    h1: ({ children }: any) => (
      <h3 className="govuk-heading-m govuk-!-margin-top-4 govuk-!-margin-bottom-2">{children}</h3>
    ),
    h2: ({ children }: any) => (
      <h4 className="govuk-heading-s govuk-!-margin-top-3 govuk-!-margin-bottom-1" style={{ fontSize: "18px" }}>{children}</h4>
    ),
    h3: ({ children }: any) => (
      <h5 className="govuk-heading-s govuk-!-margin-top-2 govuk-!-margin-bottom-1" style={{ fontSize: "16px" }}>{children}</h5>
    ),

    // Replaced 'govuk-body-l' (24px) with crisp, premium 'govuk-body-m' (16px) legal blocks
    normal: ({ children }: any) => (
      <p 
        className="govuk-body" 
        style={{ 
          fontSize: "16px", 
          lineHeight: "1.5", 
          marginBottom: "10px", 
          color: "#0b0c0c",
          letterSpacing: "-0.01em"
        }}
      >
        {children}
      </p>
    ),

    blockquote: ({ children }: any) => (
      <div 
        className="govuk-inset-text" 
        style={{ 
          marginTop: "8px", 
          marginBottom: "12px", 
          paddingTop: "6px", 
          paddingBottom: "6px",
          fontSize: "15px"
        }}
      >
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
          className="govuk-link govuk-link--no-underline"
          style={{ textDecoration: "none", color: "#1d70b8" }}
        >
          {children}
        </Link>
      );
    },
  },

  list: {
    // Tightened the bullet and numerical arrays to group lines tightly together
    bullet: ({ children }: any) => (
      <ul 
        className="govuk-list govuk-list--bullet" 
        style={{ marginTop: "4px", marginBottom: "8px", paddingLeft: "20px", fontSize: "16px" }}
      >
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol 
        className="govuk-list govuk-list--number" 
        style={{ marginTop: "4px", marginBottom: "8px", paddingLeft: "20px", fontSize: "16px" }}
      >
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
      <div 
        className={`whitespace-pre-line govuk-body ${className}`}
        style={{ 
          fontSize: "16px", 
          lineHeight: "1.5", 
          color: "#0b0c0c" 
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={`legislation-content-wrapper ${className}`} style={{ margin: 0 }}>
      <PortableText value={content} components={portableTextComponents} />
    </div>
  );
}
