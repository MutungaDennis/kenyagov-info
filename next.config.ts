import type { NextConfig } from "next";
import path from "path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Tell Next.js to leave pdfjs-dist alone and resolve it from node_modules
  serverExternalPackages: ["pdfjs-dist"],

  // Keep compile-only / unused packages out of the OpenNext Worker (gzip limit).
  // Without this, sass.dart.js (~5MB) and other tooling get file-traced into the deploy.
  outputFileTracingExcludes: {
    "*": [
      "**/node_modules/sass/**/*",
      "**/node_modules/**/sass/**/*",
      "**/node_modules/babel-plugin-react-compiler/**/*",
      "**/node_modules/**/babel-plugin-react-compiler/**/*",
      "**/node_modules/**/next/dist/compiled/next-devtools/**/*",
      "**/node_modules/**/next/dist/compiled/cssnano-simple/**/*",
      "**/node_modules/**/next/dist/compiled/postcss-preset-env/**/*",
      "**/node_modules/**/next/dist/server/capsize-font-metrics.json",
      "**/node_modules/**/next/dist/compiled/@next/font/**/*",
      "**/node_modules/**/next/dist/compiled/next-server/app-page-experimental.runtime.prod.js",
      "**/node_modules/**/next/dist/compiled/next-server/app-page-turbo-experimental.runtime.prod.js",
      "**/node_modules/**/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",
      "**/node_modules/pdf-parse/**/*",
      "**/node_modules/pdf-parse-fork/**/*",
      "**/node_modules/pdfjs-dist/**/*",
      "**/node_modules/@ai-sdk/**/*",
      "**/node_modules/ai/**/*",
      "**/node_modules/@openrouter/**/*",
      "**/node_modules/sanity/**/*",
      "**/node_modules/@sanity/vision/**/*",
      "**/node_modules/styled-components/**/*",
      "**/node_modules/next-auth/**/*",
      "**/node_modules/esbuild/**/*",
      "**/node_modules/webpack/**/*",
      "**/node_modules/typescript/**/*",
    ],
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Maps 'govuk-frontend' to the folder containing the assets
      "govuk-frontend": path.resolve(__dirname, "node_modules/govuk-frontend/dist/govuk"),
    };
    return config;
  },

  turbopack: {
    resolveAlias: {
      "govuk-frontend": path.resolve(__dirname, "node_modules/govuk-frontend/dist/govuk"),
    },
  },


  // ==========================================
  // REDIRECTS FOR SEO CONTINUITY
  // ==========================================
  async redirects() {
    return [
      // ==========================================
      // GOVERNMENT STRUCTURE REORGANIZATION
      // ==========================================
      
      // Old root-level arms → Now under /government/
      {
        source: '/executive',
        destination: '/government/presidency',
        permanent: true,
      },
      {
        source: '/executive/:path*',
        destination: '/government/presidency',
        permanent: true,
      },
      {
        source: '/legislature',
        destination: '/government/legislature',
        permanent: true,
      },
      {
        source: '/legislature/:path*',
        destination: '/government/legislature/:path*',
        permanent: true,
      },
      {
        source: '/judiciary',
        destination: '/government/judiciary',
        permanent: true,
      },
      {
        source: '/judiciary/:path*',
        destination: '/government/judiciary/:path*',
        permanent: true,
      },
      {
        source: '/counties',
        destination: '/government/counties',
        permanent: true,
      },
      {
        source: '/counties/:path*',
        destination: '/government/counties/:path*',
        permanent: true,
      },

      // ==========================================
      // INSTITUTIONS REORGANIZATION
      // ==========================================
      
      // Old /institutions → Now /government/institutions
      {
        source: '/institutions',
        destination: '/government/institutions',
        permanent: true,
      },
      {
        source: '/institutions/:slug',
        destination: '/government/institutions/:slug',
        permanent: true,
      },
      // Old institution subpages → Now just the main profile
      {
        source: '/institutions/:slug/leadership',
        destination: '/government/institutions/:slug',
        permanent: true,
      },
      {
        source: '/institutions/:slug/services',
        destination: '/government/institutions/:slug',
        permanent: true,
      },
      {
        source: '/institutions/:slug/locations',
        destination: '/government/institutions/:slug',
        permanent: true,
      },
      {
        source: '/institutions/:slug/publications',
        destination: '/government/institutions/:slug',
        permanent: true,
      },
      {
        source: '/institutions/:slug/tenders',
        destination: '/government/institutions/:slug',
        permanent: true,
      },
      {
        source: '/institutions/:slug/tools',
        destination: '/government/institutions/:slug',
        permanent: true,
      },
      {
        source: '/institutions/:slug/data',
        destination: '/government/institutions/:slug',
        permanent: true,
      },

      // ==========================================
      // LEADERS/OFFICIALS → PEOPLE
      // ==========================================
      
      // Old /leaders → Now /government/people
      {
        source: '/leaders',
        destination: '/government/people',
        permanent: true,
      },
      {
        source: '/leaders/:category/:id',
        destination: '/government/people/:id',
        permanent: true,
      },
      // Old /officials → Now /government/people
      {
        source: '/officials',
        destination: '/government/people',
        permanent: true,
      },
      {
        source: '/officials/:id',
        destination: '/government/people/:id',
        permanent: true,
      },

      // ==========================================
      // INDEPENDENT BODIES → COMMISSIONS
      // ==========================================
      
      {
        source: '/independent-bodies',
        destination: '/government/commissions',
        permanent: true,
      },
      {
        source: '/independent-bodies/:slug',
        destination: '/government/institutions/:slug',
        permanent: true,
      },

      // ==========================================
      // POLITICS → ELECTIONS
      // ==========================================
      
      {
        source: '/politics',
        destination: '/elections',
        permanent: true,
      },
      {
        source: '/politics/general',
        destination: '/elections/general-elections',
        permanent: true,
      },
      {
        source: '/politics/by-elections',
        destination: '/elections/by-elections',
        permanent: true,
      },
      {
        source: '/politics/referendums',
        destination: '/elections/referendums',
        permanent: true,
      },
      {
        source: '/politics/voter-registration',
        destination: '/elections/voter-registration',
        permanent: true,
      },
      {
        source: '/politics/political-parties',
        destination: '/elections/political-parties',
        permanent: true,
      },
      {
        source: '/politics/political-parties/:slug',
        destination: '/elections/political-parties/:slug',
        permanent: true,
      },
      {
        source: '/politics/votes/:slug',
        destination: '/elections/results/:slug',
        permanent: true,
      },

      // ==========================================
      // PRESIDENTIAL VISITS REORGANIZATION
      // ==========================================
      
      {
        source: '/executive/presidency/international-visits',
        destination: '/government/presidential-visits',
        permanent: true,
      },
      {
        source: '/executive/presidency/international-visits/:slug',
        destination: '/government/presidential-visits/:slug',
        permanent: true,
      },

      // ==========================================
      // WARDS REORGANIZATION
      // ==========================================
      
      {
        source: '/counties/wards/:slug',
        destination: '/government/counties/wards/:slug/about',
        permanent: true,
      },

      // ==========================================
      // CONSTITUTION URL UPDATES
      // ==========================================
      
      // If you changed constitution URLs, add redirects here
      // Example (uncomment if needed):
      // {
      //   source: '/constitution/article/:article',
      //   destination: '/constitution/chapter/:article/article/:article',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;

// OpenNext Cloudflare: enable local bindings during `next dev`.
// https://opennext.js.org/cloudflare/get-started
initOpenNextCloudflareForDev();
