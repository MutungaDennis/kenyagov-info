"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

type LinkType =
  | "person"
  | "institution"
  | "law"
  | "internal"
  | "external";

type SearchResult = {
  kind:
    | "leader"
    | "mca"
    | "institution"
    | "law";

  id: string;

  person_id?: string;
  institution_id?: string;

  document_id?: string;
  provision_id?: string | null;

  role_id?: string | null;
  role_title?: string | null;

  slug?: string | null;

  name: string;

  description?: string | null;

  organization?: string | null;

  historical_label?: string | null;
  current_name?: string | null;

  title?: string | null;
  short_title?: string | null;
  citation?: string | null;

  public_url?: string | null;
  href?: string | null;
};

type ExistingLink = {
  id: string;

  link_type:
    | "person"
    | "institution"
    | "law"
    | "internal"
    | "external";

  selected_text: string;

  semantic_role?:
    | string
    | null;

  historical_label?:
    | string
    | null;

  verification_status?:
    | string
    | null;

  leader_id?:
    | string
    | null;

  mca_id?:
    | string
    | null;

  leader_role_id?:
    | string
    | null;

  institution_id?:
    | string
    | null;

  target_document_id?:
    | string
    | null;

  target_provision_id?:
    | string
    | null;

  target_url?:
    | string
    | null;

  target_label?:
    | string
    | null;

  external_source_name?:
    | string
    | null;

  leader?: any;
  mca?: any;
  institution?: any;

  legal_document?: any;
  legal_provision?: any;

  target_name?:
    | string
    | null;

  target_href?:
    | string
    | null;
};

type ArticlePayload = {
  id: string;

  article_number: number;

  title: string;

  body_html?:
    | string
    | null;

  body_text?:
    | string
    | null;

  relationship_review_status?:
    | string
    | null;
};

type ArticleNavigationItem = {
  id: string;
  article_number: number;
  title: string;
};

type ApiPayload = {
  article:
    ArticlePayload;

  previous:
    | ArticleNavigationItem
    | null;

  next:
    | ArticleNavigationItem
    | null;

  links:
    ExistingLink[];
};

type Props = {
  articleId: string;
};

const BLOCK_SELECTOR =
  "p, li, td, th, h1, h2, h3, h4, blockquote";

const MAX_SELECTED_BLOCKS =
  4;

const PERSON_ROLES = [
  {
    value:
      "mentioned_person",
    label:
      "Mentioned person",
  },
  {
    value:
      "appointing_authority",
    label:
      "Appointing authority",
  },
  {
    value:
      "office_holder",
    label:
      "Office holder",
  },
  {
    value:
      "appoints",
    label:
      "Appoints",
  },
  {
    value:
      "nominates",
    label:
      "Nominates",
  },
  {
    value:
      "approves",
    label:
      "Approves",
  },
  {
    value:
      "removes",
    label:
      "Removes",
  },
  {
    value:
      "reports_to",
    label:
      "Reports to",
  },
  {
    value:
      "exercises_power",
    label:
      "Exercises power",
  },
];

const INSTITUTION_ROLES = [
  {
    value:
      "mentions",
    label:
      "Mentions",
  },
  {
    value:
      "establishes",
    label:
      "Establishes",
  },
  {
    value:
      "recognises",
    label:
      "Recognises",
  },
  {
    value:
      "assigns_function_to",
    label:
      "Assigns function to",
  },
  {
    value:
      "grants_power_to",
    label:
      "Grants power to",
  },
  {
    value:
      "imposes_duty_on",
    label:
      "Imposes duty on",
  },
  {
    value:
      "regulates",
    label:
      "Regulates",
  },
];

const LAW_ROLES = [
  {
    value:
      "references",
    label:
      "References",
  },
  {
    value:
      "required_legislation",
    label:
      "Required legislation",
  },
  {
    value:
      "implemented_by",
    label:
      "Implemented by",
  },
  {
    value:
      "gives_effect_to",
    label:
      "Gives effect to",
  },
  {
    value:
      "constitutional_basis",
    label:
      "Constitutional basis",
  },
  {
    value:
      "supplemented_by",
    label:
      "Supplemented by",
  },
  {
    value:
      "regulated_by",
    label:
      "Regulated by",
  },
];

function closestBlock(
  node:
    | Node
    | null,
): Element | null {
  const element =
    node?.nodeType ===
    Node.ELEMENT_NODE
      ? (node as Element)
      : node?.parentElement ??
        null;

  return (
    element?.closest(
      BLOCK_SELECTOR,
    ) ?? null
  );
}

function unwrapElement(
  element: Element,
) {
  const parent =
    element.parentNode;

  if (!parent) {
    return;
  }

  while (
    element.firstChild
  ) {
    parent.insertBefore(
      element.firstChild,
      element,
    );
  }

  parent.removeChild(
    element,
  );
}

function getSelectedTextNodes(
  container: HTMLElement,
  range: Range,
): Text[] {
  const walker =
    document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(
          node,
        ) {
          if (
            !node.textContent
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          try {
            return range.intersectsNode(
              node,
            )
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          } catch {
            return NodeFilter.FILTER_REJECT;
          }
        },
      },
    );

  const nodes: Text[] =
    [];

  let current =
    walker.nextNode();

  while (current) {
    nodes.push(
      current as Text,
    );

    current =
      walker.nextNode();
  }

  return nodes;
}

function selectedOffsetsForTextNode(
  node: Text,
  range: Range,
) {
  let start = 0;

  let end =
    node.data.length;

  if (
    range.startContainer ===
    node
  ) {
    start =
      range.startOffset;
  }

  if (
    range.endContainer ===
    node
  ) {
    end =
      range.endOffset;
  }

  return {
    start:
      Math.max(
        0,
        Math.min(
          start,
          node.data.length,
        ),
      ),

    end:
      Math.max(
        0,
        Math.min(
          end,
          node.data.length,
        ),
      ),
  };
}

