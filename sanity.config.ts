import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

import { apiVersion, dataset, projectId } from './sanity/env';
import { schema } from './sanity/schemaTypes';
import { structure } from './sanity/structure';

export default defineConfig({
  // Managed hosting (`npx sanity deploy` → *.sanity.studio) uses basePath "/".
  // Self-hosting under Next at /studio is disabled (Worker size); keep config
  // for CLI deploy only — not imported by the Cloudflare Next Worker.
  basePath: process.env.SANITY_STUDIO_BASEPATH || "/",
  projectId,
  dataset,

  schema,
  
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  // Optional: Improve Studio performance
  useCdn: false,        // Better for development
  studio: {
    components: {
      // You can add custom studio components later
    },
  },
});