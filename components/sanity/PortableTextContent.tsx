import { PortableText } from '@portabletext/react';

interface PortableTextContentProps {
  content: any[] | string;
}

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <figure className="my-8">
          <img
            src={value.asset._ref}
            alt={value.alt || 'Content image'}
            className="w-full rounded-lg"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-600">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className="mt-8 mb-4 text-4xl font-bold text-govuk-blue">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="mt-6 mb-3 text-2xl font-bold text-govuk-blue">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mt-4 mb-2 text-xl font-semibold text-govuk-blue">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="mb-4 leading-relaxed text-gray-800">{children}</p>
    ),
  },
  marks: {
    em: ({ children }: any) => <em className="italic">{children}</em>,
    strong: ({ children }: any) => (
      <strong className="font-semibold">{children}</strong>
    ),
    code: ({ children }: any) => (
      <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
        {children}
      </code>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="mb-4 list-inside list-disc space-y-2 pl-4">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="mb-4 list-inside list-decimal space-y-2 pl-4">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li>{children}</li>,
    number: ({ children }: any) => <li>{children}</li>,
  },
};

export default function PortableTextContent({
  content,
}: PortableTextContentProps) {
  if (!content) {
    return null;
  }

  // Handle string content as plain text
  if (typeof content === 'string') {
    return (
      <div className="prose prose-sm max-w-none">
        <p className="govuk-body">{content}</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none">
      <PortableText value={content} components={portableTextComponents} />
    </div>
  );
}
