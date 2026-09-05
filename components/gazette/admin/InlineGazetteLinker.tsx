"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  INLINE_INSTITUTION_SEMANTIC_ROLES,
  INLINE_PERSON_SEMANTIC_ROLES,
  inlineRoleLabel,
} from "@/lib/gazette/inline-link-types";

type SearchResult = {
  kind: "leader" | "mca" | "institution";
  id: string;
  person_id?: string;
  institution_id?: string;
  slug?: string;
  name: string;
  description?: string | null;
  role_id?: string | null;
  role_title?: string | null;
  organization?: string | null;
  term_start_date?: string | null;
  term_end_date?: string | null;
  status?: string | null;
  matches_notice_date?: boolean;
  historical_label?: string | null;
  current_name?: string | null;
  name_type?: string | null;
  established_date?: string | null;
  operational_date?: string | null;
  predecessor_institution_id?: string | null;
  successor_institution_id?: string | null;
  public_url?: string | null;
};

type InlineLink = {
  id: string;
  link_type: "person" | "institution";
  selected_text: string;
  semantic_role?: string | null;
  historical_label?: string | null;
  capacity_title?: string | null;
  organization_name?: string | null;
  role_start_date?: string | null;
  role_end_date?: string | null;
  leader?: any;
  mca?: any;
  institution?: any;
};

type NoticePayload = {
  id: string;
  notice_number: number;
  title: string;
  content_html?: string | null;
  gazette_issues?: any;
};

type Props = { noticeId: string };

const BLOCK_SELECTOR = "p, li, td, th, h1, h2, h3, h4, blockquote";
const MAX_SELECTED_BLOCKS = 4;

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function closestBlock(node: Node | null): Element | null {
  const element =
    node?.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node?.parentElement || null;
  return element?.closest(BLOCK_SELECTOR) || null;
}

function unwrapElement(element: Element) {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) parent.insertBefore(element.firstChild, element);
  parent.removeChild(element);
}

function personDisplayName(link: InlineLink) {
  const person = link.leader || link.mca;
  if (!person) return link.historical_label || link.selected_text;
  return (
    [person.first_name, person.other_names, person.surname]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    person.full_name ||
    link.historical_label ||
    link.selected_text
  );
}

