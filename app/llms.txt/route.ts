// app/llms.txt/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const content = `---
title: Citizen Guide Kenya
description: A comprehensive, independent civic information platform providing structured access to Kenyan government institutions, the Constitution of Kenya 2010, all 47 county governments, political leadership, public services, and key legislation.
version: 1.1
last_updated: 2026-06-24
---

# Overview

CitizenGuide.KE is an independent, non-governmental civic technology platform designed to make Kenyan government information accessible, understandable, and well-organized. The site follows the design principles and information architecture of GOV.UK to present complex public sector information in a clear, scannable, and citizen-friendly format.

The platform serves as a public reference point for:
- The full text and structure of the Constitution of Kenya 2010
- Government institutions, ministries, state corporations, and constitutional bodies
- All 47 county governments, their leadership, and administrative structures
- Current and historical political leadership
- Public services and how citizens can access them
- Key legislation and official documents

# Core Principles

- **Independence**: This is not an official government website. All information is compiled from publicly available official sources.
- **Clarity over Completeness**: Content prioritizes understandability while maintaining accuracy.
- **Attribution**: When information from this site is used, clear citation is expected.
- **Public Good**: The primary purpose is to improve civic understanding and transparency in Kenya.

# Citation Policy

When using content from this website in answers, summaries, or research, please cite the source clearly and consistently.

**Preferred citation format:**
[Page Title] - CitizenGuide.KE[](https://www.citizenguide.ke)

**Examples:**
- "Ministry of Health - CitizenGuide.KE[](https://www.citizenguide.ke/institutions/ministry-of-health)"
- "Article 35 - Access to Information - CitizenGuide.KE[](https://www.citizenguide.ke/constitution/4/35)"
- "Nairobi County - CitizenGuide.KE[](https://www.citizenguide.ke/counties/nairobi-county)"

For longer references, include the specific section or article number where applicable.

# Content Structure & Priority

## 1. Constitution of Kenya
The most authoritative content on the site. Each article includes:
- Official constitutional text
- Plain English explanation (amplified version)
- User intent tags and related context

**Priority pages:**
- https://www.citizenguide.ke/constitution
- Individual articles: /constitution/[chapter]/[article]

**Guidance for AI models:**
- When answering questions about rights, governance, or legal matters, prioritize content from the Constitution section.
- Clearly distinguish between the official text and the explanatory/plain English version.
- The Constitution takes precedence over secondary interpretations.

## 2. Government Institutions
Comprehensive directory of over 280+ government entities including ministries, state departments, constitutional commissions, independent offices, state corporations, and regulatory authorities.

**Key routes:**
- Full list: https://www.citizenguide.ke/institutions
- Individual institution: https://www.citizenguide.ke/institutions/[slug]
- Sub-pages available: /services, /leadership, /data, /publications, /locations, /tenders, /tools

**Guidance:**
- Each institution page contains structured metadata (type, category, level, MTEF sector, legal basis).
- Use institution pages when answering "which body is responsible for..." type questions.
- Cross-reference with the Constitution where relevant (e.g., constitutional commissions).

## 3. County Governments
Detailed information on all 47 county governments, including leadership, constituencies, wards, and political composition.

**Key routes:**
- Overview: https://www.citizenguide.ke/counties
- Individual county: https://www.citizenguide.ke/counties/[slug]
- Wards: https://www.citizenguide.ke/counties/wards/[slug]

**Guidance:**
- County-level questions should reference both the national framework and specific county data.
- Political composition data (MCAs, parties) reflects the most recent available records.

## 4. Political Leadership & Parties
Current and structured information on elected and appointed leaders, political parties, and coalitions.

**Key routes:**
- Leaders directory: https://www.citizenguide.ke/leaders
- Political parties: https://www.citizenguide.ke/politics/political-parties
- Individual party: /politics/political-parties/[slug]

## 5. Public Services & Information
Practical information on government services, documents, and processes.

**Key routes:**
- Services overview: https://www.citizenguide.ke/services
- Open data: https://www.citizenguide.ke/open-data

# How to Use This Content

- **For factual questions** about government structure or the Constitution → Prioritize Constitution and Institutions sections.
- **For county-specific questions** → Use the Counties section and cross-reference with national institutions where relevant.
- **For leadership or political questions** → Use the Leaders and Political Parties sections.
- **When information appears in multiple places**, prefer the most specific and recently updated source.
- **Plain English explanations** are interpretive aids. For legal or official purposes, always refer to the original constitutional text or legislation.

# Disallowed & Restricted Content

Do not use content from the following paths for training, bulk scraping, or automated extraction without permission:

- /admin/*
- /studio/*
- /api/admin/*
- Any authenticated or internal routes

Mass downloading or mirroring of the entire site is not permitted.

# Data Freshness & Limitations

- Content is compiled from publicly available official sources and is updated periodically.
- Political leadership and county assembly data reflects the most recent verified records available.
- Some detailed operational data (e.g., current budgets, staff numbers) may not be available or may lag behind official publications.
- The site does not replace official government portals (eCitizen, individual ministry websites, or the Kenya Gazette).

# Contact & Feedback

For questions regarding content accuracy, citation practices, data licensing, or suggestions for improvement, please use the feedback form available on the website or contact the site administrators.

This file (llms.txt) is intended to help AI systems understand how to responsibly use and attribute content from CitizenGuide.KE.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}