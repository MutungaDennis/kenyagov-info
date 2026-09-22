
import { safeHtml } from "@/lib/safe-html";
import {
  getPublicConstitutionInlineLinks,
} from "@/lib/constitution/get-public-inline-links";

import {
  renderLinkedConstitutionHtml,
} from "@/lib/constitution/render-linked-html";

type Props = {
  articleId: string;

  bodyHtml: string;

  bodyText?:
    | string
    | null;
};

function escapeHtml(
  value: string,
) {
  return value
    .replace(
      /&/g,
      "&amp;",
    )
    .replace(
      /</g,
      "&lt;",
    )
    .replace(
      />/g,
      "&gt;",
    );
}

function plainTextToHtml(
  bodyText: string,
) {
  return bodyText
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        paragraph.trim(),
    )
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p class="govuk-body">${escapeHtml(
          paragraph,
        ).replace(
          /\n/g,
          "<br>",
        )}</p>`,
    )
    .join("");
}

export default async function ConstitutionArticleContent({
  articleId,
  bodyHtml,
  bodyText,
}: Props) {
  /*
   * Load only verified curated inline relationships.
   */
  const links =
    await getPublicConstitutionInlineLinks(
      articleId,
    );

  const sourceHtml =
    bodyHtml?.trim()
      ? bodyHtml
      : bodyText
        ? plainTextToHtml(
            bodyText,
          )
        : "";

  if (!sourceHtml) {
    return (
      <p className="govuk-body">
        Article text is not
        available.
      </p>
    );
  }

  /*
   * The renderer:
   *
   * 1. changes curated relationship spans into real links;
   * 2. automatically links Article references;
   * 3. automatically links Schedule references.
   */
  const html =
    renderLinkedConstitutionHtml(
      sourceHtml,
      links,
    );

  return (
    <div
      className="constitution-article-body"
      dangerouslySetInnerHTML={{
        __html:
          safeHtml(html),
      }}
    />
  );
}