function getSelectedTextNodes(container: HTMLElement, range: Range): Text[] {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent) return NodeFilter.FILTER_REJECT;
      try {
        return range.intersectsNode(node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      } catch {
        return NodeFilter.FILTER_REJECT;
      }
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

function selectedOffsetsForTextNode(node: Text, range: Range) {
  let start = 0;
  let end = node.data.length;

  if (range.startContainer === node) start = range.startOffset;
  if (range.endContainer === node) end = range.endOffset;

  return {
    start: Math.max(0, Math.min(start, node.data.length)),
    end: Math.max(0, Math.min(end, node.data.length)),
  };
}

function getBlocksBetween(
  container: HTMLElement,
  firstBlock: Element,
  lastBlock: Element,
) {
  const allBlocks = Array.from(container.querySelectorAll(BLOCK_SELECTOR));
  const firstIndex = allBlocks.indexOf(firstBlock);
  const lastIndex = allBlocks.indexOf(lastBlock);

  if (firstIndex === -1 || lastIndex === -1) return [];

  const start = Math.min(firstIndex, lastIndex);
  const end = Math.max(firstIndex, lastIndex);
  return allBlocks.slice(start, end + 1);
}

export default function InlineGazetteLinker({ noticeId }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  const [notice, setNotice] = useState<NoticePayload | null>(null);
  const [html, setHtml] = useState("");
  const [links, setLinks] = useState<InlineLink[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [pendingSelectionId, setPendingSelectionId] = useState<string | null>(null);
  const [selectedBlockCount, setSelectedBlockCount] = useState(0);

  const [linkType, setLinkType] = useState<"person" | "institution">("person");
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<SearchResult | null>(null);
  const [semanticRole, setSemanticRole] = useState<string>("establishing_authority");

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [noticeRes, linksRes] = await Promise.all([
        fetch(`/api/admin/gazette/notices/${noticeId}`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/admin/gazette/notices/${noticeId}/inline-links`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const noticeJson = await noticeRes.json();
      const linksJson = await linksRes.json();

      if (!noticeRes.ok) throw new Error(noticeJson.error || "Failed to load Gazette notice");
      if (!linksRes.ok) throw new Error(linksJson.error || "Failed to load inline links");

      setNotice(noticeJson.data);
      setHtml(noticeJson.data.content_html || "");
      setLinks(linksJson.data || []);
      setPendingSelectionId(null);
      setSelectedBlockCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Gazette inline linking");
    } finally {
      setLoading(false);
    }
  }, [noticeId]);

  useEffect(() => {
    load();
  }, [load]);

  const issue = one<any>(notice?.gazette_issues);
  const noticeDate = issue?.date ? String(issue.date).slice(0, 10) : "";

  const cancelPendingSelection = () => {
    const container = contentRef.current;

    if (container) {
      const pending = Array.from(
        container.querySelectorAll<HTMLElement>("[data-gazette-pending-link]"),
      );
      pending.forEach((element) => unwrapElement(element));
      container.normalize();
      setHtml(container.innerHTML);
    }

    setPendingSelectionId(null);
    setSelectedBlockCount(0);
    setSelectedText("");
    setSearchQ("");
    setResults([]);
    setSelectedEntity(null);
    setMessage(null);
  };

  const captureSelection = () => {
    setError(null);
    setMessage(null);

    const container = contentRef.current;
    const selection = window.getSelection();

    if (!container || !selection || selection.rangeCount === 0) return;

    if (pendingSelectionId) {
      setError("Finish or cancel the current text link before selecting another passage.");
      selection.removeAllRanges();
      return;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString().replace(/\s+/g, " ").trim();

    if (!text || !container.contains(range.commonAncestorContainer)) return;

    const textNodes = getSelectedTextNodes(container, range).filter((node) => {
      const { start, end } = selectedOffsetsForTextNode(node, range);
      return end > start && node.data.slice(start, end).trim().length > 0;
    });

    if (textNodes.length === 0) {
      selection.removeAllRanges();
      return;
    }

    const firstBlock = closestBlock(textNodes[0]);
    const lastBlock = closestBlock(textNodes[textNodes.length - 1]);

    if (!firstBlock || !lastBlock) {
      setError("Select text inside Gazette paragraphs, headings, list items or table cells.");
      selection.removeAllRanges();
      return;
    }

    const selectedBlocks = getBlocksBetween(container, firstBlock, lastBlock);

    if (selectedBlocks.length === 0 || selectedBlocks.length > MAX_SELECTED_BLOCKS) {
      setError(
        `Select text across no more than ${MAX_SELECTED_BLOCKS} adjacent Gazette text blocks. This prevents accidental linking across unrelated parts of the notice.`,
      );
      selection.removeAllRanges();
      return;
    }

    const selectedBlockSet = new Set(selectedBlocks);
    const crossesUnsupportedStructure = textNodes.some((node) => {
      const block = closestBlock(node);
      return !block || !selectedBlockSet.has(block);
    });

    if (crossesUnsupportedStructure) {
      setError(
        "The selection crosses unsupported document structure. Select the person's or institution's name across adjacent Gazette lines only.",
      );
      selection.removeAllRanges();
      return;
    }

    const touchesExistingLink = textNodes.some((node) =>
      node.parentElement?.closest("[data-gazette-inline-link]"),
    );

    if (touchesExistingLink) {
      setError(
        "Part of that text is already linked. Unlink the existing entity before changing the target.",
      );
      selection.removeAllRanges();
      return;
    }

    const pendingId = crypto.randomUUID();

    try {
      for (let i = textNodes.length - 1; i >= 0; i -= 1) {
        const node = textNodes[i];
        const { start, end } = selectedOffsetsForTextNode(node, range);
        if (end <= start) continue;

        const selectedPiece = node.data.slice(start, end);
        if (!selectedPiece.trim()) continue;

        const localRange = document.createRange();
        localRange.setStart(node, start);
        localRange.setEnd(node, end);

        const marker = document.createElement("span");
        marker.setAttribute("data-gazette-pending-link", pendingId);
        marker.setAttribute("title", "Pending Gazette entity link");
        marker.className = "gazette-inline-pending";

        const fragment = localRange.extractContents();
        marker.appendChild(fragment);
        localRange.insertNode(marker);
      }

      container.normalize();

      setHtml(container.innerHTML);
      setPendingSelectionId(pendingId);
      setSelectedBlockCount(selectedBlocks.length);
      setSelectedText(text);
      setSearchQ(text);
      setResults([]);
      setSelectedEntity(null);
      setLinkType("person");
      setSemanticRole("establishing_authority");
      selection.removeAllRanges();
    } catch {
      const pending = Array.from(
        container.querySelectorAll<HTMLElement>(
          `[data-gazette-pending-link="${pendingId}"]`,
        ),
      );
      pending.forEach((element) => unwrapElement(element));
      container.normalize();
      setHtml(container.innerHTML);

      setError(
        "CitizenGuide could not safely mark that selection. Try selecting only the person's or institution's name across adjacent Gazette lines.",
      );
    }
  };

  const searchEntities = async (event?: FormEvent) => {
    event?.preventDefault();

    const query = searchQ.trim();
    if (query.length < 2) return setError("Enter at least 2 characters to search.");

    setSearching(true);
    setError(null);
    setMessage(null);
    setSelectedEntity(null);

    try {
      const params = new URLSearchParams({
        q: query,
        kind: linkType === "person" ? "people" : "institutions",
      });

      if (noticeDate) params.set("notice_date", noticeDate);

      const res = await fetch(`/api/admin/gazette/entity-search?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Entity search failed");

      setResults(json.data || []);

      if (!json.data?.length) {
        setMessage(
          linkType === "person"
            ? "No matching officials or MCAs were found."
            : "No matching institutions were found.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Entity search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const switchType = (type: "person" | "institution") => {
    setLinkType(type);
    setResults([]);
    setSelectedEntity(null);
    setMessage(null);
    setSemanticRole(type === "person" ? "establishing_authority" : "mentioned_institution");
  };

  const saveLink = async () => {
    if (!selectedText) return setError("Select text in the Gazette notice first.");
    if (!selectedEntity) return setError("Choose the person or institution this text represents.");

    const container = contentRef.current;
    if (!container || !pendingSelectionId) {
      return setError("The selected text marker is no longer available. Select the text again.");
    }

    const pendingMarkers = Array.from(
      container.querySelectorAll<HTMLElement>(
        `[data-gazette-pending-link="${pendingSelectionId}"]`,
      ),
    );

    if (pendingMarkers.length === 0) {
      return setError("The selected text marker is no longer available. Select the text again.");
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    const inlineLinkId = crypto.randomUUID();

    pendingMarkers.forEach((pending) => {
      pending.removeAttribute("data-gazette-pending-link");
      pending.removeAttribute("title");
      pending.setAttribute("data-gazette-inline-link", inlineLinkId);
      pending.className = "gazette-inline-entity";
    });

    const nextHtml = container.innerHTML;

    const payload =
      linkType === "person"
        ? {
            id: inlineLinkId,
            link_type: "person",
            person_kind: selectedEntity.kind,
            person_id: selectedEntity.person_id,
            leader_role_id: selectedEntity.role_id || null,
            selected_text: selectedText,
            historical_label: selectedText,
            semantic_role: semanticRole,
            capacity_title: selectedEntity.role_title || null,
            organization_name: selectedEntity.organization || null,
            role_start_date: selectedEntity.term_start_date || null,
            role_end_date: selectedEntity.term_end_date || null,
            content_html: nextHtml,
            verification_status: "Verified",
          }
        : {
            id: inlineLinkId,
            link_type: "institution",
            institution_id: selectedEntity.institution_id,
            selected_text: selectedText,
            historical_label: selectedEntity.historical_label || selectedText,
            semantic_role: semanticRole,
            organization_name: selectedEntity.current_name || selectedEntity.name || null,
            content_html: nextHtml,
            verification_status: "Verified",
          };

    try {
      const res = await fetch(`/api/admin/gazette/notices/${noticeId}/inline-links`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Inline link could not be saved");

      setHtml(nextHtml);
      setPendingSelectionId(null);
      setSelectedBlockCount(0);
      setSelectedText("");
      setSearchQ("");
      setResults([]);
      setSelectedEntity(null);
      setMessage(`"${selectedText}" is now linked to the selected ${linkType}.`);
      await load();
    } catch (err) {
      const savedMarkers = Array.from(
        container.querySelectorAll<HTMLElement>(
          `[data-gazette-inline-link="${inlineLinkId}"]`,
        ),
      );

      savedMarkers.forEach((marker) => {
        marker.removeAttribute("data-gazette-inline-link");
        marker.setAttribute("data-gazette-pending-link", pendingSelectionId);
        marker.setAttribute("title", "Pending Gazette entity link");
        marker.className = "gazette-inline-pending";
      });

      setHtml(container.innerHTML);
      setError(err instanceof Error ? err.message : "Inline link could not be saved");
    } finally {
      setSaving(false);
    }
  };

  const unlink = async (linkId: string) => {
    if (!window.confirm("Remove this inline link? The Gazette wording will remain unchanged.")) {
      return;
    }

    setError(null);
    setMessage(null);

    const res = await fetch(
      `/api/admin/gazette/notices/${noticeId}/inline-links?link_id=${encodeURIComponent(linkId)}`,
      { method: "DELETE", credentials: "include" },
    );

    const json = await res.json();

    if (!res.ok) return setError(json.error || "Inline link could not be removed");

    setHtml(json.content_html || "");
    setMessage("Inline link removed. The Gazette wording was preserved.");
    await load();
  };

  const semanticRoles =
    linkType === "person"
      ? INLINE_PERSON_SEMANTIC_ROLES
      : INLINE_INSTITUTION_SEMANTIC_ROLES;

  return (
    <section aria-labelledby="inline-gazette-linking-heading" className="govuk-!-margin-bottom-8">
      <h2 id="inline-gazette-linking-heading" className="govuk-heading-l">
        Link text inside this notice
      </h2>

      <p className="govuk-body">
        Select the exact name of a person or institution in the Gazette transcription below.
        CitizenGuide will preserve the published wording and turn that selected text into a
        link on the public notice.
      </p>

      <div className="govuk-inset-text">
        <strong>Historical context matters.</strong>
        <br />
        For officials, search results include current and former positions. Where role dates
        overlap the Gazette date{noticeDate ? ` (${noticeDate})` : ""}, CitizenGuide marks
        that role as matching the notice date. For institutions, current and former names
        point to the same stable institution record when it is the same legal entity.
      </div>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h3 className="govuk-error-summary__title">There is a problem</h3>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}

      {message && (
        <div className="govuk-notification-banner govuk-notification-banner--success" role="region">
          <div className="govuk-notification-banner__content">
            <p className="govuk-body">{message}</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="govuk-body">Loading Gazette transcription…</p>
      ) : (
        <>
          <div className="govuk-form-group">
            <span className="govuk-label govuk-label--m">Gazette transcription</span>
            <div className="govuk-hint">
              Highlight the exact words you want linked. A single name may span up to{" "}
              {MAX_SELECTED_BLOCKS} adjacent Gazette lines or text blocks.
            </div>

            <div
              ref={contentRef}
              onMouseUp={captureSelection}
              onKeyUp={captureSelection}
              className="gazette-notice-content govuk-body govuk-!-padding-4"
              style={{ border: "1px solid #b1b4b6", maxHeight: "32rem", overflowY: "auto" }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          {selectedText && (
            <div className="govuk-!-margin-top-5">
              <h3 className="govuk-heading-m">Link selected text</h3>

              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Selected text</dt>
                  <dd className="govuk-summary-list__value">
                    <strong>{selectedText}</strong>
                    {selectedBlockCount > 1 && (
                      <div className="govuk-hint govuk-!-margin-bottom-0">
                        This selection spans {selectedBlockCount} adjacent Gazette text blocks.
                        It will be stored as one logical entity link.
                      </div>
                    )}
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Gazette date</dt>
                  <dd className="govuk-summary-list__value">{noticeDate || "Not recorded"}</dd>
                </div>
              </dl>

              <fieldset className="govuk-fieldset govuk-!-margin-bottom-4">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  What does this text identify?
                </legend>

                <div className="govuk-radios govuk-radios--inline">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="inline-link-person"
                      name="inline-link-type"
                      type="radio"
                      checked={linkType === "person"}
                      onChange={() => switchType("person")}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="inline-link-person">
                      Person
                    </label>
                  </div>

                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="inline-link-institution"
                      name="inline-link-type"
                      type="radio"
                      checked={linkType === "institution"}
                      onChange={() => switchType("institution")}
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="inline-link-institution"
                    >
                      Institution
                    </label>
                  </div>
                </div>
              </fieldset>

              <form onSubmit={searchEntities}>
                <div className="govuk-form-group">
                  <label className="govuk-label govuk-label--s" htmlFor="inline-entity-search">
                    {linkType === "person"
                      ? "Search people and historical positions"
                      : "Search institutions and historical names"}
                  </label>

                  <div id="inline-entity-search-hint" className="govuk-hint">
                    {linkType === "person"
                      ? "Search by name, current or former position, organisation, constituency, county or party."
                      : "Search by current name, official name, former name or alias."}
                  </div>

                  <div className="govuk-button-group">
                    <input
                      id="inline-entity-search"
                      className="govuk-input govuk-!-width-two-thirds"
                      aria-describedby="inline-entity-search-hint"
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

              {results.length > 0 && (
                <fieldset className="govuk-fieldset govuk-!-margin-bottom-5">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                    Choose the historical context
                  </legend>

                  <div className="govuk-radios">
                    {results.map((result) => {
                      const resultId = `inline-result-${result.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
                      return (
                        <div className="govuk-radios__item" key={result.id}>
                          <input
                            className="govuk-radios__input"
                            id={resultId}
                            name="inline-entity-result"
                            type="radio"
                            checked={selectedEntity?.id === result.id}
                            onChange={() => setSelectedEntity(result)}
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor={resultId}>
                            <strong>{result.name}</strong>
                            {result.matches_notice_date && (
                              <>
                                {" "}
                                <strong className="govuk-tag govuk-tag--green">
                                  Matches Gazette date
                                </strong>
                              </>
                            )}
                            <span className="govuk-hint govuk-!-margin-bottom-0">
                              {result.description || "No additional context"}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {selectedEntity && (
                <>
                  <div className="govuk-form-group">
                    <label className="govuk-label govuk-label--s" htmlFor="inline-semantic-role">
                      Role in this Gazette notice
                    </label>
                    <div id="inline-semantic-role-hint" className="govuk-hint">
                      This describes what the person or institution is doing in this specific notice.
                      It does not change their government position.
                    </div>
                    <select
                      id="inline-semantic-role"
                      className="govuk-select"
                      aria-describedby="inline-semantic-role-hint"
                      value={semanticRole}
                      onChange={(event) => setSemanticRole(event.target.value)}
                    >
                      {semanticRoles.map((role) => (
                        <option key={role} value={role}>
                          {inlineRoleLabel(role)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="govuk-inset-text">
                    <strong>Selected target</strong>
                    <br />
                    {selectedEntity.name}
                    {selectedEntity.description && (
                      <>
                        <br />
                        <span>{selectedEntity.description}</span>
                      </>
                    )}
                    {selectedEntity.public_url && (
                      <>
                        <br />
                        <Link href={selectedEntity.public_url} target="_blank" className="govuk-link">
                          View current public record
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="govuk-button-group">
                    <button
                      type="button"
                      className="govuk-button"
                      disabled={saving}
                      onClick={saveLink}
                    >
                      {saving ? "Saving link…" : "Link selected text"}
                    </button>
                    <button
                      type="button"
                      className="govuk-button govuk-button--secondary"
                      onClick={cancelPendingSelection}
                    >
                      Cancel selection
                    </button>
                  </div>
                </>
              )}

              {!selectedEntity && (
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={cancelPendingSelection}
                >
                  Cancel selection
                </button>
              )}
            </div>
          )}

          <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l" />
          <h3 className="govuk-heading-m">Inline links already in this notice</h3>

          {links.length === 0 ? (
            <p className="govuk-body">
              No person or institution names have been linked inside this notice yet.
            </p>
          ) : (
            <div className="govuk-table-wrapper">
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th className="govuk-table__header" scope="col">Gazette text</th>
                    <th className="govuk-table__header" scope="col">Target</th>
                    <th className="govuk-table__header" scope="col">Historical context</th>
                    <th className="govuk-table__header" scope="col">Action</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {links.map((link) => {
                    const targetName =
                      link.link_type === "person"
                        ? personDisplayName(link)
                        : link.institution?.name ||
                          link.historical_label ||
                          link.selected_text;

                    return (
                      <tr className="govuk-table__row" key={link.id}>
                        <td className="govuk-table__cell"><strong>{link.selected_text}</strong></td>
                        <td className="govuk-table__cell">{targetName}</td>
                        <td className="govuk-table__cell">
                          {link.semantic_role ? inlineRoleLabel(link.semantic_role) : "—"}
                          {(link.capacity_title ||
                            link.organization_name ||
                            link.role_start_date ||
                            link.role_end_date) && (
                            <div className="govuk-hint govuk-!-margin-bottom-0">
                              {[
                                link.capacity_title,
                                link.organization_name,
                                link.role_start_date || link.role_end_date
                                  ? `${link.role_start_date || "?"} – ${link.role_end_date || "present"}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          )}
                        </td>
                        <td className="govuk-table__cell">
                          <button
                            type="button"
                            className="govuk-link app-button-as-link"
                            onClick={() => unlink(link.id)}
                          >
                            Unlink
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        :global(.gazette-inline-entity) {
          text-decoration: underline;
          text-decoration-thickness: max(1px, 0.0625rem);
          text-underline-offset: 0.1578em;
        }
        :global(.gazette-inline-pending) {
          background: #ffdd00;
          box-shadow: 0 0 0 1px #ffdd00;
        }
      `}</style>
    </section>
  );
}