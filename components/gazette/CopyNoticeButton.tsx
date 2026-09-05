"use client";

import { useState } from "react";

type CopyNoticeButtonProps = {
  targetId?: string;
  noticeNumber: number | string;
  issueLabel: string;
  publishedDate: string;
  citizenGuideUrl: string;
  officialSourceUrl?: string | null;
};

export default function CopyNoticeButton({
  targetId = "gazette-notice-content",
  noticeNumber,
  issueLabel,
  publishedDate,
  citizenGuideUrl,
  officialSourceUrl,
}: CopyNoticeButtonProps) {
  const [status, setStatus] = useState("");

  function getSelectedTextInsideNotice(target: HTMLElement) {
    const selection = window.getSelection();

    if (
      !selection ||
      selection.rangeCount === 0 ||
      selection.isCollapsed
    ) {
      return "";
    }

    const range = selection.getRangeAt(0);

    const startContainer =
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement
        : (range.startContainer as Element);

    const endContainer =
      range.endContainer.nodeType === Node.TEXT_NODE
        ? range.endContainer.parentElement
        : (range.endContainer as Element);

    const startsInside =
      startContainer && target.contains(startContainer);

    const endsInside =
      endContainer && target.contains(endContainer);

    if (!startsInside || !endsInside) {
      return "";
    }

    return selection.toString().trim();
  }

  function buildAttribution() {
    const lines = [
      "",
      "",
      `Source: Kenya Gazette Notice No. ${noticeNumber}, ${issueLabel}, published ${publishedDate}.`,
      "",
      "CitizenGuide.KE:",
      citizenGuideUrl,
    ];

    if (officialSourceUrl) {
      lines.push(
        "",
        "Official source:",
        officialSourceUrl
      );
    }

    return lines.join("\n");
  }

  async function handleCopy() {
    const target = document.getElementById(targetId);

    if (!target) {
      setStatus("The notice could not be found.");
      return;
    }

    const selectedText =
      getSelectedTextInsideNotice(target);

    const noticeText = (
      target.innerText ||
      target.textContent ||
      ""
    ).trim();

    const textToCopy =
      selectedText || noticeText;

    if (!textToCopy) {
      setStatus("There is no notice text to copy.");
      return;
    }

    const finalText =
      textToCopy + buildAttribution();

    try {
      await navigator.clipboard.writeText(
        finalText
      );

      setStatus(
        selectedText
          ? "Selected notice text copied with source links."
          : "Full notice copied with source links."
      );
    } catch (error) {
      console.error(
        "Unable to copy Gazette notice:",
        error
      );

      setStatus(
        "Copy failed. Select the text and use your browser copy command."
      );
    }
  }

  return (
    <div className="govuk-!-margin-bottom-5">
      <button
        type="button"
        className="govuk-button govuk-button--secondary govuk-!-margin-bottom-2"
        onClick={handleCopy}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          style={{
            verticalAlign: "text-bottom",
            marginRight: "8px",
          }}
        >
          <path
            fill="currentColor"
            d="M8 7V3h11a2 2 0 0 1 2 2v11h-4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3Zm2 0h5a2 2 0 0 1 2 2v5h2V5h-9v2Zm5 2H5v10h10V9Z"
          />
        </svg>

        Copy notice
      </button>

      <p className="govuk-hint govuk-!-margin-bottom-1">
        Select part of the notice first to
        copy only that section. If nothing is
        selected, the full notice will be
        copied. CitizenGuide and official
        source links are included automatically.
      </p>

      <p
        className="govuk-body-s govuk-!-margin-bottom-0"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status}
      </p>
    </div>
  );
}