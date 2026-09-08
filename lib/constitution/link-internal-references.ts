const SCHEDULE_SLUGS: Record<
  string,
  string
> = {
  first: "first",
  second: "second",
  third: "third",
  fourth: "fourth",
  fifth: "fifth",
  sixth: "sixth",
};

function linkArticleReferences(
  text: string,
) {
  /*
   * Singular:
   *
   * Article 24
   * Article 24 (1)
   * Article 89(2)
   */
  text = text.replace(
    /\bArticle\s+(\d{1,3})(\s*\([^)]+\))?/gi,
    (
      full,
      articleNumber,
      clause = "",
    ) => {
      const number =
        Number(
          articleNumber,
        );

      if (
        number < 1 ||
        number > 264
      ) {
        return full;
      }

      return `<a class="govuk-link constitution-internal-link" href="/constitution/article/${number}">Article ${articleNumber}${clause}</a>`;
    },
  );

  /*
   * Plural:
   *
   * Articles 10 and 232
   * Articles 74, 141, 148 and 152
   *
   * We deliberately only transform numbers inside
   * the explicit "Articles ..." phrase.
   */
  text = text.replace(
    /\bArticles\s+(\d{1,3}(?:\s*(?:,\s*|\s+and\s+)\d{1,3})+)/gi,
    (
      full,
      articleList,
    ) => {
      const linked =
        String(
          articleList,
        ).replace(
          /\d{1,3}/g,
          (
            raw,
          ) => {
            const number =
              Number(raw);

            if (
              number < 1 ||
              number >
                264
            ) {
              return raw;
            }

            return `<a class="govuk-link constitution-internal-link" href="/constitution/article/${number}">${raw}</a>`;
          },
        );

      return `Articles ${linked}`;
    },
  );

  return text;
}

function linkScheduleReferences(
  text: string,
) {
  return text.replace(
    /\b(First|Second|Third|Fourth|Fifth|Sixth)\s+Schedule\b/gi,
    (
      full,
      ordinal,
    ) => {
      const slug =
        SCHEDULE_SLUGS[
          String(
            ordinal,
          ).toLowerCase()
        ];

      if (!slug) {
        return full;
      }

      return `<a class="govuk-link constitution-internal-link" href="/constitution/schedules/${slug}">${full}</a>`;
    },
  );
}

/**
 * Apply deterministic Constitution cross-links without
 * modifying existing HTML tags or manually curated links.
 *
 * Existing <a> elements are skipped, so manually linked
 * people/institutions/laws are never double-linked.
 */
export function linkInternalReferences(
  html: string,
) {
  if (!html) {
    return html;
  }

  const pieces =
    html.split(
      /(<[^>]+>)/g,
    );

  let anchorDepth = 0;

  return pieces
    .map(
      (piece) => {
        if (
          piece.startsWith(
            "<",
          )
        ) {
          if (
            /^<a\b/i.test(
              piece,
            )
          ) {
            anchorDepth +=
              1;
          }

          if (
            /^<\/a\b/i.test(
              piece,
            )
          ) {
            anchorDepth =
              Math.max(
                0,
                anchorDepth -
                  1,
              );
          }

          return piece;
        }

        if (
          anchorDepth > 0
        ) {
          return piece;
        }

        let output =
          piece;

        /*
         * Plural before singular so "Articles ..."
         * is processed as one expression.
         */
        output =
          linkScheduleReferences(
            output,
          );

        output =
          linkArticleReferences(
            output,
          );

        return output;
      },
    )
    .join("");
}