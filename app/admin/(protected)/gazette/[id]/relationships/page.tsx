"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { adminPath } from "@/lib/admin-path";
import InlineGazetteLinker from "@/components/gazette/admin/InlineGazetteLinker";

import {
  NOTICE_RELATIONSHIP_TYPES,
  relationLabel,
  forwardNoticeRelationLabel,
  inverseNoticeRelationLabel,
} from "@/lib/gazette/relationship-types";

type SearchResult = {
  kind: "notice" | "corrigenda";
  id: string;
  name: string;
  description?: string | null;
  public_url?: string | null;
};

type Notice = {
  id: string;
  notice_number: number;
  title: string;
  relationship_review_status?: string | null;
  gazette_issues?: any;
};

const one = <T,>(
  value: T | T[] | null | undefined,
): T | null =>
  Array.isArray(value)
    ? value[0] || null
    : value || null;

function personName(row: any) {
  const leader = one(row.leaders);

  if (leader) {
    return (
      [
        leader.first_name,
        leader.other_names,
        leader.surname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      leader.full_name ||
      "Unknown"
    );
  }

  const mca = one(row.mcas);

  return mca
    ? [
        mca.first_name,
        mca.other_names,
        mca.surname,
      ]
        .filter(Boolean)
        .join(" ")
    : "Unknown";
}

export default function GazetteRelationshipsAdminPage() {
  const params = useParams<{ id: string }>();
  const noticeId = params.id;

  const [notice, setNotice] =
    useState<Notice | null>(null);

  const [data, setData] = useState<any>({
    people: [],
    institutions: [],
    outgoing: [],
    incoming: [],
    corrigenda: [],
  });

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [noticeQ, setNoticeQ] =
    useState("");

  const [noticeResults, setNoticeResults] =
    useState<SearchResult[]>([]);

  const [selectedNotice, setSelectedNotice] =
    useState<SearchResult | null>(null);

  const [
    noticeRelationType,
    setNoticeRelationType,
  ] = useState("references");

  const [relationDate, setRelationDate] =
    useState("");

  const [
    relationDescription,
    setRelationDescription,
  ] = useState("");

  const [
    corrigendaResults,
    setCorrigendaResults,
  ] = useState<SearchResult[]>([]);

  const [
    selectedCorrigenda,
    setSelectedCorrigenda,
  ] = useState<SearchResult | null>(null);

  const [
    corrSequence,
    setCorrSequence,
  ] = useState("");

  const [
    corrAffectedField,
    setCorrAffectedField,
  ] = useState("");

  const [
    corrOriginal,
    setCorrOriginal,
  ] = useState("");

  const [
    corrCorrected,
    setCorrCorrected,
  ] = useState("");

  const [corrText, setCorrText] =
    useState("");

  const [corrDate, setCorrDate] =
    useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [noticeRes, relRes] =
        await Promise.all([
          fetch(
            `/api/admin/gazette/notices/${noticeId}`,
            {
              credentials: "include",
              cache: "no-store",
            },
          ),
          fetch(
            `/api/admin/gazette/notices/${noticeId}/relationships`,
            {
              credentials: "include",
              cache: "no-store",
            },
          ),
        ]);

      const noticeJson =
        await noticeRes.json();

      const relJson =
        await relRes.json();

      if (!noticeRes.ok) {
        throw new Error(
          noticeJson.error ||
            "Failed to load notice",
        );
      }

      if (!relRes.ok) {
        throw new Error(
          relJson.error ||
            "Failed to load relationships",
        );
      }

      setNotice(noticeJson.data);

      setData(
        relJson.data || {
          people: [],
          institutions: [],
          outgoing: [],
          incoming: [],
          corrigenda: [],
        },
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to load relationships",
      );
    } finally {
      setLoading(false);
    }
  }, [noticeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/gazette/entity-search?q=corrigenda&kind=corrigenda`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );

        const json = await res.json();

        if (res.ok) {
          setCorrigendaResults(
            json.data || [],
          );
        }
      } catch {
        // Corrigenda can still be managed later.
      }
    })();
  }, []);

  const searchNotices = async () => {
    const q = noticeQ.trim();

    if (q.length < 2) {
      setError(
        "Enter at least 2 characters or a Gazette Notice number.",
      );
      return;
    }

    setError(null);

    const res = await fetch(
      `/api/admin/gazette/entity-search?q=${encodeURIComponent(
        q,
      )}&kind=notices`,
      {
        credentials: "include",
        cache: "no-store",
      },
    );

    const json = await res.json();

    if (!res.ok) {
      setError(
        json.error || "Search failed",
      );
      return;
    }

    setNoticeResults(
      json.data || [],
    );
  };

  const post = async (
    payload: Record<string, any>,
  ) => {
    setError(null);
    setMessage(null);

    const res = await fetch(
      `/api/admin/gazette/notices/${noticeId}/relationships`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload,
        ),
      },
    );

    const json = await res.json();

    if (!res.ok) {
      throw new Error(
        json.error ||
          "Relationship could not be saved",
      );
    }

    await load();
  };

  const remove = async (
    kind: string,
    linkId: string,
  ) => {
    if (
      !window.confirm(
        "Unlink this relationship? The underlying person, institution or Gazette notice will not be deleted.",
      )
    ) {
      return;
    }

    setError(null);

    const res = await fetch(
      `/api/admin/gazette/notices/${noticeId}/relationships?kind=${kind}&link_id=${linkId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );

    const json = await res.json();

    if (!res.ok) {
      setError(
        json.error || "Unlink failed",
      );
      return;
    }

    setMessage(
      "Relationship removed.",
    );

    await load();
  };

  const addNotice = async (
    e: FormEvent,
  ) => {
    e.preventDefault();

    if (!selectedNotice) {
      setError(
        "Choose a target Gazette notice first.",
      );
      return;
    }

    try {
      await post({
        kind: "notice",
        target_notice_id:
          selectedNotice.id,
        relationship_type:
          noticeRelationType,
        effective_date:
          relationDate || null,
        description:
          relationDescription || null,
      });

      setMessage(
        "Gazette notice relationship created.",
      );

      setSelectedNotice(null);
      setNoticeQ("");
      setNoticeResults([]);
      setRelationDate("");
      setRelationDescription("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to link notice",
      );
    }
  };

  const addCorrigendum = async (
    e: FormEvent,
  ) => {
    e.preventDefault();

    if (!selectedCorrigenda) {
      setError(
        "Choose the Corrigenda section first.",
      );
      return;
    }

    if (!corrSequence) {
      setError(
        "Enter the Corrigenda entry number.",
      );
      return;
    }

    if (!corrText.trim()) {
      setError(
        "Enter the full Corrigenda entry.",
      );
      return;
    }

    try {
      await post({
        kind: "corrigendum",
        issue_section_id:
          selectedCorrigenda.id,
        sequence_no:
          Number(corrSequence),
        relationship_type:
          "corrects",
        affected_field:
          corrAffectedField || null,
        original_text:
          corrOriginal || null,
        corrected_text:
          corrCorrected || null,
        entry_text:
          corrText.trim(),
        effective_date:
          corrDate || null,
      });

      setMessage(
        "Corrigendum linked to this notice.",
      );

      setCorrSequence("");
      setCorrAffectedField("");
      setCorrOriginal("");
      setCorrCorrected("");
      setCorrText("");
      setCorrDate("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to link corrigendum",
      );
    }
  };

  const markStatus = async (
    status: string,
  ) => {
    setError(null);

    const res = await fetch(
      `/api/admin/gazette/notices/${noticeId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          relationship_review_status:
            status,
        }),
      },
    );

    const json = await res.json();

    if (!res.ok) {
      setError(
        json.error ||
          "Could not update review status",
      );
      return;
    }

    setMessage(
      `Linking status changed to ${status}.`,
    );

    await load();
  };

  const gi =
    one<any>(
      notice?.gazette_issues,
    );

  const publicUrl =
    notice && gi
      ? `/kenya-gazette/${gi.year}/${gi.issue_number}/notice/${notice.notice_number}`
      : null;

  const hasLegacyStructuredContext =
    (data.people?.length || 0) > 0 ||
    (data.institutions?.length || 0) >
      0;

  return (
    <div className="govuk-width-container">
      <Link
        href={adminPath("gazette")}
        className="govuk-back-link"
      >
        Back to Gazette
      </Link>

      <main className="govuk-main-wrapper">
        {loading && (
          <div
            className="govuk-inset-text"
            aria-live="polite"
          >
            Loading Gazette
            relationships…
          </div>
        )}

        {!loading &&
          error &&
          !notice && (
            <div
              className="govuk-error-summary"
              role="alert"
              aria-labelledby="relationships-error-title"
            >
              <h2
                id="relationships-error-title"
                className="govuk-error-summary__title"
              >
                Gazette relationships
                could not be loaded
              </h2>

              <div className="govuk-error-summary__body">
                <p className="govuk-body">
                  {error}
                </p>

                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={() => load()}
                >
                  Try again
                </button>
              </div>
            </div>
          )}

        {!loading &&
          !error &&
          !notice && (
            <div className="govuk-inset-text">
              The Gazette notice could
              not be found.
            </div>
          )}

        {notice && (
          <>
            <span className="govuk-caption-xl">
              Gazette Notice No.{" "}
              {notice.notice_number}
            </span>

            <h1 className="govuk-heading-xl">
              Link and relate this notice
            </h1>

            <p className="govuk-body-l">
              {notice.title}
            </p>

            <div className="govuk-button-group">
              <Link
                className="govuk-button govuk-button--secondary"
                href={adminPath(
                  `gazette/${noticeId}`,
                )}
              >
                Edit notice
              </Link>

              {publicUrl && (
                <Link
                  className="govuk-button govuk-button--secondary"
                  target="_blank"
                  href={publicUrl}
                >
                  View public
                </Link>
              )}
            </div>

            {error && (
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
            )}

            {message && (
              <div className="govuk-notification-banner govuk-notification-banner--success">
                <div className="govuk-notification-banner__content">
                  <p className="govuk-body">
                    {message}
                  </p>
                </div>
              </div>
            )}

            <InlineGazetteLinker
              noticeId={noticeId}
            />

            <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l" />

            <section
              aria-labelledby="review-heading"
            >
              <h2
                id="review-heading"
                className="govuk-heading-l"
              >
                Linking review
              </h2>

              <p className="govuk-body">
                Current status:{" "}
                <strong>
                  {notice.relationship_review_status ||
                    "Not reviewed"}
                </strong>
              </p>

              <p className="govuk-body">
                Mark the notice as reviewed
                after inline person and
                institution links, related
                Gazette notices and any
                Corrigenda have been checked.
              </p>

              <div className="govuk-button-group">
                {[
                  "Not reviewed",
                  "Partially linked",
                  "Reviewed",
                  "Needs attention",
                ].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    onClick={() =>
                      markStatus(status)
                    }
                  >
                    {status}
                  </button>
                ))}
              </div>
            </section>

            {hasLegacyStructuredContext && (
              <>
                <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l" />

                <section
                  aria-labelledby="structured-context-heading"
                >
                  <h2
                    id="structured-context-heading"
                    className="govuk-heading-l"
                  >
                    Existing structured
                    person and institution
                    context
                  </h2>

                  <div className="govuk-inset-text">
                    New person and
                    institution names should
                    normally be linked
                    directly inside the
                    Gazette transcription
                    above. These records are
                    retained because they may
                    describe additional
                    semantic context created
                    before inline linking was
                    introduced.
                  </div>

                  {data.people?.length >
                    0 && (
                    <>
                      <h3 className="govuk-heading-m">
                        People
                      </h3>

                      <div className="govuk-table-wrapper">
                        <table className="govuk-table">
                          <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                              <th
                                className="govuk-table__header"
                                scope="col"
                              >
                                Person
                              </th>
                              <th
                                className="govuk-table__header"
                                scope="col"
                              >
                                Relationship
                              </th>
                              <th
                                className="govuk-table__header"
                                scope="col"
                              >
                                Position /
                                capacity
                              </th>
                              <th
                                className="govuk-table__header"
                                scope="col"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>

                          <tbody className="govuk-table__body">
                            {data.people.map(
                              (row: any) => {
                                const person =
                                  one(
                                    row.leaders,
                                  ) ||
                                  one(
                                    row.mcas,
                                  );

                                return (
                                  <tr
                                    className="govuk-table__row"
                                    key={
                                      row.id
                                    }
                                  >
                                    <td className="govuk-table__cell">
                                      {person?.slug ? (
                                        <Link
                                          className="govuk-link"
                                          target="_blank"
                                          href={`/government/people/${person.slug}`}
                                        >
                                          {personName(
                                            row,
                                          )}
                                        </Link>
                                      ) : (
                                        personName(
                                          row,
                                        )
                                      )}
                                    </td>

                                    <td className="govuk-table__cell">
                                      {relationLabel(
                                        row.relationship_type,
                                      )}
                                    </td>

                                    <td className="govuk-table__cell">
                                      {row.position_title ||
                                        row.capacity_title ||
                                        "—"}
                                    </td>

                                    <td className="govuk-table__cell">
                                      <button
                                        className="govuk-link app-button-as-link"
                                        type="button"
                                        onClick={() =>
                                          remove(
                                            "person",
                                            row.id,
                                          )
                                        }
                                      >
                                        Unlink
                                      </button>
                                    </td>
                                  </tr>
                                );
                              },
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {data.institutions
                    ?.length > 0 && (
                    <>
                      <h3 className="govuk-heading-m">
                        Institutions
                      </h3>

                      <div className="govuk-table-wrapper">
                        <table className="govuk-table">
                          <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                              <th
                                className="govuk-table__header"
                                scope="col"
                              >
                                Institution
                              </th>
                              <th
                                className="govuk-table__header"
                                scope="col"
                              >
                                Relationship
                              </th>
                              <th
                                className="govuk-table__header"
                                scope="col"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>

                          <tbody className="govuk-table__body">
                            {data.institutions.map(
                              (row: any) => {
                                const inst =
                                  one(
                                    row.institutions,
                                  );

                                return (
                                  <tr
                                    className="govuk-table__row"
                                    key={
                                      row.id
                                    }
                                  >
                                    <td className="govuk-table__cell">
                                      {inst?.slug ? (
                                        <Link
                                          className="govuk-link"
                                          target="_blank"
                                          href={`/government/institutions/${inst.slug}`}
                                        >
                                          {inst.name}
                                        </Link>
                                      ) : (
                                        inst?.name ||
                                        "Institution"
                                      )}
                                    </td>

                                    <td className="govuk-table__cell">
                                      {relationLabel(
                                        row.relationship_type,
                                      )}
                                    </td>

                                    <td className="govuk-table__cell">
                                      <button
                                        className="govuk-link app-button-as-link"
                                        type="button"
                                        onClick={() =>
                                          remove(
                                            "institution",
                                            row.id,
                                          )
                                        }
                                      >
                                        Unlink
                                      </button>
                                    </td>
                                  </tr>
                                );
                              },
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </section>
              </>
            )}

            <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l" />

            <section
              aria-labelledby="gazette-rel-heading"
            >
              <h2
                id="gazette-rel-heading"
                className="govuk-heading-l"
              >
                Related Gazette notices
              </h2>

              <p className="govuk-body">
                Use this for legal or
                historical relationships
                between notices, such as a
                revocation, correction,
                amendment or supersession.
              </p>

              {[
                ...(data.outgoing || []).map(
                  (row: any) => ({
                    ...row,
                    direction: "out",
                  }),
                ),
                ...(data.incoming || []).map(
                  (row: any) => ({
                    ...row,
                    direction: "in",
                  }),
                ),
              ].map((row: any) => {
                const target =
                  row.direction === "out"
                    ? one(row.target)
                    : one(row.source);

                const targetIssue =
                  one<any>(
                    target?.gazette_issues,
                  );

                return (
                  <div
                    className="govuk-summary-card"
                    key={`${row.direction}-${row.id}`}
                  >
                    <div className="govuk-summary-card__title-wrapper">
                      <h3 className="govuk-summary-card__title">
                        {row.direction ===
                        "out"
                          ? forwardNoticeRelationLabel(
                              row.relationship_type,
                            )
                          : inverseNoticeRelationLabel(
                              row.relationship_type,
                            )}
                        : G.N.{" "}
                        {target?.notice_number}
                      </h3>

                      {row.direction ===
                        "out" && (
                        <ul className="govuk-summary-card__actions">
                          <li className="govuk-summary-card__action">
                            <button
                              type="button"
                              className="govuk-link app-button-as-link"
                              onClick={() =>
                                remove(
                                  "notice",
                                  row.id,
                                )
                              }
                            >
                              Unlink
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>

                    <div className="govuk-summary-card__content">
                      <p className="govuk-body">
                        {target?.title}
                      </p>

                      {row.description && (
                        <p className="govuk-body-s">
                          {row.description}
                        </p>
                      )}

                      {targetIssue && (
                        <Link
                          className="govuk-link"
                          target="_blank"
                          href={`/kenya-gazette/${targetIssue.year}/${targetIssue.issue_number}/notice/${target.notice_number}`}
                        >
                          View related
                          Gazette notice
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}

              <details className="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    Link another
                    Gazette notice
                  </span>
                </summary>

                <div className="govuk-details__text">
                  <form
                    onSubmit={
                      addNotice
                    }
                  >
                    <div className="govuk-form-group">
                      <label
                        className="govuk-label govuk-label--s"
                        htmlFor="notice-q"
                      >
                        Search target
                        notice
                      </label>

                      <div
                        id="notice-q-hint"
                        className="govuk-hint"
                      >
                        Search by Gazette
                        Notice number or
                        title.
                      </div>

                      <div className="govuk-button-group">
                        <input
                          id="notice-q"
                          className="govuk-input govuk-!-width-two-thirds"
                          aria-describedby="notice-q-hint"
                          value={
                            noticeQ
                          }
                          onChange={(
                            e,
                          ) =>
                            setNoticeQ(
                              e.target
                                .value,
                            )
                          }
                        />

                        <button
                          type="button"
                          className="govuk-button govuk-button--secondary"
                          onClick={
                            searchNotices
                          }
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    {noticeResults.length >
                      0 && (
                      <div className="govuk-radios govuk-!-margin-bottom-4">
                        {noticeResults
                          .filter(
                            (row) =>
                              row.id !==
                              noticeId,
                          )
                          .map(
                            (
                              row,
                            ) => (
                              <div
                                className="govuk-radios__item"
                                key={
                                  row.id
                                }
                              >
                                <input
                                  className="govuk-radios__input"
                                  id={`notice-${row.id}`}
                                  type="radio"
                                  name="notice-result"
                                  checked={
                                    selectedNotice?.id ===
                                    row.id
                                  }
                                  onChange={() =>
                                    setSelectedNotice(
                                      row,
                                    )
                                  }
                                />

                                <label
                                  className="govuk-label govuk-radios__label"
                                  htmlFor={`notice-${row.id}`}
                                >
                                  <strong>
                                    {
                                      row.name
                                    }
                                  </strong>

                                  <span className="govuk-hint govuk-!-margin-bottom-0">
                                    {
                                      row.description
                                    }
                                  </span>
                                </label>
                              </div>
                            ),
                          )}
                      </div>
                    )}

                    <div className="govuk-form-group">
                      <label
                        className="govuk-label"
                        htmlFor="notice-rel"
                      >
                        Relationship
                        from this
                        notice
                      </label>

                      <select
                        id="notice-rel"
                        className="govuk-select"
                        value={
                          noticeRelationType
                        }
                        onChange={(e) =>
                          setNoticeRelationType(
                            e.target
                              .value,
                          )
                        }
                      >
                        {NOTICE_RELATIONSHIP_TYPES.map(
                          (
                            value,
                          ) => (
                            <option
                              key={
                                value
                              }
                              value={
                                value
                              }
                            >
                              {forwardNoticeRelationLabel(
                                value,
                              )}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="govuk-form-group">
                      <label
                        className="govuk-label"
                        htmlFor="relation-date"
                      >
                        Effective date
                        (optional)
                      </label>

                      <input
                        id="relation-date"
                        className="govuk-input govuk-input--width-10"
                        type="date"
                        value={
                          relationDate
                        }
                        onChange={(e) =>
                          setRelationDate(
                            e.target
                              .value,
                          )
                        }
                      />
                    </div>

                    <div className="govuk-form-group">
                      <label
                        className="govuk-label"
                        htmlFor="relation-description"
                      >
                        Explanation
                        (optional)
                      </label>

                      <textarea
                        id="relation-description"
                        className="govuk-textarea"
                        rows={3}
                        value={
                          relationDescription
                        }
                        onChange={(e) =>
                          setRelationDescription(
                            e.target
                              .value,
                          )
                        }
                      />
                    </div>

                    <button
                      className="govuk-button"
                      type="submit"
                    >
                      Link Gazette
                      notice
                    </button>
                  </form>
                </div>
              </details>
            </section>

            <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l" />

            <section
              aria-labelledby="corrigenda-heading"
            >
              <h2
                id="corrigenda-heading"
                className="govuk-heading-l"
              >
                Corrigenda
              </h2>

              <p className="govuk-body">
                Link individual
                Corrigenda entries to
                this notice without
                changing the original
                Gazette transcription.
              </p>

              {(data.corrigenda || []).map(
                (row: any) => (
                  <div
                    className="govuk-inset-text"
                    key={row.id}
                  >
                    <strong>
                      {row.relationship_type ===
                      "amends"
                        ? "Amendment"
                        : "Correction"}
                    </strong>

                    {row.effective_date && (
                      <>
                        {" "}
                        ·{" "}
                        {new Date(
                          row.effective_date,
                        ).toLocaleDateString(
                          "en-KE",
                        )}
                      </>
                    )}

                    <p className="govuk-body">
                      {row.entry_text}
                    </p>

                    {(row.original_text ||
                      row.corrected_text) && (
                      <p className="govuk-body-s">
                        {row.original_text && (
                          <>
                            Originally
                            published:{" "}
                            <strong>
                              {
                                row.original_text
                              }
                            </strong>
                          </>
                        )}

                        {row.original_text &&
                          row.corrected_text && (
                            <br />
                          )}

                        {row.corrected_text && (
                          <>
                            Corrected to:{" "}
                            <strong>
                              {
                                row.corrected_text
                              }
                            </strong>
                          </>
                        )}
                      </p>
                    )}

                    <button
                      className="govuk-link app-button-as-link"
                      type="button"
                      onClick={() =>
                        remove(
                          "corrigendum",
                          row.id,
                        )
                      }
                    >
                      Unlink
                    </button>
                  </div>
                ),
              )}

              <details className="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    Link a
                    Corrigenda entry
                  </span>
                </summary>

                <div className="govuk-details__text">
                  <form
                    onSubmit={
                      addCorrigendum
                    }
                  >
                    <div className="govuk-form-group">
                      <label
                        className="govuk-label govuk-label--s"
                        htmlFor="corr-section"
                      >
                        Source
                        Corrigenda section
                      </label>

                      <select
                        id="corr-section"
                        className="govuk-select govuk-!-width-full"
                        value={
                          selectedCorrigenda?.id ||
                          ""
                        }
                        onChange={(e) =>
                          setSelectedCorrigenda(
                            corrigendaResults.find(
                              (
                                row,
                              ) =>
                                row.id ===
                                e.target
                                  .value,
                            ) ||
                              null,
                          )
                        }
                      >
                        <option value="">
                          Select a
                          Corrigenda
                          section
                        </option>

                        {corrigendaResults.map(
                          (
                            row,
                          ) => (
                            <option
                              key={
                                row.id
                              }
                              value={
                                row.id
                              }
                            >
                              {
                                row.name
                              }
                              {row.description
                                ? ` — ${row.description}`
                                : ""}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="govuk-grid-row">
                      <div className="govuk-grid-column-one-quarter">
                        <div className="govuk-form-group">
                          <label
                            className="govuk-label"
                            htmlFor="corr-seq"
                          >
                            Entry
                            number
                          </label>

                          <input
                            id="corr-seq"
                            className="govuk-input"
                            type="number"
                            min="1"
                            value={
                              corrSequence
                            }
                            onChange={(
                              e,
                            ) =>
                              setCorrSequence(
                                e.target
                                  .value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="govuk-grid-column-one-quarter">
                        <div className="govuk-form-group">
                          <label
                            className="govuk-label"
                            htmlFor="corr-date"
                          >
                            Publication /
                            effective date
                          </label>

                          <input
                            id="corr-date"
                            className="govuk-input"
                            type="date"
                            value={
                              corrDate
                            }
                            onChange={(
                              e,
                            ) =>
                              setCorrDate(
                                e.target
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
                            htmlFor="corr-field"
                          >
                            Affected
                            information
                            (optional)
                          </label>

                          <input
                            id="corr-field"
                            className="govuk-input"
                            value={
                              corrAffectedField
                            }
                            onChange={(
                              e,
                            ) =>
                              setCorrAffectedField(
                                e.target
                                  .value,
                              )
                            }
                            placeholder="For example, date of death"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="govuk-form-group">
                      <label
                        className="govuk-label"
                        htmlFor="corr-original"
                      >
                        Originally
                        published
                      </label>

                      <input
                        id="corr-original"
                        className="govuk-input"
                        value={
                          corrOriginal
                        }
                        onChange={(e) =>
                          setCorrOriginal(
                            e.target
                              .value,
                          )
                        }
                      />
                    </div>

                    <div className="govuk-form-group">
                      <label
                        className="govuk-label"
                        htmlFor="corr-corrected"
                      >
                        Corrected to
                      </label>

                      <input
                        id="corr-corrected"
                        className="govuk-input"
                        value={
                          corrCorrected
                        }
                        onChange={(e) =>
                          setCorrCorrected(
                            e.target
                              .value,
                          )
                        }
                      />
                    </div>

                    <div className="govuk-form-group">
                      <label
                        className="govuk-label"
                        htmlFor="corr-text"
                      >
                        Full Corrigenda
                        entry
                      </label>

                      <textarea
                        id="corr-text"
                        className="govuk-textarea"
                        rows={5}
                        value={
                          corrText
                        }
                        onChange={(e) =>
                          setCorrText(
                            e.target
                              .value,
                          )
                        }
                      />
                    </div>

                    <button
                      className="govuk-button"
                      type="submit"
                    >
                      Link
                      Corrigendum
                    </button>
                  </form>
                </div>
              </details>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
