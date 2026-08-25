"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CONSTITUTION_SCHEDULES,
  scheduleByNumber,
} from "@/lib/constitution/schedules";
import SpeechTableEditor from "@/components/admin/hansard/SpeechTableEditor";
import {
  createEmptyTable,
  type SpeechTableDraft,
} from "@/lib/hansard/tables";

type ScheduleBlock =
  | { type: "paragraph"; text: string }
  | {
      type: "table";
      caption?: string;
      headers: string[];
      rows: string[][];
    };

type ScheduleSection = {
  heading?: string | null;
  blocks: ScheduleBlock[];
};

type StructuredSchedule = {
  scheduleNumber: number;
  slug: string;
  fullTitle: string;
  title: string;
  citation: string;
  sections: ScheduleSection[];
};

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function tableBlocksToDrafts(sections: ScheduleSection[]): SpeechTableDraft[] {
  const drafts: SpeechTableDraft[] = [];
  for (const section of sections) {
    for (const b of section.blocks || []) {
      if (b.type !== "table") continue;
      const headers =
        b.headers?.length > 0 ? [...b.headers] : ["Column 1", "Column 2"];
      drafts.push({
        id: randomId(),
        caption: b.caption || section.heading || "",
        columnCount: headers.length,
        headers,
        rows:
          b.rows?.length > 0
            ? b.rows.map((r) =>
                Array.from({ length: headers.length }, (_, i) => r[i] ?? ""),
              )
            : [Array.from({ length: headers.length }, () => "")],
      });
    }
  }
  return drafts;
}

function stripTablesFromSections(sections: ScheduleSection[]): ScheduleSection[] {
  return sections
    .map((s) => ({
      ...s,
      blocks: (s.blocks || []).filter((b) => b.type !== "table"),
    }))
    .filter((s) => (s.blocks || []).length > 0 || s.heading);
}

function draftsToTableSections(tables: SpeechTableDraft[]): ScheduleSection[] {
  return tables
    .map((t) => {
      const headers = t.headers.map((h) => h.trim() || " ");
      const rows = t.rows
        .filter((row) => row.some((c) => String(c).trim()))
        .map((row) => headers.map((_, i) => String(row[i] ?? "").trim()));
      if (!rows.length) return null;
      return {
        heading: t.caption.trim() || "Table",
        blocks: [
          {
            type: "table" as const,
            caption: t.caption.trim() || undefined,
            headers,
            rows,
          },
        ],
      };
    })
    .filter(Boolean) as ScheduleSection[];
}

function emptyScheduleTable(scheduleNumber: number): SpeechTableDraft {
  const base = createEmptyTable(2, 4);
  if (scheduleNumber === 5) {
    return {
      ...base,
      caption: "Legislation to be enacted by Parliament",
      headers: ["Article / provision", "Time period"],
    };
  }
  if (scheduleNumber === 1) {
    return {
      ...createEmptyTable(2, 8),
      caption: "Counties",
      headers: ["No.", "County"],
    };
  }
  return {
    ...base,
    caption: "",
    headers: ["Column 1", "Column 2"],
  };
}

