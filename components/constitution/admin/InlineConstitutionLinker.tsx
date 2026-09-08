"use client";

import {
  FormEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";

type Article = {
  id: string;
  article_number: number;
  title: string;
  body_text: string;
  body_html: string;
};

type SearchResult = {
  id: string;

  kind?:
    | "leader"
    | "mca"
    | "institution";

  type?: string;

  person_id?: string | null;
  institution_id?: string | null;

  role_id?: string | null;
  leader_role_id?: string | null;

  leader_id?: string | null;
  mca_id?: string | null;

  name?: string;
  title?: string;
  full_name?: string;
  display_name?: string;

  historical_label?: string | null;
  current_name?: string | null;

  role_title?: string | null;
  position_title?: string | null;

  organization?: string | null;
  organization_name?: string | null;

  description?: string | null;
};

type InlineLink = {
  id: string;
  article_id: string;

  link_type:
    | "person"
    | "institution";

  leader_id?: string | null;
  mca_id?: string | null;
  leader_role_id?: string | null;
  institution_id?: string | null;

  selected_text: string;

  historical_label?: string | null;
  semantic_role?: string | null;

  capacity_title?: string | null;
  organization_name?: string | null;

  role_start_date?: string | null;
  role_end_date?: string | null;

  verification_status?: string | null;

  notes?: string | null;

  leaders?: {
    id?: string;
    slug?: string | null;
    full_name?: string | null;
    first_name?: string | null;
    other_names?: string | null;
    surname?: string | null;
  } | null;

  mcas?: {
    id?: string;
    slug?: string | null;
    first_name?: string | null;
    other_names?: string | null;
    surname?: string | null;
  } | null;

  institutions?: {
    id?: string;
    slug?: string | null;
    name?: string | null;
    short_name?: string | null;
    official_name?: string | null;
  } | null;
};

type ArticlePayload = {
  article?: Article;
  data?: Article;
  error?: string;
};

type InlineLinksPayload = {
  links?: InlineLink[];
  inline_links?: InlineLink[];

  article?: Article;

  body_html?: string;

  data?: InlineLink | InlineLink[];

  error?: string;
};

type EntitySearchPayload = {
  results?: SearchResult[];
  people?: SearchResult[];
  institutions?: SearchResult[];
  data?: SearchResult[];
  error?: string;
};

type PendingSelection = {
  text: string;
};

class ApiError extends Error {
  status: number;
  url: string;
  responseBody: string;

  constructor(
    message: string,
    status: number,
    url: string,
    responseBody: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.responseBody = responseBody;
  }
}

async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  const url =
    response.url ||
    (typeof input === "string"
      ? input
      : input.toString());

  if (!response.ok) {
    const body =
      await response.text();

    throw new ApiError(
      `Request failed with ${response.status} ${response.statusText}.`,
      response.status,
      url,
      body.slice(0, 1200),
    );
  }

  if (
    !contentType
      .toLowerCase()
      .includes(
        "application/json",
      )
  ) {
    const body =
      await response.text();

    throw new ApiError(
      `Expected JSON but received ${
        contentType ||
        "an unknown content type"
      }.`,
      response.status,
      url,
      body.slice(0, 1200),
    );
  }

  return (await response.json()) as T;
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    let message =
      `${error.message} URL: ${error.url}`;

    if (error.responseBody) {
      const cleanBody =
        error.responseBody
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 450);

      message +=
        ` Response: ${cleanBody}`;
    }

    return message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

function getSearchResultLabel(
  item: SearchResult,
): string {
  return (
    item.display_name ||
    item.full_name ||
    item.name ||
    item.title ||
    item.historical_label ||
    "Unnamed record"
  );
}

