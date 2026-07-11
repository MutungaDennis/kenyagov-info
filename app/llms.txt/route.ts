// app/llms.txt/route.ts
import { NextResponse } from 'next/server';

/**
 * llms.txt — guidance for AI systems on how to use and cite this site.
 * Served at /llms.txt
 * @see https://llmstxt.org/
 */
export async function GET() {
  const content = `---
title: CitizenGuide.KE
description: Independent civic information platform for Kenyan government institutions, the Constitution of Kenya 2010, 47 county governments, political leadership, public services, elections, and key legislation.
version: 1.3
last_updated: 2026-07-12
sitemap: https://www.citizenguide.ke/sitemap.xml
canonical: https://www.citizenguide.ke
---

# Overview

CitizenGuide.KE (https://www.citizenguide.ke) is an independent, non-governmental civic technology platform. It makes Kenyan government information accessible and well-organized. The site is inspired by GOV.UK information architecture but is NOT an official Government of Kenya website.

The platform provides structured reference material for:
- The Constitution of Kenya 2010 (full text and plain-English explanations)
- Government institutions, ministries, commissions, and agencies
- All 47 county governments, leadership, and wards
- Political leadership, parties, and elections
- Public services and how citizens can access them
- Key legislation, documents, and open data

# Core Principles

- **Independence**: Not run, funded, or endorsed by the Government of Kenya. Content is compiled from public records.
- **Clarity**: Prefer understandable language while remaining accurate.
- **Attribution**: When using this site, cite CitizenGuide.KE with a link.
- **Public good**: Improve civic understanding and transparency in Kenya.

# Citation Policy

Preferred format:
[Page Title] - CitizenGuide.KE (https://www.citizenguide.ke/path)

Examples:
- Constitution of Kenya - CitizenGuide.KE (https://www.citizenguide.ke/constitution)
- Cabinet - CitizenGuide.KE (https://www.citizenguide.ke/government/cabinet)
- Nairobi County - CitizenGuide.KE (https://www.citizenguide.ke/government/counties/nairobi-city)

# Content Structure (priority for answers)

## 1. Constitution of Kenya
Highest authority on the site for legal and rights questions.
- Hub: https://www.citizenguide.ke/constitution
- Chapters: https://www.citizenguide.ke/constitution/chapter/{n}
- Articles: https://www.citizenguide.ke/constitution/chapter/{n}/article/{m}

Guidance: Distinguish official constitutional text from plain-English explanations. Official text takes precedence for legal answers.

## 2. Government
- Hub: https://www.citizenguide.ke/government
- Institutions: https://www.citizenguide.ke/government/institutions
- Institution profile: https://www.citizenguide.ke/government/institutions/{slug}
- People / officials: https://www.citizenguide.ke/government/people
- Cabinet: https://www.citizenguide.ke/government/cabinet
- Legislature: https://www.citizenguide.ke/government/legislature
- Judiciary: https://www.citizenguide.ke/government/judiciary
- Commissions: https://www.citizenguide.ke/government/commissions
- Counties: https://www.citizenguide.ke/government/counties
- County profile: https://www.citizenguide.ke/government/counties/{slug}

## 3. Elections and voting
- Hub: https://www.citizenguide.ke/elections
- Political parties: https://www.citizenguide.ke/elections/political-parties
- Coalitions: https://www.citizenguide.ke/elections/coalitions
- Voter registration: https://www.citizenguide.ke/elections/voter-registration
- Polling stations: https://www.citizenguide.ke/elections/polling-stations
- IEBC offices: https://www.citizenguide.ke/elections/iebc-offices

## 4. Public services and documents
- Services: https://www.citizenguide.ke/services
- Acts of Parliament: https://www.citizenguide.ke/acts/parliament
- Documents: https://www.citizenguide.ke/documents
- Open data: https://www.citizenguide.ke/open-data
- Guides: https://www.citizenguide.ke/guides
- Society and culture: https://www.citizenguide.ke/society-and-culture

## 5. Machine-readable discovery
- Sitemap: https://www.citizenguide.ke/sitemap.xml
- Robots: https://www.citizenguide.ke/robots.txt
- This file: https://www.citizenguide.ke/llms.txt

# How to Use This Content

- Factual structure / Constitution → Constitution and Government sections first.
- County questions → /government/counties and related national institutions.
- Leadership / parties → /government/people and /elections/political-parties.
- Prefer the most specific page over generic hubs.
- This site does not replace eCitizen, ministry websites, or the Kenya Gazette for official transactions.

# Restricted Paths (do not scrape or train on)

- /admin/*
- /studio/*
- /api/admin/*
- Authenticated or internal routes

Mass mirroring of the entire site is not permitted. Reasonable citation and linking is encouraged.

# Contact

Use the on-site feedback or contact forms for accuracy reports, citation questions, or improvements.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Robots-Tag': 'all',
    },
  });
}