function getBlocksBetween(
  container: HTMLElement,
  firstBlock: Element,
  lastBlock: Element,
) {
  const allBlocks =
    Array.from(
      container.querySelectorAll(
        BLOCK_SELECTOR,
      ),
    );

  const firstIndex =
    allBlocks.indexOf(
      firstBlock,
    );

  const lastIndex =
    allBlocks.indexOf(
      lastBlock,
    );

  if (
    firstIndex === -1 ||
    lastIndex === -1
  ) {
    return [];
  }

  const start =
    Math.min(
      firstIndex,
      lastIndex,
    );

  const end =
    Math.max(
      firstIndex,
      lastIndex,
    );

  return allBlocks.slice(
    start,
    end + 1,
  );
}

function targetName(
  link: ExistingLink,
) {
  if (
    link.target_name
  ) {
    return link.target_name;
  }

  if (
    link.link_type ===
    "person"
  ) {
    const person =
      link.leader ??
      link.mca;

    if (person) {
      return (
        [
          person.first_name,
          person.other_names,
          person.surname,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        person.full_name ||
        link.selected_text
      );
    }
  }

  if (
    link.link_type ===
    "institution"
  ) {
    return (
      link.institution
        ?.short_name ||
      link.institution?.name ||
      link.selected_text
    );
  }

  if (
    link.link_type ===
    "law"
  ) {
    return (
      link.legal_document
        ?.short_title ||
      link.legal_document
        ?.title ||
      link.selected_text
    );
  }

  if (
    link.link_type ===
      "internal" ||
    link.link_type ===
      "external"
  ) {
    return (
      link.target_label ||
      link.target_url ||
      link.selected_text
    );
  }

  return link.selected_text;
}

export default function ConstitutionRelationships({
  articleId,
}: Props) {
  const contentRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    article,
    setArticle,
  ] =
    useState<ArticlePayload | null>(
      null,
    );


  const [
    previousArticle,
    setPreviousArticle,
  ] =
    useState<ArticleNavigationItem | null>(
      null,
    );

  const [
    nextArticle,
    setNextArticle,
  ] =
    useState<ArticleNavigationItem | null>(
      null,
    );

  /*
   * Exactly like Gazette:
   * keep the displayed/persisted HTML in state.
   */
  const [
    html,
    setHtml,
  ] =
    useState("");

  const [
    links,
    setLinks,
  ] =
    useState<
      ExistingLink[]
    >([]);

  const [
    selectedText,
    setSelectedText,
  ] =
    useState("");

  const [
    pendingSelectionId,
    setPendingSelectionId,
  ] =
    useState<
      string | null
    >(null);

  const [
    selectedBlockCount,
    setSelectedBlockCount,
  ] =
    useState(0);

  const [
    linkType,
    setLinkType,
  ] =
    useState<LinkType>(
      "person",
    );

  const [
    searchQ,
    setSearchQ,
  ] =
    useState("");

  const [
    manualUrl,
    setManualUrl,
  ] =
    useState("");

  const [
    manualLabel,
    setManualLabel,
  ] =
    useState("");

  const [
    externalSourceName,
    setExternalSourceName,
  ] =
    useState("");

  const [
    results,
    setResults,
  ] =
    useState<
      SearchResult[]
    >([]);

  const [
    selectedEntity,
    setSelectedEntity,
  ] =
    useState<
      SearchResult | null
    >(null);

  const [
    semanticRole,
    setSemanticRole,
  ] =
    useState(
      "mentioned_person",
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    searching,
    setSearching,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(null);

  const [
    reviewStatus,
    setReviewStatus,
  ] =
    useState(
      "Not reviewed",
    );

  /* =======================================================
     Load Article + saved links
     ======================================================= */

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await fetch(
              `/api/admin/constitution/article-relationships/${articleId}`,
              {
                credentials:
                  "include",

                cache:
                  "no-store",

                headers: {
                  Accept:
                    "application/json",
                },
              },
            );

          const text =
            await response.text();

          let json: any;

          try {
            json =
              text
                ? JSON.parse(
                    text,
                  )
                : {};
          } catch {
            throw new Error(
              `The Constitution relationship API returned non-JSON content (${response.status}).`,
            );
          }

          if (
            !response.ok
          ) {
            throw new Error(
              json.error ||
                "Failed to load Constitution relationships.",
            );
          }

          const payload =
            json.data ??
            json;

          const currentArticle =
            payload.article ??
            null;

          setArticle(
            currentArticle,
          );

          setPreviousArticle(
            payload.previous ??
              null,
          );

          setNextArticle(
            payload.next ??
              null,
          );

          /*
           * CRITICAL:
           * Reload the actual persisted body_html.
           */
          setHtml(
            currentArticle
              ?.body_html ||
              "",
          );

          setLinks(
            payload.links ??
              [],
          );

          setReviewStatus(
            currentArticle
              ?.relationship_review_status ||
              "Not reviewed",
          );

          setPendingSelectionId(
            null,
          );

          setSelectedBlockCount(
            0,
          );
        } catch (err) {
          setError(
            err instanceof
              Error
              ? err.message
              : "Failed to load Constitution relationships.",
          );
        } finally {
          setLoading(false);
        }
      },
      [articleId],
    );

  useEffect(() => {
    void load();
  }, [load]);

  /* =======================================================
     Cancel pending marker
     ======================================================= */

  const cancelPendingSelection =
    () => {
      const container =
        contentRef.current;

      if (container) {
        const pending =
          Array.from(
            container.querySelectorAll<HTMLElement>(
              "[data-constitution-pending-link]",
            ),
          );

        pending.forEach(
          (
            element,
          ) =>
            unwrapElement(
              element,
            ),
        );

        container.normalize();

        setHtml(
          container.innerHTML,
        );
      }

      setPendingSelectionId(
        null,
      );

      setSelectedBlockCount(
        0,
      );

      setSelectedText("");

      setSearchQ("");

      setManualUrl("");
      setManualLabel("");
      setExternalSourceName("");

      setResults([]);

      setSelectedEntity(
        null,
      );

      setMessage(null);
    };

  /* =======================================================
     Selection — same mechanism as Gazette
     ======================================================= */

  const captureSelection =
    () => {
      setError(null);
      setMessage(null);

      const container =
        contentRef.current;

      const selection =
        window.getSelection();

      if (
        !container ||
        !selection ||
        selection.rangeCount ===
          0
      ) {
        return;
      }

      /*
       * There can only be one pending link at a time.
       */
      if (
        pendingSelectionId
      ) {
        /*
         * Mouse-up can fire when interacting with the form
         * after selection. Do not destroy the existing marker.
         */
        selection.removeAllRanges();
        return;
      }

      const range =
        selection.getRangeAt(
          0,
        );

      const text =
        selection
          .toString()
          .replace(
            /\s+/g,
            " ",
          )
          .trim();

      if (
        !text ||
        !container.contains(
          range.commonAncestorContainer,
        )
      ) {
        return;
      }

      const textNodes =
        getSelectedTextNodes(
          container,
          range,
        ).filter(
          (
            node,
          ) => {
            const {
              start,
              end,
            } =
              selectedOffsetsForTextNode(
                node,
                range,
              );

            return (
              end >
                start &&
              node.data
                .slice(
                  start,
                  end,
                )
                .trim()
                .length >
                0
            );
          },
        );

      if (
        textNodes.length ===
        0
      ) {
        selection.removeAllRanges();
        return;
      }

      const firstBlock =
        closestBlock(
          textNodes[0],
        );

      const lastBlock =
        closestBlock(
          textNodes[
            textNodes.length -
              1
          ],
        );

      if (
        !firstBlock ||
        !lastBlock
      ) {
        setError(
          "Select wording inside the Article paragraphs, headings, list items or table cells.",
        );

        selection.removeAllRanges();

        return;
      }

      const selectedBlocks =
        getBlocksBetween(
          container,
          firstBlock,
          lastBlock,
        );

      if (
        selectedBlocks.length ===
          0 ||
        selectedBlocks.length >
          MAX_SELECTED_BLOCKS
      ) {
        setError(
          `Select text across no more than ${MAX_SELECTED_BLOCKS} adjacent Constitution text blocks.`,
        );

        selection.removeAllRanges();

        return;
      }

      const selectedBlockSet =
        new Set(
          selectedBlocks,
        );

      const crossesUnsupportedStructure =
        textNodes.some(
          (
            node,
          ) => {
            const block =
              closestBlock(
                node,
              );

            return (
              !block ||
              !selectedBlockSet.has(
                block,
              )
            );
          },
        );

      if (
        crossesUnsupportedStructure
      ) {
        setError(
          "The selection crosses unsupported Article structure. Select the exact person, institution or law wording only.",
        );

        selection.removeAllRanges();

        return;
      }

      /*
       * Do not allow selecting wording already linked.
       */
      const touchesExistingLink =
        textNodes.some(
          (
            node,
          ) =>
            node.parentElement?.closest(
              "[data-constitution-inline-link]",
            ),
        );

      if (
        touchesExistingLink
      ) {
        setError(
          "Part of that wording is already linked. Unlink the existing relationship before changing it.",
        );

        selection.removeAllRanges();

        return;
      }

      const pendingId =
        crypto.randomUUID();

      try {
        /*
         * Like Gazette, wrap each selected text fragment.
         * This allows selections spanning adjacent blocks.
         */
        for (
          let i =
            textNodes.length -
            1;
          i >= 0;
          i -= 1
        ) {
          const node =
            textNodes[i];

          const {
            start,
            end,
          } =
            selectedOffsetsForTextNode(
              node,
              range,
            );

          if (
            end <= start
          ) {
            continue;
          }

          const selectedPiece =
            node.data.slice(
              start,
              end,
            );

          if (
            !selectedPiece.trim()
          ) {
            continue;
          }

          const localRange =
            document.createRange();

          localRange.setStart(
            node,
            start,
          );

          localRange.setEnd(
            node,
            end,
          );

          const marker =
            document.createElement(
              "span",
            );

          marker.setAttribute(
            "data-constitution-pending-link",
            pendingId,
          );

          marker.setAttribute(
            "title",
            "Pending Constitution relationship",
          );

          marker.className =
            "constitution-inline-pending";

          const fragment =
            localRange.extractContents();

          marker.appendChild(
            fragment,
          );

          localRange.insertNode(
            marker,
          );
        }

        container.normalize();

        /*
         * CRITICAL #1:
         * put yellow marker HTML into React state immediately.
         */
        setHtml(
          container.innerHTML,
        );

        setPendingSelectionId(
          pendingId,
        );

        setSelectedBlockCount(
          selectedBlocks.length,
        );

        setSelectedText(
          text,
        );

        /*
         * CRITICAL #2:
         * selected wording automatically becomes search text.
         */
        setSearchQ(
          text,
        );

        setResults([]);

        setSelectedEntity(
          null,
        );

        /*
         * Default to person as Gazette does.
         * User can switch to Institution or Law.
         */
        setLinkType(
          "person",
        );

        setSemanticRole(
          "mentioned_person",
        );

        selection.removeAllRanges();
      } catch {
        const pending =
          Array.from(
            container.querySelectorAll<HTMLElement>(
              `[data-constitution-pending-link="${pendingId}"]`,
            ),
          );

        pending.forEach(
          (
            element,
          ) =>
            unwrapElement(
              element,
            ),
        );

        container.normalize();

        setHtml(
          container.innerHTML,
        );

        setError(
          "CitizenGuide could not safely mark that selection. Select the exact wording again.",
        );
      }
    };

  /* =======================================================
     Type switch
     ======================================================= */

  const switchType = (
    type: LinkType,
  ) => {
    setLinkType(type);
    setResults([]);
    setSelectedEntity(null);
    setMessage(null);

    if (type === "person") {
      setSemanticRole("mentioned_person");
    } else if (type === "institution") {
      setSemanticRole("mentions");
    } else if (type === "law") {
      setSemanticRole("references");
    } else if (type === "internal") {
      setSemanticRole("related_internal");
    } else {
      setSemanticRole("official_source");
    }

    /*
     * Person / institution / law searches start with the
     * exact selected wording. Manual URL modes keep their own fields.
     */
    if (
      ["person", "institution", "law"].includes(type) &&
      !searchQ.trim() &&
      selectedText
    ) {
      setSearchQ(selectedText);
    }
  };

  /* =======================================================
     Search
     ======================================================= */

  const searchEntities =
    async (
      event?:
        FormEvent,
    ) => {
      event?.preventDefault();

      const query =
        searchQ.trim();

      if (
        query.length <
        2
      ) {
        setError(
          "Enter at least 2 characters to search.",
        );

        return;
      }

      setSearching(true);
      setError(null);
      setMessage(null);

      setSelectedEntity(
        null,
      );

      try {
        if (
          linkType ===
          "law"
        ) {
          const params =
            new URLSearchParams(
              {
                q: query,
              },
            );

          const response =
            await fetch(
              `/api/admin/constitution/legal-search?${params.toString()}`,
              {
                credentials:
                  "include",

                cache:
                  "no-store",
              },
            );

          const json =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              json.error ||
                "Law search failed.",
            );
          }

          const rows =
            json.data ??
            json.results ??
            [];

          setResults(
            rows.map(
              (
                row: any,
              ) => ({
                ...row,

                kind:
                  "law",

                id:
                  row.id ||
                  `law:${row.document_id}`,

                name:
                  row.name ||
                  row.short_title ||
                  row.title ||
                  row.citation ||
                  "Legal document",
              }),
            ),
          );

          if (
            !rows.length
          ) {
            setMessage(
              "No matching laws were found.",
            );
          }

          return;
        }

        const params =
          new URLSearchParams(
            {
              q:
                query,

              kind:
                linkType ===
                "person"
                  ? "people"
                  : "institutions",
            },
          );

        const response =
          await fetch(
            `/api/admin/gazette/entity-search?${params.toString()}`,
            {
              credentials:
                "include",

              cache:
                "no-store",
            },
          );

        const json =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            json.error ||
              "Entity search failed.",
          );
        }

        setResults(
          json.data ??
            [],
        );

        if (
          !json.data
            ?.length
        ) {
          setMessage(
            linkType ===
              "person"
              ? "No matching people were found."
              : "No matching institutions were found.",
          );
        }
      } catch (
        err
      ) {
        setError(
          err instanceof
            Error
            ? err.message
            : "Search failed.",
        );

        setResults([]);
      } finally {
        setSearching(false);
      }
    };

  /* =======================================================
     Save — mirrors Gazette
     ======================================================= */

  const saveLink =
    async () => {
      if (
        !selectedText
      ) {
        setError(
          "Select wording in the Article first.",
        );

        return;
      }

      const usesStructuredTarget =
        linkType === "person" ||
        linkType === "institution" ||
        linkType === "law";

      if (
        usesStructuredTarget &&
        !selectedEntity
      ) {
        setError(
          "Choose the person, institution or law this wording represents.",
        );
        return;
      }

      if (
        (linkType === "internal" || linkType === "external") &&
        !manualUrl.trim()
      ) {
        setError(
          linkType === "internal"
            ? "Enter the CitizenGuide path you want this wording to open."
            : "Enter the official external HTTPS URL you want this wording to open.",
        );
        return;
      }

      if (
        linkType === "internal" &&
        !manualUrl.trim().startsWith("/")
      ) {
        setError(
          "Internal CitizenGuide links must be a relative path beginning with /, for example /acts/parliament.",
        );
        return;
      }

      if (linkType === "external") {
        try {
          const parsed = new URL(manualUrl.trim());
          if (parsed.protocol !== "https:") {
            throw new Error("https only");
          }
        } catch {
          setError(
            "External official sources must be a valid HTTPS URL, for example https://new.kenyalaw.org/...",
          );
          return;
        }
      }

      const container =
        contentRef.current;

      if (
        !container ||
        !pendingSelectionId
      ) {
        setError(
          "The selected wording marker is no longer available. Select the wording again.",
        );

        return;
      }

      /*
       * There can be more than one fragment for a
       * multi-block selection, exactly like Gazette.
       */
      const pendingMarkers =
        Array.from(
          container.querySelectorAll<HTMLElement>(
            `[data-constitution-pending-link="${pendingSelectionId}"]`,
          ),
        );

      if (
        pendingMarkers.length ===
        0
      ) {
        setError(
          "The selected wording marker is no longer available. Select the wording again.",
        );

        return;
      }

      setSaving(true);
      setError(null);
      setMessage(null);

      const inlineLinkId =
        crypto.randomUUID();

      /*
       * CRITICAL #3:
       * Convert the yellow pending marker to the permanent
       * linked marker BEFORE reading container.innerHTML.
       */
      pendingMarkers.forEach(
        (
          pending,
        ) => {
          pending.removeAttribute(
            "data-constitution-pending-link",
          );

          pending.removeAttribute(
            "title",
          );

          pending.setAttribute(
            "data-constitution-inline-link",
            inlineLinkId,
          );

          pending.setAttribute(
            "title",
            "Linked Constitution relationship",
          );

          pending.className =
            "constitution-inline-entity";
        },
      );

      /*
       * This HTML now contains the PERMANENT marker.
       * This exact HTML must be written into
       * constitution_articles.body_html.
       */
      const nextHtml =
        container.innerHTML;

      const basePayload: Record<
        string,
        any
      > = {
        id:
          inlineLinkId,

        link_type:
          linkType,

        selected_text:
          selectedText,

        historical_label:
          selectedText,

        semantic_role:
          semanticRole,

        content_html:
          nextHtml,

        verification_status:
          "Verified",
      };

      if (
        linkType ===
        "person"
      ) {
        basePayload.person_kind =
          selectedEntity!.kind;

        basePayload.person_id =
          selectedEntity!.person_id;

        basePayload.leader_role_id =
          selectedEntity!.role_id ||
          null;

        basePayload.capacity_title =
          selectedEntity!.role_title ||
          null;

        basePayload.organization_name =
          selectedEntity!.organization ||
          null;
      }

      if (
        linkType ===
        "institution"
      ) {
        basePayload.institution_id =
          selectedEntity!.institution_id;

        basePayload.historical_label =
          selectedEntity!.historical_label ||
          selectedText;

        basePayload.organization_name =
          selectedEntity!.current_name ||
          selectedEntity!.name ||
          null;
      }

      if (
        linkType ===
        "law"
      ) {
        basePayload.target_document_id =
          selectedEntity!.document_id;

        basePayload.target_provision_id =
          selectedEntity!.provision_id ||
          null;

        basePayload.historical_label =
          selectedText;
      }

      if (linkType === "internal") {
        basePayload.target_url = manualUrl.trim();
        basePayload.target_label =
          manualLabel.trim() || selectedText;
        basePayload.external_source_name = null;
      }

      if (linkType === "external") {
        basePayload.target_url = manualUrl.trim();
        basePayload.target_label =
          manualLabel.trim() || selectedText;
        basePayload.external_source_name =
          externalSourceName.trim() || null;
      }

      try {
        const response =
          await fetch(
            `/api/admin/constitution/article-relationships/${articleId}`,
            {
              method:
                "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify(
                  basePayload,
                ),
            },
          );

        const text =
          await response.text();

        let json: any =
          {};

        try {
          json =
            text
              ? JSON.parse(
                  text,
                )
              : {};
        } catch {
          throw new Error(
            `Save returned non-JSON content (${response.status}).`,
          );
        }

        if (
          !response.ok
        ) {
          throw new Error(
            json.error ||
              "Constitution link could not be saved.",
          );
        }

        /*
         * Keep permanent linked marker visible immediately.
         */
        setHtml(
          nextHtml,
        );

        setPendingSelectionId(
          null,
        );

        setSelectedBlockCount(
          0,
        );

        const savedText =
          selectedText;

        setSelectedText(
          "",
        );

        setSearchQ("");
        setManualUrl("");
        setManualLabel("");
        setExternalSourceName("");

        setResults([]);

        setSelectedEntity(
          null,
        );

        setMessage(
          `"${savedText}" is now linked to the selected ${linkType}.`,
        );

        /*
         * CRITICAL #4:
         * reload DB body_html + relationship rows.
         *
         * If the permanent marker survives this reload,
         * we KNOW it was actually persisted.
         */
        await load();
      } catch (
        err
      ) {
        /*
         * Restore permanent markers back to pending yellow
         * markers when the API fails, exactly like Gazette.
         */
        const savedMarkers =
          Array.from(
            container.querySelectorAll<HTMLElement>(
              `[data-constitution-inline-link="${inlineLinkId}"]`,
            ),
          );

        savedMarkers.forEach(
          (
            marker,
          ) => {
            marker.removeAttribute(
              "data-constitution-inline-link",
            );

            marker.setAttribute(
              "data-constitution-pending-link",
              pendingSelectionId,
            );

            marker.setAttribute(
              "title",
              "Pending Constitution relationship",
            );

            marker.className =
              "constitution-inline-pending";
          },
        );

        setHtml(
          container.innerHTML,
        );

        setError(
          err instanceof
            Error
            ? err.message
            : "Constitution link could not be saved.",
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     Unlink
     ======================================================= */

  const unlink =
    async (
      linkId: string,
    ) => {
      if (
        !window.confirm(
          "Remove this inline link? The Constitution wording will remain unchanged.",
        )
      ) {
        return;
      }

      setError(null);
      setMessage(null);

      try {
        const response =
          await fetch(
            `/api/admin/constitution/article-relationships/${articleId}?link_id=${encodeURIComponent(
              linkId,
            )}`,
            {
              method:
                "DELETE",

              credentials:
                "include",

              cache:
                "no-store",
            },
          );

        const json =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            json.error ||
              "Could not remove Constitution link.",
          );
        }

        setMessage(
          "Relationship removed. The Constitution wording has been preserved.",
        );

        await load();
      } catch (
        err
      ) {
        setError(
          err instanceof
            Error
            ? err.message
            : "Could not remove Constitution link.",
        );
      }
    };

  /* =======================================================
     Review status
     ======================================================= */

  const saveReviewStatus =
    async () => {
      setError(null);
      setMessage(null);

      try {
        const response =
          await fetch(
            `/api/admin/constitution/article-relationships/${articleId}`,
            {
              method:
                "PATCH",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    relationship_review_status:
                      reviewStatus,
                  },
                ),
            },
          );

        const json =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            json.error ||
              "Could not update review status.",
          );
        }

        setMessage(
          "Relationship review status updated.",
        );

        await load();
      } catch (
        err
      ) {
        setError(
          err instanceof
            Error
            ? err.message
            : "Could not update review status.",
        );
      }
    };

  /* =======================================================
     Helpers
     ======================================================= */

  const roleOptions =
    linkType === "person"
      ? PERSON_ROLES
      : linkType === "institution"
        ? INSTITUTION_ROLES
        : linkType === "law"
          ? LAW_ROLES
          : linkType === "internal"
            ? [{ value: "related_internal", label: "Related CitizenGuide page" }]
            : [{ value: "official_source", label: "Official external source" }];

  const resultDescription =
    (
      result:
        SearchResult,
    ) => {
      if (
        result.kind ===
        "law"
      ) {
        return [
          result.citation,
          result.description,
        ]
          .filter(Boolean)
          .join(" · ");
      }

      return (
        result.description ||
        result.role_title ||
        result.organization ||
        ""
      );
    };

  if (loading) {
    return (
      <div
        className="govuk-inset-text"
        aria-live="polite"
      >
        Loading Constitution
        relationships…
      </div>
    );
  }

  if (!article) {
    return (
      <div
        className="govuk-error-summary"
        role="alert"
      >
        <h2 className="govuk-error-summary__title">
          Constitution Article
          could not be loaded
        </h2>

        <div className="govuk-error-summary__body">
          <p className="govuk-body">
            {error ||
              "Article not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="constitution-admin-linking">
      {error ? (
        <div
          className="govuk-error-summary"
          role="alert"
          aria-labelledby="constitution-link-error-title"
        >
          <h2
            id="constitution-link-error-title"
            className="govuk-error-summary__title"
          >
            There is a problem
          </h2>

          <div className="govuk-error-summary__body">
            <p className="govuk-body govuk-!-margin-bottom-0">
              {error}
            </p>
          </div>
        </div>
      ) : null}

      {message ? (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="region"
          aria-labelledby="constitution-link-success-title"
        >
          <div className="govuk-notification-banner__header">
            <h2
              id="constitution-link-success-title"
              className="govuk-notification-banner__title"
            >
              Success
            </h2>
          </div>

          <div className="govuk-notification-banner__content">
            <p className="govuk-body govuk-!-margin-bottom-0">
              {message}
            </p>
          </div>
        </div>
      ) : null}

      <span className="govuk-caption-xl">
        Article{" "}
        {article.article_number}
      </span>

      <h1 className="govuk-heading-xl">
        Relationships
      </h1>

      <p className="govuk-body-l">
        {article.title}
      </p>

      <nav
        className="constitution-admin-article-navigation govuk-!-margin-bottom-6"
        aria-label="Constitution Article navigation"
      >
        <div className="constitution-admin-article-navigation__grid">
          <div className="constitution-admin-article-navigation__previous">
            {previousArticle ? (
              <Link
                className="govuk-link govuk-link--no-visited-state constitution-admin-article-navigation__link"
                href={`/admin/constitution/articles/${previousArticle.id}/relationships`}
              >
                <span
                  className="constitution-admin-article-navigation__arrow"
                  aria-hidden="true"
                >
                  ←
                </span>

                <span className="constitution-admin-article-navigation__content">
                  <span className="constitution-admin-article-navigation__label">
                    Previous Article
                  </span>

                  <span className="constitution-admin-article-navigation__title">
                    Article {previousArticle.article_number}
                    {previousArticle.title
                      ? `: ${previousArticle.title}`
                      : ""}
                  </span>
                </span>
              </Link>
            ) : (
              <span className="govuk-body-s govuk-!-margin-bottom-0 constitution-admin-article-navigation__unavailable">
                This is the first Article.
              </span>
            )}
          </div>

          <div className="constitution-admin-article-navigation__next">
            {nextArticle ? (
              <Link
                className="govuk-link govuk-link--no-visited-state constitution-admin-article-navigation__link constitution-admin-article-navigation__link--next"
                href={`/admin/constitution/articles/${nextArticle.id}/relationships`}
              >
                <span className="constitution-admin-article-navigation__content">
                  <span className="constitution-admin-article-navigation__label">
                    Next Article
                  </span>

                  <span className="constitution-admin-article-navigation__title">
                    Article {nextArticle.article_number}
                    {nextArticle.title
                      ? `: ${nextArticle.title}`
                      : ""}
                  </span>
                </span>

                <span
                  className="constitution-admin-article-navigation__arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            ) : (
              <span className="govuk-body-s govuk-!-margin-bottom-0 constitution-admin-article-navigation__unavailable">
                This is the final Article.
              </span>
            )}
          </div>
        </div>
      </nav>

      <div className="govuk-inset-text">
        Highlight the exact
        wording in the Article.
        CitizenGuide will mark a
        new selection in yellow and
        automatically place the
        wording into the search
        field. Wording that is
        already linked is shown in
        blue and cannot be linked
        again until the existing
        relationship is removed.
      </div>

      <div
        className="constitution-linking-legend govuk-!-margin-bottom-4"
        aria-label="Relationship highlighting key"
      >
        <span className="govuk-body-s govuk-!-margin-right-4">
          <span
            className="constitution-linking-legend-swatch constitution-linking-legend-swatch--linked"
            aria-hidden="true"
          />{" "}
          Already linked
        </span>

        <span className="govuk-body-s">
          <span
            className="constitution-linking-legend-swatch constitution-linking-legend-swatch--pending"
            aria-hidden="true"
          />{" "}
          Current selection
        </span>
      </div>

      {/*
       * Admin-only relationship highlighting.
       *
       * These styles decorate the existing marker spans with CSS only.
       * The "Linked" label is a pseudo-element, so it never becomes
       * part of constitution_articles.body_html when another link is saved.
       */}
      <style>{`
        .constitution-admin-article-navigation {
          border-top: 1px solid #b1b4b6;
          border-bottom: 1px solid #b1b4b6;
          padding: 16px 0;
        }

        .constitution-admin-article-navigation__grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 32px;
          align-items: start;
        }

        .constitution-admin-article-navigation__next {
          text-align: right;
        }

        .constitution-admin-article-navigation__link {
          display: inline-flex;
          gap: 10px;
          align-items: flex-start;
          max-width: 100%;
          text-decoration: none;
        }

        .constitution-admin-article-navigation__link--next {
          justify-content: flex-end;
        }

        .constitution-admin-article-navigation__content {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 2px;
        }

        .constitution-admin-article-navigation__label {
          font-weight: 700;
          text-decoration: underline;
          text-decoration-thickness: max(1px, 0.0625rem);
          text-underline-offset: 0.1578em;
        }

        .constitution-admin-article-navigation__title {
          color: #0b0c0c;
          font-size: 0.9rem;
          line-height: 1.35;
          text-decoration: none;
        }

        .constitution-admin-article-navigation__arrow {
          flex: 0 0 auto;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1;
        }

        .constitution-admin-article-navigation__unavailable {
          color: #505a5f;
        }

        @media (max-width: 40.0625em) {
          .constitution-admin-article-navigation__grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .constitution-admin-article-navigation__next {
            text-align: left;
          }

          .constitution-admin-article-navigation__link--next {
            flex-direction: row-reverse;
            justify-content: flex-end;
          }
        }

        .constitution-admin-linking-content .constitution-inline-pending {
          background: #ffdd00;
          color: #0b0c0c;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
          padding: 0 2px;
          outline: 2px solid #ffdd00;
        }

        .constitution-admin-linking-content .constitution-inline-entity {
          position: relative;
          background: #d2e2f1;
          color: #0b0c0c;
          border-bottom: 3px solid #1d70b8;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
          padding: 1px 3px;
          cursor: not-allowed;
        }

        .constitution-admin-linking-content .constitution-inline-entity::after {
          content: "Linked";
          display: inline-block;
          margin-left: 6px;
          padding: 1px 5px;
          border-radius: 2px;
          background: #1d70b8;
          color: #ffffff;
          font-size: 0.72em;
          font-weight: 700;
          line-height: 1.4;
          vertical-align: 0.08em;
          white-space: nowrap;
        }

        .constitution-admin-linking-content .constitution-inline-entity:hover {
          background: #b1d3ef;
        }

        .constitution-linking-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 20px;
          align-items: center;
        }

        .constitution-linking-legend-swatch {
          display: inline-block;
          width: 24px;
          height: 14px;
          vertical-align: -2px;
          border: 1px solid #505a5f;
        }

        .constitution-linking-legend-swatch--linked {
          background: #d2e2f1;
          border-bottom: 3px solid #1d70b8;
        }

        .constitution-linking-legend-swatch--pending {
          background: #ffdd00;
          border-color: #b58800;
        }

        .constitution-admin-linking-content::selection,
        .constitution-admin-linking-content *::selection {
          background: #ffdd00;
          color: #0b0c0c;
        }
      `}</style>

      {/* ===================================================
          Article HTML
          =================================================== */}

      <div
        className="govuk-!-margin-bottom-6"
      >
        <div
          ref={contentRef}
          onMouseUp={
            captureSelection
          }
          onKeyUp={
            captureSelection
          }
          className="constitution-admin-linking-content constitution-article-text govuk-body govuk-!-padding-4"
          style={{
            border:
              "1px solid #b1b4b6",

            maxHeight:
              "36rem",

            overflowY:
              "auto",
          }}
          dangerouslySetInnerHTML={{
            __html:
              html,
          }}
        />
      </div>

      {/* ===================================================
          Current selection
          =================================================== */}

      {selectedText ? (
        <section className="govuk-!-margin-top-5 govuk-!-margin-bottom-8">
          <h2 className="govuk-heading-m">
            Link selected text
          </h2>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Selected text
              </dt>

              <dd className="govuk-summary-list__value">
                <strong>
                  {selectedText}
                </strong>

                {selectedBlockCount >
                1 ? (
                  <div className="govuk-hint govuk-!-margin-bottom-0">
                    This selection
                    spans{" "}
                    {
                      selectedBlockCount
                    }{" "}
                    adjacent
                    Constitution text
                    blocks. It will be
                    stored as one
                    logical link.
                  </div>
                ) : null}
              </dd>
            </div>
          </dl>

          {/* Destination type */}

          <fieldset className="govuk-fieldset govuk-!-margin-bottom-5">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
              Where should this wording link?
            </legend>

            <div className="govuk-hint">
              Prefer a structured CitizenGuide record when one exists. Use a manual
              CitizenGuide link for another page on this site. Use an external link
              only for a credible official source outside citizenguide.ke.
            </div>

            <div className="govuk-radios" data-module="govuk-radios">
              {[
                {
                  value: "person" as LinkType,
                  label: "Person in CitizenGuide",
                  hint: "Use for a named office holder, official or other person already in the CitizenGuide database.",
                },
                {
                  value: "institution" as LinkType,
                  label: "Institution in CitizenGuide",
                  hint: "Use for a commission, ministry, state office, county body or other institution already in CitizenGuide.",
                },
                {
                  value: "law" as LinkType,
                  label: "Act or law in CitizenGuide",
                  hint: "Preferred for an Act of Parliament or other legal document already registered in CitizenGuide. This also preserves the legal graph relationship.",
                },
                {
                  value: "internal" as LinkType,
                  label: "Other CitizenGuide page",
                  hint: "Use when the destination is on citizenguide.ke but is not available through the person, institution or law searches above.",
                },
                {
                  value: "external" as LinkType,
                  label: "External official source",
                  hint: "Use only for authoritative HTTPS sources such as Kenya Law, Parliament, Judiciary, a ministry, commission or county government website. Public links will show ↗.",
                },
              ].map((option) => {
                const id = `constitution-inline-${option.value}`;
                return (
                  <div className="govuk-radios__item" key={option.value}>
                    <input
                      className="govuk-radios__input"
                      id={id}
                      name="constitution-inline-type"
                      type="radio"
                      checked={linkType === option.value}
                      onChange={() => switchType(option.value)}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor={id}>
                      {option.label}
                    </label>
                    <div className="govuk-hint govuk-radios__hint">
                      {option.hint}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {/* Relationship */}

          <div className="govuk-form-group">
            <label
              className="govuk-label govuk-label--s"
              htmlFor="constitution-semantic-role"
            >
              Relationship
            </label>

            <select
              className="govuk-select"
              id="constitution-semantic-role"
              value={
                semanticRole
              }
              onChange={(
                event,
              ) =>
                setSemanticRole(
                  event.target
                    .value,
                )
              }
            >
              {roleOptions.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Destination details */}

          {linkType === "person" ||
          linkType === "institution" ||
          linkType === "law" ? (
            <>
              <form onSubmit={searchEntities}>
                <div className="govuk-form-group">
                  <label
                    className="govuk-label govuk-label--s"
                    htmlFor="constitution-inline-search"
                  >
                    {linkType === "person"
                      ? "Search CitizenGuide people"
                      : linkType === "institution"
                        ? "Search CitizenGuide institutions"
                        : "Search CitizenGuide Acts and laws"}
                  </label>

                  <div id="constitution-inline-search-hint" className="govuk-hint">
                    The selected constitutional wording is inserted automatically.
                    You can shorten the search without changing the wording that will
                    actually be linked.
                  </div>

                  <div className="govuk-button-group">
                    <input
                      id="constitution-inline-search"
                      className="govuk-input govuk-!-width-two-thirds"
                      aria-describedby="constitution-inline-search-hint"
                      value={searchQ}
                      onChange={(event) => setSearchQ(event.target.value)}
                    />
                    <button
                      type="submit"
                      className="govuk-button govuk-button--secondary"
                      disabled={searching}
                    >
                      {searching ? "Searching…" : "Search"}
                    </button>
                  </div>
                </div>
              </form>

              {results.length > 0 ? (
                <fieldset className="govuk-fieldset govuk-!-margin-bottom-5">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                    Choose the CitizenGuide record
                  </legend>
                  <div className="govuk-radios">
                    {results.map((result) => {
                      const resultId =
                        `constitution-result-${result.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
                      return (
                        <div className="govuk-radios__item" key={result.id}>
                          <input
                            className="govuk-radios__input"
                            id={resultId}
                            name="constitution-inline-result"
                            type="radio"
                            checked={selectedEntity?.id === result.id}
                            onChange={() => setSelectedEntity(result)}
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor={resultId}>
                            <strong>{result.name}</strong>
                            {resultDescription(result) ? (
                              <span className="govuk-hint govuk-!-margin-bottom-0">
                                {resultDescription(result)}
                              </span>
                            ) : null}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              ) : null}
            </>
          ) : (
            <>
              <div className="govuk-form-group">
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="constitution-manual-url"
                >
                  {linkType === "internal"
                    ? "CitizenGuide path"
                    : "Official external URL"}
                </label>
                <div id="constitution-manual-url-hint" className="govuk-hint">
                  {linkType === "internal"
                    ? "Enter only the path beginning with /. Example: /acts/parliament or /institutions/independent-electoral-and-boundaries-commission. Do not paste https://citizenguide.ke."
                    : "Enter the full HTTPS address. Prefer official sources such as new.kenyalaw.org, parliament.go.ke, judiciary.go.ke or an official government institution website. External links show ↗ on the public Article."}
                </div>
                <input
                  className="govuk-input"
                  id="constitution-manual-url"
                  aria-describedby="constitution-manual-url-hint"
                  value={manualUrl}
                  onChange={(event) => setManualUrl(event.target.value)}
                  placeholder={
                    linkType === "internal"
                      ? "/acts/parliament/..."
                      : "https://new.kenyalaw.org/..."
                  }
                />
              </div>

              <div className="govuk-form-group">
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="constitution-manual-label"
                >
                  Destination label <span className="govuk-hint">(optional)</span>
                </label>
                <div className="govuk-hint">
                  This helps admins understand the destination. It does not replace
                  the exact Constitution wording shown to readers.
                </div>
                <input
                  className="govuk-input"
                  id="constitution-manual-label"
                  value={manualLabel}
                  onChange={(event) => setManualLabel(event.target.value)}
                  placeholder="For example, Access to Information Act, 2016"
                />
              </div>

              {linkType === "external" ? (
                <div className="govuk-form-group">
                  <label
                    className="govuk-label govuk-label--s"
                    htmlFor="constitution-external-source-name"
                  >
                    Official source organisation <span className="govuk-hint">(optional)</span>
                  </label>
                  <div className="govuk-hint">
                    For example: Kenya Law, Parliament of Kenya or Judiciary of Kenya.
                  </div>
                  <input
                    className="govuk-input"
                    id="constitution-external-source-name"
                    value={externalSourceName}
                    onChange={(event) => setExternalSourceName(event.target.value)}
                    placeholder="Kenya Law"
                  />
                </div>
              ) : null}
            </>
          )}

          <div className="govuk-button-group">
            <button
              type="button"
              className="govuk-button"
              disabled={
                saving ||
                ((linkType === "person" ||
                  linkType === "institution" ||
                  linkType === "law")
                  ? !selectedEntity
                  : !manualUrl.trim())
              }
              onClick={() =>
                void saveLink()
              }
            >
              {saving
                ? "Saving…"
                : "Save link"}
            </button>

            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              disabled={
                saving
              }
              onClick={
                cancelPendingSelection
              }
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      {/* ===================================================
          Existing saved links
          =================================================== */}

      <section
        className="govuk-!-margin-top-8"
        aria-labelledby="constitution-existing-links-title"
      >
        <h2
          className="govuk-heading-l"
          id="constitution-existing-links-title"
        >
          Linked wording
        </h2>

        {links.length ===
        0 ? (
          <p className="govuk-body">
            No inline
            relationships have
            been saved for this
            Article.
          </p>
        ) : (
          <div className="govuk-table-container">
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th
                    scope="col"
                    className="govuk-table__header"
                  >
                    Wording
                  </th>

                  <th
                    scope="col"
                    className="govuk-table__header"
                  >
                    Linked to
                  </th>

                  <th
                    scope="col"
                    className="govuk-table__header"
                  >
                    Type
                  </th>

                  <th
                    scope="col"
                    className="govuk-table__header"
                  >
                    Relationship
                  </th>

                  <th
                    scope="col"
                    className="govuk-table__header"
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="govuk-table__body">
                {links.map(
                  (
                    link,
                  ) => (
                    <tr
                      key={
                        link.id
                      }
                      className="govuk-table__row"
                    >
                      <td className="govuk-table__cell">
                        <mark className="constitution-linked-wording-summary">
                          {
                            link.selected_text
                          }
                        </mark>
                      </td>

                      <td className="govuk-table__cell">
                        {link.target_href ? (
                          <a
                            className="govuk-link"
                            href={link.target_href}
                            target={link.link_type === "external" ? "_blank" : undefined}
                            rel={link.link_type === "external" ? "noopener noreferrer" : undefined}
                          >
                            {targetName(link)}
                            {link.link_type === "external" ? (
                              <> <span aria-hidden="true">↗</span>
                                <span className="govuk-visually-hidden"> (external website)</span>
                              </>
                            ) : null}
                          </a>
                        ) : (
                          targetName(link)
                        )}
                        {link.target_url ? (
                          <div className="govuk-hint govuk-!-margin-bottom-0">
                            {link.target_url}
                          </div>
                        ) : null}
                      </td>

                      <td className="govuk-table__cell">
                        {
                          link.link_type
                        }
                      </td>

                      <td className="govuk-table__cell">
                        {link.semantic_role ||
                          "—"}
                      </td>

                      <td className="govuk-table__cell">
                        <button
                          type="button"
                          className="govuk-button govuk-button--warning govuk-!-margin-bottom-0"
                          onClick={() =>
                            void unlink(
                              link.id,
                            )
                          }
                        >
                          Unlink
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Review */}

      <section className="govuk-!-margin-top-8">
        <h2 className="govuk-heading-m">
          Relationship review
        </h2>

        <div className="govuk-form-group">
          <label
            className="govuk-label"
            htmlFor="constitution-review-status"
          >
            Review status
          </label>

          <select
            id="constitution-review-status"
            className="govuk-select"
            value={
              reviewStatus
            }
            onChange={(
              event,
            ) =>
              setReviewStatus(
                event.target
                  .value,
              )
            }
          >
            <option value="Not reviewed">
              Not reviewed
            </option>

            <option value="Partially linked">
              Partially linked
            </option>

            <option value="Reviewed">
              Reviewed
            </option>

            <option value="Needs attention">
              Needs attention
            </option>
          </select>
        </div>

        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={() =>
            void saveReviewStatus()
          }
        >
          Save review status
        </button>
      </section>
    </div>
  );
}