function buildPersonName(
  firstName?: string | null,
  otherNames?: string | null,
  surname?: string | null,
) {
  return [
    firstName,
    otherNames,
    surname,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getInlineTargetLabel(
  item: InlineLink,
): string {
  if (
    item.link_type ===
    "person"
  ) {
    return (
      item.leaders?.full_name ||
      buildPersonName(
        item.leaders?.first_name,
        item.leaders?.other_names,
        item.leaders?.surname,
      ) ||
      buildPersonName(
        item.mcas?.first_name,
        item.mcas?.other_names,
        item.mcas?.surname,
      ) ||
      item.capacity_title ||
      "Person"
    );
  }

  return (
    item.institutions?.name ||
    item.institutions
      ?.official_name ||
    item.institutions
      ?.short_name ||
    item.organization_name ||
    "Institution"
  );
}

const PERSON_ROLES = [
  {
    value: "mentioned_person",
    label: "Mentioned person",
  },
  {
    value: "appointing_authority",
    label: "Appointing authority",
  },
  {
    value: "office_holder",
    label: "Office holder",
  },
  {
    value: "appoints",
    label: "Appoints",
  },
  {
    value: "nominates",
    label: "Nominates",
  },
  {
    value: "approves",
    label: "Approves",
  },
  {
    value: "removes",
    label: "Removes",
  },
  {
    value: "reports_to",
    label: "Reports to",
  },
  {
    value: "exercises_power",
    label: "Exercises power",
  },
];

const INSTITUTION_ROLES = [
  {
    value: "mentioned_institution",
    label: "Mentioned institution",
  },
  {
    value: "establishes",
    label: "Establishes",
  },
  {
    value: "recognises",
    label: "Recognises",
  },
  {
    value: "assigns_function_to",
    label: "Assigns function to",
  },
  {
    value: "grants_power_to",
    label: "Grants power to",
  },
  {
    value: "imposes_duty_on",
    label: "Imposes duty on",
  },
  {
    value: "regulates",
    label: "Regulates",
  },
  {
    value: "mentions",
    label: "Mentions",
  },
];

export default function InlineConstitutionLinker({
  articleId,
}: {
  articleId: string;
}) {
  const contentRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    article,
    setArticle,
  ] = useState<Article | null>(
    null,
  );

  const [
    inlineLinks,
    setInlineLinks,
  ] = useState<InlineLink[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null,
  );

  const [
    selection,
    setSelection,
  ] =
    useState<PendingSelection | null>(
      null,
    );

  const [
    linkType,
    setLinkType,
  ] = useState<
    "person" | "institution"
  >("institution");

  const [
    entityQuery,
    setEntityQuery,
  ] = useState("");

  const [
    entityResults,
    setEntityResults,
  ] = useState<SearchResult[]>(
    [],
  );

  const [
    selectedEntity,
    setSelectedEntity,
  ] = useState<SearchResult | null>(
    null,
  );

  const [
    semanticRole,
    setSemanticRole,
  ] = useState(
    "mentioned_institution",
  );

  const [
    historicalLabel,
    setHistoricalLabel,
  ] = useState("");

  const [
    capacityTitle,
    setCapacityTitle,
  ] = useState("");

  const [
    organizationName,
    setOrganizationName,
  ] = useState("");

  const [
    roleStartDate,
    setRoleStartDate,
  ] = useState("");

  const [
    roleEndDate,
    setRoleEndDate,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const articleApi = useMemo(
    () =>
      `/api/admin/constitution/articles/${encodeURIComponent(
        articleId,
      )}`,
    [articleId],
  );

  const inlineLinksApi =
    useMemo(
      () =>
        `/api/admin/constitution/article-inline-links/${encodeURIComponent(
          articleId,
        )}`,
      [articleId],
    );

  const loadData =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          articleData,
          linksData,
        ] = await Promise.all([
          fetchJson<ArticlePayload>(
            articleApi,
          ),

          fetchJson<InlineLinksPayload>(
            inlineLinksApi,
          ),
        ]);

        const loadedArticle =
          articleData.article ||
          articleData.data ||
          linksData.article ||
          null;

        if (!loadedArticle) {
          throw new Error(
            articleData.error ||
              linksData.error ||
              "The Article API did not return an article.",
          );
        }

        if (
          typeof linksData.body_html ===
          "string"
        ) {
          loadedArticle.body_html =
            linksData.body_html;
        }

        if (
          linksData.article
            ?.body_html
        ) {
          loadedArticle.body_html =
            linksData.article.body_html;
        }

        setArticle(
          loadedArticle,
        );

        const links =
          linksData.links ||
          linksData.inline_links ||
          [];

        setInlineLinks(
          Array.isArray(links)
            ? links
            : [],
        );
      } catch (loadError) {
        console.error(
          "Failed to load Constitution inline links:",
          loadError,
        );

        setError(
          getErrorMessage(
            loadError,
          ),
        );
      } finally {
        setLoading(false);
      }
    }, [
      articleApi,
      inlineLinksApi,
    ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (
      linkType === "person"
    ) {
      setSemanticRole(
        "mentioned_person",
      );
    } else {
      setSemanticRole(
        "mentioned_institution",
      );
    }

    setSelectedEntity(null);
    setEntityQuery("");
    setEntityResults([]);
  }, [linkType]);

  useEffect(() => {
    const query =
      entityQuery.trim();

    if (query.length < 2) {
      setEntityResults([]);
      return;
    }

    const controller =
      new AbortController();

    const timer =
      window.setTimeout(
        async () => {
          try {
            const kind =
              linkType ===
              "person"
                ? "people"
                : "institutions";

            const data =
              await fetchJson<EntitySearchPayload>(
                `/api/admin/gazette/entity-search?q=${encodeURIComponent(
                  query,
                )}&kind=${kind}`,
                {
                  signal:
                    controller.signal,
                },
              );

            let results:
              SearchResult[] =
              [];

            if (
              Array.isArray(
                data.results,
              )
            ) {
              results =
                data.results;
            } else if (
              linkType ===
                "person" &&
              Array.isArray(
                data.people,
              )
            ) {
              results =
                data.people;
            } else if (
              linkType ===
                "institution" &&
              Array.isArray(
                data.institutions,
              )
            ) {
              results =
                data.institutions;
            } else if (
              Array.isArray(
                data.data,
              )
            ) {
              results =
                data.data;
            }

            setEntityResults(
              results,
            );
          } catch (
            searchError
          ) {
            if (
              searchError instanceof
                DOMException &&
              searchError.name ===
                "AbortError"
            ) {
              return;
            }

            console.error(
              "Constitution inline entity search failed:",
              searchError,
            );

            setError(
              getErrorMessage(
                searchError,
              ),
            );
          }
        },
        300,
      );

    return () => {
      window.clearTimeout(
        timer,
      );

      controller.abort();
    };
  }, [
    entityQuery,
    linkType,
  ]);

  function captureSelection() {
    const container =
      contentRef.current;

    if (!container) {
      return;
    }

    const browserSelection =
      window.getSelection();

    if (
      !browserSelection ||
      browserSelection.rangeCount ===
        0 ||
      browserSelection.isCollapsed
    ) {
      return;
    }

    const range =
      browserSelection.getRangeAt(
        0,
      );

    const startContainer =
      range.startContainer
        .nodeType === Node.TEXT_NODE
        ? range.startContainer
            .parentElement
        : (range.startContainer as HTMLElement);

    const endContainer =
      range.endContainer
        .nodeType === Node.TEXT_NODE
        ? range.endContainer
            .parentElement
        : (range.endContainer as HTMLElement);

    if (
      !startContainer ||
      !endContainer ||
      !container.contains(
        startContainer,
      ) ||
      !container.contains(
        endContainer,
      )
    ) {
      return;
    }

    const selectedText =
      browserSelection
        .toString()
        .trim();

    if (!selectedText) {
      return;
    }

    setSelection({
      text: selectedText,
    });

    setHistoricalLabel(
      selectedText,
    );

    setError(null);
    setSuccess(null);
  }

  function handleArticleMouseUp(
    _event: ReactMouseEvent<HTMLDivElement>,
  ) {
    window.setTimeout(() => {
      captureSelection();
    }, 0);
  }

  function clearSelection() {
    setSelection(null);
    setHistoricalLabel("");

    setSelectedEntity(null);
    setEntityQuery("");
    setEntityResults([]);

    setCapacityTitle("");
    setOrganizationName("");

    setRoleStartDate("");
    setRoleEndDate("");

    setNotes("");

    const browserSelection =
      window.getSelection();

    browserSelection?.removeAllRanges();
  }

  async function saveInlineLink(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selection?.text) {
      setError(
        "Select some Article text before creating an inline link.",
      );
      return;
    }

    if (!selectedEntity) {
      setError(
        "Select the person or institution to link.",
      );
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: Record<
        string,
        unknown
      > = {
        link_type: linkType,

        selected_text:
          selection.text,

        historical_label:
          historicalLabel.trim() ||
          selection.text,

        semantic_role:
          semanticRole,

        capacity_title:
          capacityTitle.trim() ||
          null,

        organization_name:
          organizationName.trim() ||
          null,

        role_start_date:
          roleStartDate ||
          null,

        role_end_date:
          roleEndDate ||
          null,

        notes:
          notes.trim() || null,
      };

      if (
        linkType === "person"
      ) {
        const personKind =
          selectedEntity.kind ||
          selectedEntity.type ||
          null;

        const personId =
          selectedEntity.person_id ||
          null;

        if (
          !personId &&
          !selectedEntity.leader_id &&
          !selectedEntity.mca_id
        ) {
          throw new Error(
            "The selected person search result does not contain a valid person database ID.",
          );
        }

        payload.person_kind =
          personKind;

        payload.person_id =
          personId;

        payload.leader_id =
          selectedEntity.leader_id ||
          null;

        payload.mca_id =
          selectedEntity.mca_id ||
          null;

        payload.leader_role_id =
          selectedEntity
            .leader_role_id ||
          selectedEntity.role_id ||
          null;

        if (
          !capacityTitle.trim() &&
          selectedEntity
            .role_title
        ) {
          payload.capacity_title =
            selectedEntity.role_title;
        }

        if (
          !organizationName.trim() &&
          selectedEntity
            .organization
        ) {
          payload.organization_name =
            selectedEntity.organization;
        }
      } else {
        const institutionId =
          selectedEntity
            .institution_id ||
          null;

        if (!institutionId) {
          throw new Error(
            "The selected institution search result does not contain a valid institution database ID.",
          );
        }

        payload.institution_id =
          institutionId;

        if (
          !organizationName.trim()
        ) {
          payload.organization_name =
            selectedEntity
              .historical_label ||
            selectedEntity.name ||
            null;
        }
      }

      const result =
        await fetchJson<InlineLinksPayload>(
          inlineLinksApi,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload,
            ),
          },
        );

      if (
        result.article
          ?.body_html &&
        article
      ) {
        setArticle({
          ...article,
          body_html:
            result.article
              .body_html,
        });
      } else if (
        typeof result.body_html ===
          "string" &&
        article
      ) {
        setArticle({
          ...article,
          body_html:
            result.body_html,
        });
      }

      clearSelection();

      setSuccess(
        "Inline relationship created.",
      );

      await loadData();
    } catch (saveError) {
      console.error(
        "Failed to create Constitution inline link:",
        saveError,
      );

      setError(
        getErrorMessage(
          saveError,
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeInlineLink(
    linkId: string,
  ) {
    const confirmed =
      window.confirm(
        "Remove this inline link? The original Constitution wording will be preserved.",
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(linkId);
    setError(null);
    setSuccess(null);

    try {
      const result =
        await fetchJson<InlineLinksPayload>(
          inlineLinksApi,
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              link_id: linkId,
            }),
          },
        );

      if (
        result.article
          ?.body_html &&
        article
      ) {
        setArticle({
          ...article,
          body_html:
            result.article
              .body_html,
        });
      } else if (
        typeof result.body_html ===
          "string" &&
        article
      ) {
        setArticle({
          ...article,
          body_html:
            result.body_html,
        });
      }

      setSuccess(
        "Inline relationship removed.",
      );

      await loadData();
    } catch (
      deleteError
    ) {
      console.error(
        "Failed to remove Constitution inline link:",
        deleteError,
      );

      setError(
        getErrorMessage(
          deleteError,
        ),
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div>
        <p className="govuk-body">
          Loading Article inline
          links…
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/admin/constitution/articles/${articleId}`}
        className="govuk-back-link"
      >
        Back to Article
      </Link>

      <span className="govuk-caption-xl">
        Constitution of Kenya
      </span>

      <h1 className="govuk-heading-xl">
        Inline linking
      </h1>

      {article ? (
        <>
          <h2 className="govuk-heading-l">
            Article{" "}
            {
              article.article_number
            }{" "}
            — {article.title}
          </h2>

          <p className="govuk-body">
            Select exact
            Constitution wording,
            then connect that wording
            to an existing
            CitizenGuide person or
            institution.
          </p>

          <p className="govuk-body">
            <Link
              href={`/admin/constitution/articles/${articleId}/relationships`}
              className="govuk-link"
            >
              Manage Article
              relationships
            </Link>

            {" · "}

            <Link
              href={`/constitution/article/${article.article_number}`}
              className="govuk-link"
              target="_blank"
            >
              View public Article
            </Link>
          </p>
        </>
      ) : null}

      {error ? (
        <div
          className="govuk-error-summary"
          role="alert"
        >
          <h2 className="govuk-error-summary__title">
            There is a problem
          </h2>

          <div className="govuk-error-summary__body">
            <p className="govuk-body">
              {error}
            </p>
          </div>
        </div>
      ) : null}

      {success ? (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="alert"
        >
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">
              Success
            </h2>
          </div>

          <div className="govuk-notification-banner__content">
            <p className="govuk-body">
              {success}
            </p>
          </div>
        </div>
      ) : null}

      {article ? (
        <div
          ref={contentRef}
          className="constitution-admin-linking-content govuk-body"
          onMouseUp={
            handleArticleMouseUp
          }
          dangerouslySetInnerHTML={{
            __html:
              article.body_html ||
              `<p>${article.body_text}</p>`,
          }}
        />
      ) : (
        <p className="govuk-body">
          Article content could not
          be loaded.
        </p>
      )}

      <div className="govuk-inset-text">
        Highlight only the exact
        wording you want to connect.
        The constitutional wording
        itself is not changed.
      </div>

      {selection ? (
        <>
          <h2 className="govuk-heading-l">
            Create inline
            relationship
          </h2>

          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--m">
              Selected wording
            </label>

            <div className="govuk-inset-text">
              {selection.text}
            </div>

            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={
                clearSelection
              }
            >
              Clear selection
            </button>
          </div>

          <form
            onSubmit={
              saveInlineLink
            }
          >
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                What does this
                wording refer to?
              </legend>

              <div className="govuk-radios">
                <div className="govuk-radios__item">
                  <input
                    id="link-type-institution"
                    className="govuk-radios__input"
                    type="radio"
                    name="link-type"
                    value="institution"
                    checked={
                      linkType ===
                      "institution"
                    }
                    onChange={() =>
                      setLinkType(
                        "institution",
                      )
                    }
                  />

                  <label
                    className="govuk-label govuk-radios__label"
                    htmlFor="link-type-institution"
                  >
                    Institution
                  </label>
                </div>

                <div className="govuk-radios__item">
                  <input
                    id="link-type-person"
                    className="govuk-radios__input"
                    type="radio"
                    name="link-type"
                    value="person"
                    checked={
                      linkType ===
                      "person"
                    }
                    onChange={() =>
                      setLinkType(
                        "person",
                      )
                    }
                  />

                  <label
                    className="govuk-label govuk-radios__label"
                    htmlFor="link-type-person"
                  >
                    Person
                  </label>
                </div>
              </div>
            </fieldset>

            <div className="govuk-form-group">
              <label
                className="govuk-label govuk-label--m"
                htmlFor="entity-search"
              >
                Search{" "}
                {linkType ===
                "person"
                  ? "people"
                  : "institutions"}
              </label>

              <input
                id="entity-search"
                className="govuk-input"
                type="search"
                autoComplete="off"
                value={
                  entityQuery
                }
                onChange={(
                  event,
                ) => {
                  setEntityQuery(
                    event.target
                      .value,
                  );

                  setSelectedEntity(
                    null,
                  );
                }}
              />

              {entityResults.length >
                0 &&
              !selectedEntity ? (
                <ul className="govuk-list govuk-list--spaced">
                  {entityResults.map(
                    (result) => (
                      <li
                        key={
                          result.id
                        }
                      >
                        <button
                          type="button"
                          className="govuk-button govuk-button--secondary"
                          onClick={() => {
                            setSelectedEntity(
                              result,
                            );

                            setEntityQuery(
                              getSearchResultLabel(
                                result,
                              ),
                            );

                            setEntityResults(
                              [],
                            );

                            if (
                              linkType ===
                                "person" &&
                              result.role_title &&
                              !capacityTitle
                            ) {
                              setCapacityTitle(
                                result.role_title,
                              );
                            }

                            if (
                              result.organization &&
                              !organizationName
                            ) {
                              setOrganizationName(
                                result.organization,
                              );
                            }
                          }}
                        >
                          {getSearchResultLabel(
                            result,
                          )}
                        </button>

                        {result.description ? (
                          <p className="govuk-hint">
                            {
                              result.description
                            }
                          </p>
                        ) : null}
                      </li>
                    ),
                  )}
                </ul>
              ) : null}

              {selectedEntity ? (
                <div className="govuk-inset-text">
                  Selected:{" "}
                  <strong>
                    {getSearchResultLabel(
                      selectedEntity,
                    )}
                  </strong>

                  {selectedEntity.role_title ? (
                    <>
                      <br />
                      {
                        selectedEntity.role_title
                      }
                    </>
                  ) : null}

                  {selectedEntity.organization ? (
                    <>
                      <br />
                      {
                        selectedEntity.organization
                      }
                    </>
                  ) : null}

                  {selectedEntity.current_name &&
                  selectedEntity.current_name !==
                    selectedEntity.name ? (
                    <>
                      <br />
                      Current record:{" "}
                      {
                        selectedEntity.current_name
                      }
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="govuk-form-group">
              <label
                className="govuk-label"
                htmlFor="semantic-role"
              >
                Semantic
                relationship
              </label>

              <select
                id="semantic-role"
                className="govuk-select"
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
                {(linkType ===
                "person"
                  ? PERSON_ROLES
                  : INSTITUTION_ROLES
                ).map(
                  (role) => (
                    <option
                      key={
                        role.value
                      }
                      value={
                        role.value
                      }
                    >
                      {role.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="govuk-form-group">
              <label
                className="govuk-label"
                htmlFor="historical-label"
              >
                Constitutional or
                historical label
              </label>

              <div className="govuk-hint">
                Preserve the wording
                used in the
                Constitution when it
                differs from the
                current entity name.
              </div>

              <input
                id="historical-label"
                className="govuk-input"
                value={
                  historicalLabel
                }
                onChange={(
                  event,
                ) =>
                  setHistoricalLabel(
                    event.target
                      .value,
                  )
                }
              />
            </div>

            {linkType ===
            "person" ? (
              <div className="govuk-form-group">
                <label
                  className="govuk-label"
                  htmlFor="capacity-title"
                >
                  Capacity or office
                </label>

                <input
                  id="capacity-title"
                  className="govuk-input"
                  value={
                    capacityTitle
                  }
                  onChange={(
                    event,
                  ) =>
                    setCapacityTitle(
                      event.target
                        .value,
                    )
                  }
                />
              </div>
            ) : null}

            <div className="govuk-form-group">
              <label
                className="govuk-label"
                htmlFor="organization-name"
              >
                Organisation or
                institution name in
                context
              </label>

              <input
                id="organization-name"
                className="govuk-input"
                value={
                  organizationName
                }
                onChange={(
                  event,
                ) =>
                  setOrganizationName(
                    event.target
                      .value,
                  )
                }
              />
            </div>

            {linkType ===
            "person" ? (
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label
                      className="govuk-label"
                      htmlFor="role-start-date"
                    >
                      Role start date
                    </label>

                    <input
                      id="role-start-date"
                      className="govuk-input"
                      type="date"
                      value={
                        roleStartDate
                      }
                      onChange={(
                        event,
                      ) =>
                        setRoleStartDate(
                          event.target
                            .value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label
                      className="govuk-label"
                      htmlFor="role-end-date"
                    >
                      Role end date
                    </label>

                    <input
                      id="role-end-date"
                      className="govuk-input"
                      type="date"
                      value={
                        roleEndDate
                      }
                      onChange={(
                        event,
                      ) =>
                        setRoleEndDate(
                          event.target
                            .value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="govuk-form-group">
              <label
                className="govuk-label"
                htmlFor="inline-notes"
              >
                Notes
              </label>

              <textarea
                id="inline-notes"
                className="govuk-textarea"
                rows={3}
                value={notes}
                onChange={(
                  event,
                ) =>
                  setNotes(
                    event.target
                      .value,
                  )
                }
              />
            </div>

            <button
              type="submit"
              className="govuk-button"
              disabled={
                saving ||
                !selectedEntity
              }
            >
              {saving
                ? "Saving…"
                : "Create inline link"}
            </button>
          </form>
        </>
      ) : null}

      <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />

      <h2 className="govuk-heading-l">
        Existing inline
        relationships
      </h2>

      {inlineLinks.length ===
      0 ? (
        <p className="govuk-body">
          No inline relationships
          have been created for this
          Article.
        </p>
      ) : (
        <div className="govuk-table__wrapper">
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th
                  scope="col"
                  className="govuk-table__header"
                >
                  Selected wording
                </th>

                <th
                  scope="col"
                  className="govuk-table__header"
                >
                  Target
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
                  Status
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
              {inlineLinks.map(
                (item) => (
                  <tr
                    className="govuk-table__row"
                    key={item.id}
                  >
                    <td className="govuk-table__cell">
                      {
                        item.selected_text
                      }
                    </td>

                    <td className="govuk-table__cell">
                      {getInlineTargetLabel(
                        item,
                      )}
                    </td>

                    <td className="govuk-table__cell">
                      {
                        item.link_type
                      }
                    </td>

                    <td className="govuk-table__cell">
                      {item.semantic_role ||
                        "mentioned"}
                    </td>

                    <td className="govuk-table__cell">
                      {item.verification_status ||
                        "Pending"}
                    </td>

                    <td className="govuk-table__cell">
                      <button
                        type="button"
                        className="govuk-button govuk-button--warning"
                        disabled={
                          deletingId ===
                          item.id
                        }
                        onClick={() => {
                          void removeInlineLink(
                            item.id,
                          );
                        }}
                      >
                        {deletingId ===
                        item.id
                          ? "Removing…"
                          : "Remove"}
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}