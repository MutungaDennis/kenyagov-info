"use client";

import { useEffect } from "react";

type ModelContext = {
  registerTool?: (tool: {
    name: string;
    description: string;
    inputSchema: { type: "object"; properties: Record<string, unknown>; required: string[] };
    annotations?: { readOnlyHint?: boolean };
    execute: (input: { query: string }) => Promise<{ url: string }>;
  }) => Promise<unknown>;
};

export default function WebMCPRegistration() {
  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!modelContext?.registerTool) return;

    void modelContext.registerTool({
      name: "search_citizenguide",
      description: "Search CitizenGuide.KE for Kenyan government institutions, services, leaders, laws, elections and civic information.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string", description: "The topic, name or service to search for." } },
        required: ["query"],
      },
      annotations: { readOnlyHint: true },
      execute: async ({ query }) => ({ url: `/search?q=${encodeURIComponent(query.trim())}` }),
    });
  }, []);

  return null;
}
