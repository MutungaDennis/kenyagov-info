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


  // Secret admin path → internal app/admin (backup if middleware is skipped).
  // Keep in sync with DEFAULT_PRODUCTION_ADMIN_BASE in lib/admin-path.ts
  async rewrites() {
    const fromEnv = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH?.trim();
    const secret =
      fromEnv && fromEnv !== "/admin"
        ? fromEnv.replace(/\/$/, "")
        : process.env.NODE_ENV === "production"
          ? "/cg-ke-a5wkqciyjpg940u3"
          : null;

    const adminRewrites =
      !secret || secret === "/admin"
        ? []
        : (() => {
            const base = secret.startsWith("/") ? secret : `/${secret}`;
            return [
              { source: base, destination: "/admin" },
              { source: `${base}/:path*`, destination: "/admin/:path*" },
            ];
          })();

    // Category pages are real routes at app/services/categories/[slug].
    // No rewrite needed; middleware consolidates ?category= onto those paths.
    return adminRewrites;
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
      {
        source: '/politics/coalitions',
        destination: '/elections/coalitions',
        permanent: true,
      },
      {
        source: '/politics/polling-stations',
        destination: '/elections/polling-stations',
        permanent: true,
      },
      {
        source: '/politics/polling-stations/:slug',
        destination: '/elections/polling-stations/:slug',
        permanent: true,
      },
      {
        source: '/politics/registered-voters',
        destination: '/elections/registered-voters',
        permanent: true,
      },
      {
        source: '/politics/registered-voters/:slug',
        destination: '/elections/registered-voters/:slug',
        permanent: true,
      },
      {
        source: '/politics/iebc-offices',
        destination: '/elections/iebc-offices',
        permanent: true,
      },
      {
        source: '/politics/about',
        destination: '/elections/about',
        permanent: true,
      },
      {
        source: '/politics/:path*',
        destination: '/elections/:path*',
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
      {
        source: '/international-visits',
        destination: '/government/presidential-visits',
        permanent: true,
      },
      {
        source: '/international-visits/:slug',
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
      // SHORTHAND / ALIAS PATHS (common bookmarks)
      // ==========================================

      {
        source: '/cabinet',
        destination: '/government/cabinet',
        permanent: true,
      },
      {
        source: '/presidency',
        destination: '/government/presidency',
        permanent: true,
      },
      {
        source: '/commissions',
        destination: '/government/commissions',
        permanent: true,
      },
      {
        source: '/people',
        destination: '/government/people',
        permanent: true,
      },
      {
        source: '/people/:slug',
        destination: '/government/people/:slug',
        permanent: true,
      },
      {
        source: '/government/officials',
        destination: '/government/people',
        permanent: true,
      },
      {
        source: '/government/officials/:slug',
        destination: '/government/people/:slug',
        permanent: true,
      },
      {
        source: '/devolution',
        destination: '/government/counties/devolution',
        permanent: true,
      },

      // ==========================================
      // CIVIC / SERVICE URLS (2026 information architecture)
      // permanent: true → HTTP 308 so search engines transfer ranking
      // ==========================================

      // GOV.UK-style browse → topics hub
      {
        source: '/browse',
        destination: '/topics',
        permanent: true,
      },
      {
        source: '/browse/:path*',
        destination: '/topics/:path*',
        permanent: true,
      },

      // Service discovery aliases
      {
        source: '/a-z',
        destination: '/services/a-z',
        permanent: true,
      },
      {
        source: '/services-a-z',
        destination: '/services/a-z',
        permanent: true,
      },
      {
        source: '/popular-services',
        destination: '/services/popular',
        permanent: true,
      },
      {
        source: '/services/popular-services',
        destination: '/services/popular',
        permanent: true,
      },

      // Digital government / portals
      {
        source: '/e-citizen',
        destination: '/ecitizen',
        permanent: true,
      },
      {
        source: '/eCitizen',
        destination: '/ecitizen',
        permanent: true,
      },
      {
        source: '/huduma',
        destination: '/huduma-centres',
        permanent: true,
      },
      {
        source: '/huduma-centre',
        destination: '/huduma-centres',
        permanent: true,
      },
      {
        source: '/huduma-centers',
        destination: '/huduma-centres',
        permanent: true,
      },
      {
        source: '/huduma-centres/find',
        destination: '/huduma-centres/locations',
        permanent: true,
      },

      // Civic explainers
      {
        source: '/how-government-works-in-kenya',
        destination: '/how-government-works',
        permanent: true,
      },
      {
        source: '/county-vs-national-government',
        destination: '/county-vs-national',
        permanent: true,
      },
      {
        source: '/public-money',
        destination: '/how-public-money-works',
        permanent: true,
      },
      {
        source: '/public-finance',
        destination: '/how-public-money-works',
        permanent: true,
      },
      {
        source: '/find-representatives',
        destination: '/find-your-representatives',
        permanent: true,
      },
      {
        source: '/find-my-representatives',
        destination: '/find-your-representatives',
        permanent: true,
      },
      {
        source: '/my-representatives',
        destination: '/find-your-representatives',
        permanent: true,
      },
      {
        source: '/contact-gov',
        destination: '/contact-government',
        permanent: true,
      },
      {
        source: '/contact-the-government',
        destination: '/contact-government',
        permanent: true,
      },
      {
        source: '/complaints',
        destination: '/complain-about-government',
        permanent: true,
      },
      {
        source: '/complain',
        destination: '/complain-about-government',
        permanent: true,
      },
      {
        source: '/ati',
        destination: '/access-to-information',
        permanent: true,
      },
      {
        source: '/access-to-info',
        destination: '/access-to-information',
        permanent: true,
      },
      {
        source: '/gazette',
        destination: '/kenya-gazette',
        permanent: true,
      },
      {
        source: '/official-notices',
        destination: '/kenya-gazette',
        permanent: true,
      },
      {
        source: '/kenya-gazette-notices',
        destination: '/kenya-gazette',
        permanent: true,
      },
      {
        source: '/scams-and-phishing',
        destination: '/scams',
        permanent: true,
      },
      {
        source: '/fake-websites',
        destination: '/scams',
        permanent: true,
      },
      {
        source: '/emergency',
        destination: '/emergency-and-safety',
        permanent: true,
      },
      {
        source: '/emergencies',
        destination: '/emergency-and-safety',
        permanent: true,
      },

      // Trust / about aliases
      {
        source: '/editorial',
        destination: '/editorial-policy',
        permanent: true,
      },
      {
        source: '/style-guide',
        destination: '/content-style-guide',
        permanent: true,
      },
      {
        source: '/writing-style',
        destination: '/content-style-guide',
        permanent: true,
      },
      {
        source: '/corrections-policy',
        destination: '/corrections',
        permanent: true,
      },
      {
        source: '/legal-disclaimer',
        destination: '/disclaimer',
        permanent: true,
      },
      {
        source: '/contact-us',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/contact-site',
        destination: '/contact',
        permanent: true,
      },

      // Life-event guide aliases
      {
        source: '/guides/having-a-baby-in-kenya',
        destination: '/guides/having-a-baby',
        permanent: true,
      },
      {
        source: '/guides/death-registration',
        destination: '/guides/registering-a-death',
        permanent: true,
      },
      {
        source: '/guides/register-a-death',
        destination: '/guides/registering-a-death',
        permanent: true,
      },
      {
        source: '/guides/start-a-business',
        destination: '/guides/starting-a-business',
        permanent: true,
      },
      {
        source: '/how-to',
        destination: '/guides',
        permanent: true,
      },
      {
        source: '/how-to/:path*',
        destination: '/guides/:path*',
        permanent: true,
      },

      // Society shorthand
      {
        source: '/culture',
        destination: '/society-and-culture',
        permanent: true,
      },
      {
        source: '/society',
        destination: '/society-and-culture',
        permanent: true,
      },
      // Placeholder removed until trade/industry expo data is available
      {
        source: '/society-and-culture/national-events/trade-and-industry-expositions',
        destination: '/society-and-culture/national-events#agricultural-and-trade-expositions',
        permanent: true,
      },
      {
        source: '/society-and-culture/national-events/dsw',
        destination: '/society-and-culture/national-events/devolution-sensitisation-week',
        permanent: true,
      },

      // ==========================================
      // CONSTITUTION — legacy flat article paths
      // (only if older crawlers used /constitution/article/N)
      // ==========================================
      {
        source: '/constitution/articles/:article',
        destination: '/constitution',
        permanent: true,
      },
      {
        source: '/constitution/article/:article',
        destination: '/constitution',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

// OpenNext Cloudflare: enable local bindings during `next dev`.
// https://opennext.js.org/cloudflare/get-started
initOpenNextCloudflareForDev();
