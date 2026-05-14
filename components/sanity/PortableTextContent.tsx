// components/sanity/PortableTextContent.tsx
import { PortableText } from '@portabletext/react';

const portableTextComponents = {
  block: {
    h1: ({ children }: any) => (
      <h1 className="govuk-heading-xl govuk-!-margin-top-9">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="govuk-heading-l govuk-!-margin-top-9">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="govuk-heading-m govuk-!-margin-top-6">{children}</h3>
    ),

    // ✅ This is the main fix
    normal: ({ children }: any) => (
      <p className="govuk-body-l govuk-!-margin-bottom-4">{children}</p>
    ),

    blockquote: ({ children }: any) => (
      <div className="govuk-inset-text">{children}</div>
    ),
  },

  marks: {
    strong: ({ children }: any) => <strong>{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
  },

  list: {
    bullet: ({ children }: any) => (
      <ul className="govuk-list govuk-list--bullet">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="govuk-list govuk-list--number">{children}</ol>
    ),
  },
};

interface PortableTextContentProps {
  content: any;
}

export default function PortableTextContent({ content }: PortableTextContentProps) {
  if (!content) return null;

  // Handle plain string fallback
  if (typeof content === 'string') {
    return <p className="govuk-body-l">{content}</p>;
  }

  return (
    <div className="govuk-!-margin-bottom-6">
      <PortableText value={content} components={portableTextComponents} />
    </div>
  );
}