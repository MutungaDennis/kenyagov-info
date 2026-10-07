"use client";

import { useEffect, useState } from "react";

type Item = { id: string; text: string };

function slugify(text: string, taken: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section";
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  taken.add(id);
  return id;
}

/**
 * "On this page" list built from the page's h2 headings, for long pages.
 * Renders nothing until headings are found, and nothing for short pages.
 */
export default function AutoContents({ minHeadings = 4 }: { minHeadings?: number }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const main = document.getElementById("main-content") ?? document.querySelector("main");
    if (!main) return;
    const taken = new Set<string>(
      Array.from(document.querySelectorAll("[id]")).map((el) => el.id),
    );
    const found: Item[] = [];
    main.querySelectorAll<HTMLHeadingElement>("h2").forEach((h) => {
      if (h.closest("nav, aside, [data-no-contents]")) return;
      const text = (h.textContent ?? "").trim();
      if (!text || /^(is this page useful|cookies on)/i.test(text)) return;
      if (!h.id) h.id = slugify(text, taken);
      h.classList.add("app-contents-target");
      found.push({ id: h.id, text });
    });
    setItems(found);
  }, []);

  if (items.length < minHeadings) return null;

  return (
    <nav
      className="govuk-!-margin-bottom-6"
      aria-labelledby="auto-contents-heading"
    >
      <h2 id="auto-contents-heading" className="govuk-heading-s" data-no-contents>
        On this page
      </h2>
      <ul className="govuk-list govuk-list--bullet govuk-body-s">
        {items.map((item) => (
          <li key={item.id}>
            <a className="govuk-link" href={`#${item.id}`}>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}