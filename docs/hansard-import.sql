-- Illustrative draft only. Replace ALL example metadata and text before use.
-- Run in Supabase SQL Editor as an authorized administrator.
-- The existing schema is already installed: do not recreate the tables.
-- Dollar quoting preserves apostrophes in JSON/HTML. Escape JSON double quotes
-- and newlines normally. Never include the delimiter $hansard$ in the payload.
-- Save the returned sitting_id. To UPDATE, include it as sitting.id and supply
-- the complete document: this function REPLACES sections/contributions/sources.
begin;
select public.save_hansard_document($hansard$
{
  "schema_version": 2,
  "sitting": {
    "slug": "replace-with-house-date-and-period",
    "title": "Replace with the official sitting title",
    "house_type": "national-assembly",
    "proceeding_type": "house-proceeding",
    "sitting_date": "2026-09-29",
    "sitting_period": "Afternoon Sitting",
    "source_community_id": "2fa15201-cbe0-4290-9fcb-eed7ffb03c9b",
    "source_collection_id": null,
    "source_item_id": null,
    "source_access": "unknown",
    "official_hansard_url": "https://example.org/replace-with-official-report.pdf",
    "summary_html": "",
    "summary_text": "",
    "topics": [],
    "status": "draft",
    "review_status": "pending"
  },
  "sections": [{
    "section_key": "debate-1",
    "parent_key": null,
    "heading": "Replace with the exact debate heading",
    "section_type": "debate",
    "sort_order": 1,
    "body_html": "",
    "body_text": "",
    "source_page_start": 1
  }],
  "contributions": [{
    "contribution_key": "speech-1",
    "section_key": "debate-1",
    "sort_order": 1,
    "speaker_name": "Replace with the printed speaker name",
    "speaker_kind": "unknown",
    "contribution_type": "speech",
    "leader_id": null,
    "leader_role_id": null,
    "body_html": "<p>Replace with the <strong>verbatim</strong> speech.</p><p>Preserve its paragraph breaks.</p>",
    "body_text": "Replace with the verbatim speech.\n\nPreserve its paragraph breaks.",
    "language": "en",
    "is_chair": false,
    "source_page": 1,
    "link_status": "unmatched",
    "review_status": "pending"
  }],
  "sources": [{
    "source_url": "https://example.org/replace-with-official-report.pdf",
    "file_name": "replace-with-source-filename.pdf",
    "is_official_source": true,
    "extraction_method": "pdf-text"
  }]
}
$hansard$::jsonb) as sitting_id;
commit;

-- Next: reload Hansard admin, select this existing draft, match speakers,
-- verify the public source and review the text, then publish from admin.
-- This script does not sanitize HTML or derive body_text: supply both yourself
-- or use JSON import in admin for the application's preparation/validation.
