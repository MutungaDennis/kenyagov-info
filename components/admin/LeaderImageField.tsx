"use client";

/**
 * Portrait field: drag-and-drop or click to upload, plus optional URL paste.
 * Sets image_url to the resulting public URL after upload.
 */

import { useCallback, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  /** Called after a successful storage upload (edit page can auto-save). */
  onUploaded?: (url: string) => void | Promise<void>;
  /** When editing an existing person, files land under leaders/{id}/ */
  leaderId?: string;
  idPrefix?: string;
};

export default function LeaderImageField({
  value,
  onChange,
  onUploaded,
  leaderId,
  idPrefix = "leader-image",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewBroken, setPreviewBroken] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [persistNote, setPersistNote] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      setPersistNote(null);
      try {
        const body = new FormData();
        body.append("file", file);
        if (leaderId) body.append("leaderId", leaderId);

        const res = await fetch("/api/admin/leaders/upload-image", {
          method: "POST",
          credentials: "include",
          body,
        });
        let json: Record<string, unknown> = {};
        try {
          json = await res.json();
        } catch {
          throw new Error(`Upload failed (HTTP ${res.status})`);
        }
        if (!res.ok) {
          throw new Error(
            [json.error, json.hint].filter(Boolean).join(" — ") ||
              "Upload failed",
          );
        }
        if (!json.url) throw new Error("No URL returned from upload");
        const url = String(json.url);
        onChange(url);
        setPreviewBroken(false);
        if (onUploaded) {
          try {
            await onUploaded(url);
            setPersistNote("Portrait uploaded and saved to this profile.");
          } catch (e) {
            setPersistNote(
              e instanceof Error
                ? `Uploaded, but auto-save failed: ${e.message}. Click “Save personal details”.`
                : "Uploaded — click “Save personal details” to keep it.",
            );
          }
        } else {
          setPersistNote(
            "Portrait ready — click Save on the form to keep it on this record.",
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [leaderId, onChange, onUploaded],
  );

  const openPicker = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (uploading) return;
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) {
      void upload(f);
      return;
    }
    // Some OS/browsers omit type for AVIF — allow by extension
    if (f && /\.(jpe?g|png|webp|gif|avif)$/i.test(f.name || "")) {
      void upload(f);
      return;
    }
    setError("Drop an image file (JPEG, PNG, WebP, AVIF or GIF).");
  };

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor={`${idPrefix}-drop`}>
        Portrait image
      </label>
      <div id={`${idPrefix}-hint`} className="govuk-hint">
        Prefer a clear head-and-shoulders portrait. JPEG, PNG, WebP, AVIF or
        GIF, max 5 MB. AVIF is best for smaller files.
      </div>

      {/* Primary: drag or click upload */}
      <div
        id={`${idPrefix}-drop`}
        role="button"
        tabIndex={0}
        aria-describedby={`${idPrefix}-hint`}
        aria-label="Upload portrait: drag and drop or click to choose a file"
        className="app-leader-image-drop"
        data-drag-over={dragOver ? "true" : "false"}
        data-uploading={uploading ? "true" : "false"}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={`${idPrefix}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,.jpg,.jpeg,.png,.webp,.avif,.gif"
          className="govuk-visually-hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">
          {uploading
            ? "Uploading…"
            : dragOver
              ? "Drop image to upload"
              : "Drag an image here, or click to choose a file"}
        </p>
        <p className="govuk-body-s govuk-!-margin-bottom-0">
          Click this box to open your file picker — or drag a photo from your
          computer onto it.
        </p>
      </div>

      {uploading && (
        <p className="govuk-hint" aria-live="polite">
          Uploading portrait…
        </p>
      )}
      {persistNote && !error && (
        <p className="govuk-hint" aria-live="polite">
          {persistNote}
        </p>
      )}
      {error && (
        <p className="govuk-error-message" role="alert">
          <span className="govuk-visually-hidden">Error: </span>
          {error}
        </p>
      )}

      {value.trim() && !previewBroken && (
        <div className="govuk-!-margin-top-3">
          <p className="govuk-body-s govuk-!-margin-bottom-1">Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.trim()}
            alt=""
            className="app-leader-image-preview"
            onError={() => setPreviewBroken(true)}
          />
          <p className="govuk-body-s">
            <button
              type="button"
              className="govuk-link"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                font: "inherit",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => {
                onChange("");
                setPreviewBroken(false);
                setPersistNote(null);
              }}
            >
              Clear image
            </button>
          </p>
        </div>
      )}
      {value.trim() && previewBroken && (
        <p className="govuk-hint govuk-!-margin-top-2">
          Preview could not load this URL. Check the link or upload a new file.
        </p>
      )}

      <details className="govuk-details govuk-!-margin-top-4">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">
            Or paste an image URL instead
          </span>
        </summary>
        <div className="govuk-details__text">
          <label className="govuk-label" htmlFor={`${idPrefix}-url`}>
            Image URL (HTTPS)
          </label>
          <input
            id={`${idPrefix}-url`}
            className="govuk-input"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://…"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setPreviewBroken(false);
              setError(null);
              setPersistNote(null);
            }}
          />
        </div>
      </details>

      <style jsx>{`
        .app-leader-image-drop {
          display: block;
          padding: 1.5rem 1.25rem;
          border: 2px dashed #505a5f;
          background: #f3f2f1;
          cursor: pointer;
          text-align: center;
          border-radius: 0;
        }
        .app-leader-image-drop:hover,
        .app-leader-image-drop:focus {
          border-color: #0b0c0c;
          outline: 3px solid #ffdd00;
          outline-offset: 0;
        }
        .app-leader-image-drop[data-drag-over="true"] {
          border-color: #00703c;
          background: #cce2d8;
        }
        .app-leader-image-drop[data-uploading="true"] {
          opacity: 0.7;
          cursor: wait;
        }
        .app-leader-image-preview {
          display: block;
          max-width: 160px;
          max-height: 200px;
          width: auto;
          height: auto;
          object-fit: cover;
          border: 1px solid #b1b4b6;
          background: #f3f2f1;
        }
      `}</style>
    </div>
  );
}