export default function ConstitutionScheduleUploadPanel() {
  const [scheduleNumber, setScheduleNumber] = useState(5);
  const meta = scheduleByNumber(scheduleNumber)!;
  const [fullTitle, setFullTitle] = useState(meta.fullTitle);
  const [title, setTitle] = useState(meta.title);
  const [citation, setCitation] = useState(meta.citation);
  const [pastedText, setPastedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [structured, setStructured] = useState<StructuredSchedule | null>(
    null,
  );
  const [manualTables, setManualTables] = useState<SpeechTableDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [publicPath, setPublicPath] = useState<string | null>(null);

  useEffect(() => {
    const m = scheduleByNumber(scheduleNumber);
    if (!m) return;
    setFullTitle(m.fullTitle);
    setTitle(m.title);
    setCitation(m.citation);
    setStructured(null);
    setManualTables([]);
    setSaveMessage(null);
    setPublicPath(null);
  }, [scheduleNumber]);

  const handleProcess = async () => {
    if (pastedText.trim().length < 40) {
      setError("Paste the official schedule text");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setStructured(null);
    setSaveMessage(null);
    setPublicPath(null);
    try {
      const res = await fetch("/api/admin/constitution/schedules/process", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleNumber,
          text: pastedText.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.structured) {
        throw new Error(json.error || "Processing failed");
      }
      const s = json.structured as StructuredSchedule;
      const fromGrok = tableBlocksToDrafts(s.sections || []);
      setManualTables((prev) => (fromGrok.length > 0 ? fromGrok : prev));
      setStructured({
        ...s,
        sections: stripTablesFromSections(s.sections || []),
      });
      setFullTitle(s.fullTitle || fullTitle);
      setTitle(s.title || title);
      setCitation(s.citation || citation);
      setTimeout(() => {
        document
          .getElementById("schedule-preview")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const buildSectionsForSave = (): ScheduleSection[] | null => {
    let sections: ScheduleSection[] = structured?.sections
      ? [...structured.sections]
      : [];

    if (!sections.length && pastedText.trim().length >= 40) {
      const paras = pastedText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      sections = [
        {
          heading: null,
          blocks: paras.map((text) => ({ type: "paragraph" as const, text })),
        },
      ];
    }

    const tableSections = draftsToTableSections(manualTables);
    sections = [...sections, ...tableSections];

    if (!sections.length) return null;
    return sections;
  };

  const handleSave = async () => {
    const sections = buildSectionsForSave();
    if (!sections?.length) {
      setError(
        "Add schedule text (Process with Grok) and/or build at least one table before saving.",
      );
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/constitution/schedules/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleNumber:
            structured?.scheduleNumber || scheduleNumber,
          slug: structured?.slug || meta.slug,
          fullTitle,
          title,
          citation,
          sections,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Save failed");
      }
      setSaveMessage(json.message);
      setPublicPath(json.publicPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const proseBlocks =
    structured?.sections.reduce((n, s) => n + (s.blocks?.length || 0), 0) ||
    0;

  return (
    <div>
      <h2 className="govuk-heading-l">Paste Constitution Schedule</h2>
      <p className="govuk-body">
        After Chapter 18 come the six Schedules. Paste official text for Grok to
        structure, then use the <strong>manual table builder</strong> (same
        idea as Hansard) for Fifth Schedule-style tables and any dense tabular
        data Grok misses.
      </p>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}
      {saveMessage && (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="status"
        >
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">Success</h2>
          </div>
          <div className="govuk-notification-banner__content">
            <p className="govuk-body">{saveMessage}</p>
            {publicPath && (
              <p className="govuk-body">
                <Link href={publicPath} className="govuk-link" target="_blank">
                  View public schedule page
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="sched_num">
          Schedule
        </label>
        <select
          id="sched_num"
          className="govuk-select"
          value={scheduleNumber}
          onChange={(e) => setScheduleNumber(Number(e.target.value))}
        >
          {CONSTITUTION_SCHEDULES.map((s) => (
            <option key={s.number} value={s.number}>
              {s.fullTitle} — {s.title}
            </option>
          ))}
        </select>
        <div className="govuk-hint">{meta.notes}</div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="sched_full">
              Full title
            </label>
            <input
              id="sched_full"
              className="govuk-input"
              value={fullTitle}
              onChange={(e) => setFullTitle(e.target.value)}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="sched_title">
              Short title
            </label>
            <input
              id="sched_title"
              className="govuk-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="sched_cite">
              Citation
            </label>
            <input
              id="sched_cite"
              className="govuk-input"
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="sched_paste">
          Official schedule text (prose)
        </label>
        <div className="govuk-hint">
          Paste narrative / numbered clauses here. Prefer the visual table
          builder below for tabular schedules.
        </div>
        <textarea
          id="sched_paste"
          className="govuk-textarea"
          rows={12}
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder={`${meta.fullTitle}\n(${meta.citation})\n\n…`}
        />
      </div>

      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        disabled={isProcessing || pastedText.trim().length < 40}
        onClick={() => void handleProcess()}
      >
        {isProcessing ? "Grok is reading the schedule…" : "Process prose with Grok"}
      </button>

      <div className="govuk-!-margin-top-8" id="schedule-tables">
        <SpeechTableEditor
          tables={manualTables}
          onChange={setManualTables}
          title="Manual tables (Hansard-style)"
          hint="Add columns, edit headers, and type each cell — ideal for the Fifth Schedule and other dense tables. Tables Grok finds are loaded here for you to fix."
          addLabel="+ Add table"
          defaultColumns={2}
          defaultRows={4}
        />
        {manualTables.length === 0 && (
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            onClick={() =>
              setManualTables([emptyScheduleTable(scheduleNumber)])
            }
          >
            + Add starter table for this schedule
          </button>
        )}
      </div>

      {(structured || manualTables.length > 0 || pastedText.trim().length >= 40) && (
        <div id="schedule-preview" className="govuk-!-margin-top-8">
          <h3 className="govuk-heading-m">Ready to save</h3>
          <p className="govuk-body">
            Prose blocks from Grok: <strong>{proseBlocks}</strong>
            {" · "}
            Manual tables: <strong>{manualTables.length}</strong>
          </p>
          {structured && structured.sections.length > 0 && (
            <details className="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Preview prose sections ({structured.sections.length})
                </span>
              </summary>
              <div className="govuk-details__text">
                {structured.sections.map((section, si) => (
                  <div key={si} className="govuk-!-margin-bottom-4">
                    <h4 className="govuk-heading-s">
                      {section.heading || `Section ${si + 1}`}
                    </h4>
                    <ul className="govuk-list">
                      {(section.blocks || []).map((b, bi) =>
                        b.type === "paragraph" ? (
                          <li key={bi} className="govuk-body-s">
                            {b.text.slice(0, 220)}
                            {b.text.length > 220 ? "…" : ""}
                          </li>
                        ) : null,
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          )}

          <button
            type="button"
            className="govuk-button"
            disabled={isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? "Saving…" : "Save schedule to Sanity"}
          </button>
        </div>
      )}
    </div>
  );
}
