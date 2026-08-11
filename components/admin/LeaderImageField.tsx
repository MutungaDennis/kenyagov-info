"use client";

/**
 * Portrait field: external URL and/or upload to Supabase Storage.
 * Sets image_url to the resulting public URL after upload.
 */

import { useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  /** When editing an existing person, files land under leaders/{id}/ */
  leaderId?: string;
  idPrefix?: string;
};

export default function LeaderImageField({
  value,
  onChange,
  leaderId,
  idPrefix = "leader-image",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewBroken, setPreviewBroken] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      if (leaderId) body.append("leaderId", leaderId);

      const res = await fetch("/api/admin/leaders/upload-image", {
        method: "POST",
        credentials: "include",
        body,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            "Upload failed",
        );
      }
      if (!json.url) throw new Error("No URL returned from upload");
      onChange(String(json.url));
      setPreviewBroken(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor={`${idPrefix}-url`}>
        Portrait image
      </label>
      <div id={`${idPrefix}-hint`} className="govuk-hint">
        Paste an HTTPS image URL, or upload a photo to Supabase Storage (JPEG,
        PNG, WebP, AVIF or GIF, max 5 MB). Prefer a clear head-and-shoulders
        portrait. AVIF is recommended for smaller file size.
      </div>

      <input
        id={`${idPrefix}-url`}
        className="govuk-input govuk-!-margin-bottom-2"
        type="url"
        inputMode="url"
        autoComplete="off"
        placeholder="https://…"
        aria-describedby={`${idPrefix}-hint`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setPreviewBroken(false);
          setError(null);
        }}
      />

      <div className="govuk-button-group">
        <input
          ref={inputRef}
          id={`${idPrefix}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,.jpg,.jpeg,.png,.webp,.avif,.gif"
          className="govuk-file-upload"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
      </div>
      {uploading && (
        <p className="govuk-hint" aria-live="polite">
          Uploading…
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

      <style jsx>{`
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
