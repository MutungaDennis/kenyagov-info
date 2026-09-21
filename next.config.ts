import type { NextConfig } from "next";
import path from "path";

import withBundleAnalyzer from "@next/bundle-analyzer";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const DEFAULT_PRODUCTION_ADMIN_BASE =
  "/cg-ke-a5wkqciyjpg940u3";

function normalizeAdminBase(value: string): string {
  let base = value.trim();

  if (!base.startsWith("/")) {
    base = `/${base}`;
  }

  base = base.replace(/\/+$/, "");

  return base;
}

/**
 * Resolve the production-only public admin URL.
 *
 * Local development continues using the real /admin route and therefore
 * requires no rewrite.
 */
function getProductionAdminBase(): string | null {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const configured =
    process.env.NEXT_PUBLIC_ADMIN_BASE_PATH?.trim();

  if (!configured) {
    return DEFAULT_PRODUCTION_ADMIN_BASE;
  }

  const normalized = normalizeAdminBase(configured);

  /*
   * Never permit the internal filesystem route to become the public
   * production admin route.
   */
  if (
    normalized === "/admin" ||
    normalized.startsWith("/admin/")
  ) {
    throw new Error(
      "NEXT_PUBLIC_ADMIN_BASE_PATH must not be /admin in production.",
    );
  }

  if (normalized === "/") {
    throw new Error(
      "NEXT_PUBLIC_ADMIN_BASE_PATH must not be the site root.",
    );
  }

  return normalized;
}

const productionAdminBase =
  getProductionAdminBase();

const nextConfig: NextConfig = {
  // Resolve pdfjs-dist from node_modules at runtime.
  serverExternalPackages: ["pdfjs-dist"],

  // ==========================================
  // SUPABASE STORAGE IMAGES
  // ==========================================
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jgejmhskscqxhapscirw.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // ==========================================
  // OPENNEXT/CLOUDFLARE WORKER SIZE
  // ==========================================
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
      "**/node_modules/**/next/dist/compiled/react-dom-experimental/**/*",
      "**/node_modules/**/next/dist/compiled/react-server-dom-webpack-experimental/**/*",
      "**/node_modules/**/next/dist/compiled/react-server-dom-turbopack-experimental/**/*",
      "**/node_modules/**/next/dist/compiled/react-server-dom-turbopack/**/*",
      "**/node_modules/**/next/dist/compiled/babel/**/*",
      "**/node_modules/**/next/dist/compiled/babel-packages/**/*",
      "**/node_modules/**/next/dist/compiled/webpack/**/*",
      "**/node_modules/**/next/dist/compiled/@vercel/og/**/*",
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
      "**/node_modules/lucide-react/**/*",
      "**/node_modules/date-fns/**/*",
      "**/node_modules/zod/**/*",
      "**/scripts/**/*",
      "**/app/_archive/**/*",
    ],
  },

  experimental: {
    optimizePackageImports: [
      "@portabletext/react",
    ],
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "govuk-frontend": path.resolve(
        __dirname,
        "node_modules/govuk-frontend/dist/govuk",
      ),
    };

    return config;
  },

  turbopack: {
    resolveAlias: {
      "govuk-frontend": path.resolve(
        __dirname,
        "node_modules/govuk-frontend/dist/govuk",
      ),
    },
  },

  // ==========================================
  // SECURITY HEADERS
  // ==========================================
  async headers() {
    const rules = [
      {
        source: "/:path*",
        headers: [
          {
            key: "Origin-Agent-Cluster",
            value: "?1",
          },
          {
            key: "Permissions-Policy",
            value: "tools=(self)",
          },
        ],
      },
      {
        /*
         * The internal admin path should not be indexed, even in local or
         * accidental upstream responses. proxy.ts returns 404 for this path
         * in production.
         */
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "private, no-store, no-cache, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "X-Robots-Tag",
            value:
              "noindex, nofollow, noarchive, nosnippet",
          },
          {
            key: "Referrer-Policy",
            value: "same-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];

    if (productionAdminBase) {
      rules.push({
        source: `${productionAdminBase}/:path*`,
        headers: [
          {
            key: "Cache-Control",
            value:
              "private, no-store, no-cache, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "X-Robots-Tag",
            value:
              "noindex, nofollow, noarchive, nosnippet",
          },
          {
            key: "Referrer-Policy",
            value: "same-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      });
    }

    return rules;
  },

  // ==========================================
  // ADMIN ROUTING
  // ==========================================
  async rewrites() {
    /*
     * Request order in production:
     *
     * 1. proxy.ts examines the original public URL.
     * 2. /admin is rejected by proxy.ts.
     * 3. The secret path is authenticated by proxy.ts.
     * 4. This rewrite maps the secret path to app/admin internally.
     *
     * In development no rewrite is needed because /admin is the accepted
     * public development route.
     */
    if (!productionAdminBase) {
      return [];
    }

    return [
      {
        source: productionAdminBase,
        destination: "/admin",
      },
      {
        source: `${productionAdminBase}/:path*`,
        destination: "/admin/:path*",
      },
    ];
  },

  // ==========================================
  // REDIRECTS FOR SEO CONTINUITY
  // ==========================================
  async redirects() {
    return [
      {
        source: "/search/all",
        destination: "/search",
        permanent: true,
      },

      // Government structure
      {
        source: "/executive",
        destination: "/government/presidency",
        permanent: true,
      },
      {
        source: "/executive/:path*",
        destination: "/government/presidency",
        permanent: true,
      },
      {
        source: "/legislature",
        destination: "/government/legislature",
        permanent: true,
      },
      {
        source: "/legislature/:path*",
        destination:
          "/government/legislature/:path*",
        permanent: true,
      },
      {
        source: "/judiciary",
        destination: "/government/judiciary",
        permanent: true,
      },
      {
        source: "/judiciary/:path*",
        destination:
          "/government/judiciary/:path*",
        permanent: true,
      },
      {
        source: "/counties",
        destination: "/government/counties",
        permanent: true,
      },
      {
        source: "/counties/:path*",
        destination:
          "/government/counties/:path*",
        permanent: true,
      },

      // Institutions
      {
        source: "/institutions",
        destination:
          "/government/institutions",
        permanent: true,
      },
      {
        source: "/institutions/:slug",
        destination:
          "/government/institutions/:slug",
        permanent: true,
      },
      {
        source:
          "/institutions/:slug/leadership",
        destination:
          "/government/institutions/:slug",
        permanent: true,
      },
      {
        source: "/institutions/:slug/services",
        destination:
          "/government/institutions/:slug",
        permanent: true,
      },
      {
        source:
          "/institutions/:slug/locations",
        destination:
          "/government/institutions/:slug",
        permanent: true,
      },
      {
        source:
          "/institutions/:slug/publications",
        destination:
          "/government/institutions/:slug",
        permanent: true,
      },
      {
        source: "/institutions/:slug/tenders",
        destination:
          "/government/institutions/:slug",
        permanent: true,
      },
      {
        source: "/institutions/:slug/tools",
        destination:
          "/government/institutions/:slug",
        permanent: true,
      },
      {
        source: "/institutions/:slug/data",
        destination:
          "/government/institutions/:slug",
        permanent: true,
      },

      // Leaders and officials
      {
        source: "/leaders",
        destination: "/government/people",
        permanent: true,
      },
      {
        source: "/leaders/:category/:id",
        destination: "/government/people/:id",
        permanent: true,
      },
      {
        source: "/officials",
        destination: "/government/people",
        permanent: true,
      },
      {
        source: "/officials/:id",
        destination: "/government/people/:id",
        permanent: true,
      },

      // Independent bodies
      {
        source: "/independent-bodies",
        destination:
          "/government/commissions",
        permanent: true,
      },
      {
        source: "/independent-bodies/:slug",
        destination:
          "/government/institutions/:slug",
        permanent: true,
      },

      // Politics to elections
      {
        source: "/politics",
        destination: "/elections",
        permanent: true,
      },
      {
        source: "/politics/general",
        destination:
          "/elections/general-elections",
        permanent: true,
      },
      {
        source: "/politics/by-elections",
        destination: "/elections/by-elections",
        permanent: true,
      },
      {
        source: "/politics/referendums",
        destination: "/elections/referendums",
        permanent: true,
      },
      {
        source:
          "/politics/voter-registration",
        destination:
          "/elections/voter-registration",
        permanent: true,
      },
      {
        source:
          "/politics/political-parties",
        destination:
          "/elections/political-parties",
        permanent: true,
      },
      {
        source:
          "/politics/political-parties/:slug",
        destination:
          "/elections/political-parties/:slug",
        permanent: true,
      },
      {
        source: "/politics/votes/:slug",
        destination: "/elections/results/:slug",
        permanent: true,
      },
      {
        source: "/politics/coalitions",
        destination: "/elections/coalitions",
        permanent: true,
      },
      {
        source:
          "/politics/polling-stations",
        destination:
          "/elections/polling-stations",
        permanent: true,
      },
      {
        source:
          "/politics/polling-stations/:slug",
        destination:
          "/elections/polling-stations/:slug",
        permanent: true,
      },
      {
        source:
          "/politics/registered-voters",
        destination:
          "/elections/registered-voters",
        permanent: true,
      },
      {
        source:
          "/politics/registered-voters/:slug",
        destination:
          "/elections/registered-voters/:slug",
        permanent: true,
      },
      {
        source: "/politics/iebc-offices",
        destination: "/elections/iebc-offices",
        permanent: true,
      },
      {
        source: "/politics/about",
        destination: "/elections/about",
        permanent: true,
      },
      {
        source: "/politics/:path*",
        destination: "/elections/:path*",
        permanent: true,
      },

      // Presidential visits
      {
        source:
          "/executive/presidency/international-visits",
        destination:
          "/government/presidential-visits",
        permanent: true,
      },
      {
        source:
          "/executive/presidency/international-visits/:slug",
        destination:
          "/government/presidential-visits/:slug",
        permanent: true,
      },
      {
        source: "/international-visits",
        destination:
          "/government/presidential-visits",
        permanent: true,
      },
      {
        source: "/international-visits/:slug",
        destination:
          "/government/presidential-visits/:slug",
        permanent: true,
      },

      // Wards
      {
        source: "/counties/wards/:slug",
        destination:
          "/government/counties/wards/:slug/about",
        permanent: true,
      },

      // Government shorthand
      {
        source: "/cabinet",
        destination: "/government/cabinet",
        permanent: true,
      },
      {
        source: "/presidency",
        destination: "/government/presidency",
        permanent: true,
      },
      {
        source: "/commissions",
        destination:
          "/government/commissions",
        permanent: true,
      },
      {
        source: "/people",
        destination: "/government/people",
        permanent: true,
      },
      {
        source: "/people/:slug",
        destination:
          "/government/people/:slug",
        permanent: true,
      },
      {
        source: "/government/officials",
        destination: "/government/people",
        permanent: true,
      },
      {
        source:
          "/government/officials/:slug",
        destination:
          "/government/people/:slug",
        permanent: true,
      },
      {
        source: "/devolution",
        destination:
          "/government/counties/devolution",
        permanent: true,
      },

      // Browse and service discovery
      {
        source: "/browse",
        destination: "/topics",
        permanent: true,
      },
      {
        source: "/browse/:path*",
        destination: "/topics/:path*",
        permanent: true,
      },
      {
        source: "/a-z",
        destination: "/services/a-z",
        permanent: true,
      },
      {
        source: "/services-a-z",
        destination: "/services/a-z",
        permanent: true,
      },
      {
        source: "/popular-services",
        destination: "/services/popular",
        permanent: true,
      },
      {
        source:
          "/services/popular-services",
        destination: "/services/popular",
        permanent: true,
      },

      // Digital government and portals
      {
        source: "/e-citizen",
        destination: "/ecitizen",
        permanent: true,
      },
      {
        source: "/eCitizen",
        destination: "/ecitizen",
        permanent: true,
      },
      {
        source: "/huduma",
        destination: "/huduma-centres",
        permanent: true,
      },
      {
        source: "/huduma-centre",
        destination: "/huduma-centres",
        permanent: true,
      },
      {
        source: "/huduma-centers",
        destination: "/huduma-centres",
        permanent: true,
      },
      {
        source: "/huduma-centres/find",
        destination:
          "/huduma-centres/locations",
        permanent: true,
      },

      // Civic explainers
      {
        source:
          "/how-government-works-in-kenya",
        destination:
          "/how-government-works",
        permanent: true,
      },
      {
        source:
          "/county-vs-national-government",
        destination: "/county-vs-national",
        permanent: true,
      },
      {
        source: "/public-money",
        destination:
          "/how-public-money-works",
        permanent: true,
      },
      {
        source: "/public-finance",
        destination:
          "/how-public-money-works",
        permanent: true,
      },
      {
        source: "/find-representatives",
        destination:
          "/find-your-representatives",
        permanent: true,
      },
      {
        source: "/find-my-representatives",
        destination:
          "/find-your-representatives",
        permanent: true,
      },
      {
        source: "/my-representatives",
        destination:
          "/find-your-representatives",
        permanent: true,
      },
      {
        source: "/contact-gov",
        destination: "/contact-government",
        permanent: true,
      },
      {
        source: "/contact-the-government",
        destination: "/contact-government",
        permanent: true,
      },
      {
        source: "/complaints",
        destination:
          "/complain-about-government",
        permanent: true,
      },
      {
        source: "/complain",
        destination:
          "/complain-about-government",
        permanent: true,
      },
      {
        source: "/ati",
        destination:
          "/access-to-information",
        permanent: true,
      },
      {
        source: "/access-to-info",
        destination:
          "/access-to-information",
        permanent: true,
      },
      {
        source: "/gazette",
        destination: "/kenya-gazette",
        permanent: true,
      },
      {
        source: "/official-notices",
        destination: "/kenya-gazette",
        permanent: true,
      },
      {
        source: "/kenya-gazette-notices",
        destination: "/kenya-gazette",
        permanent: true,
      },
      {
        source: "/scams-and-phishing",
        destination: "/scams",
        permanent: true,
      },
      {
        source: "/fake-websites",
        destination: "/scams",
        permanent: true,
      },
      {
        source: "/emergency",
        destination: "/emergency-and-safety",
        permanent: true,
      },
      {
        source: "/emergencies",
        destination: "/emergency-and-safety",
        permanent: true,
      },

      // Trust and about pages
      {
        source: "/editorial",
        destination: "/editorial-policy",
        permanent: true,
      },
      {
        source: "/style-guide",
        destination: "/content-style-guide",
        permanent: true,
      },
      {
        source: "/writing-style",
        destination: "/content-style-guide",
        permanent: true,
      },
      {
        source: "/corrections-policy",
        destination: "/corrections",
        permanent: true,
      },
      {
        source: "/legal-disclaimer",
        destination: "/disclaimer",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/contact-site",
        destination: "/contact",
        permanent: true,
      },

      // Life-event guides
      {
        source:
          "/guides/having-a-baby-in-kenya",
        destination: "/guides/having-a-baby",
        permanent: true,
      },
      {
        source:
          "/guides/death-registration",
        destination:
          "/guides/registering-a-death",
        permanent: true,
      },
      {
        source: "/guides/register-a-death",
        destination:
          "/guides/registering-a-death",
        permanent: true,
      },
      {
        source: "/guides/start-a-business",
        destination:
          "/guides/starting-a-business",
        permanent: true,
      },
      {
        source: "/how-to",
        destination: "/guides",
        permanent: true,
      },
      {
        source: "/how-to/:path*",
        destination: "/guides/:path*",
        permanent: true,
      },

      // Society and national events
      {
        source: "/culture",
        destination: "/society-and-culture",
        permanent: true,
      },
      {
        source: "/society",
        destination: "/society-and-culture",
        permanent: true,
      },
      {
        source:
          "/national-events/trade-and-industry-expositions",
        destination:
          "/national-events#agricultural-and-trade-expositions",
        permanent: true,
      },
      {
        source: "/national-events/dsw",
        destination:
          "/national-events/devolution-sensitisation-week",
        permanent: true,
      },
      {
        source:
          "/society-and-culture/national-events",
        destination: "/national-events",
        permanent: true,
      },
      {
        source:
          "/society-and-culture/national-events/:path*",
        destination:
          "/national-events/:path*",
        permanent: true,
      },
      {
        source:
          "/society-and-culture/national-symbols",
        destination: "/national-symbols",
        permanent: true,
      },
      {
        source:
          "/society-and-culture/religion-and-faith",
        destination: "/religion-and-faith",
        permanent: true,
      },
      {
        source:
          "/society-and-culture/national-events/trade-and-industry-expositions",
        destination:
          "/national-events#agricultural-and-trade-expositions",
        permanent: true,
      },
      {
        source:
          "/society-and-culture/national-events/dsw",
        destination:
          "/national-events/devolution-sensitisation-week",
        permanent: true,
      },

      // Constitution
      {
        source:
          "/constitution/articles/:article",
        destination:
          "/constitution/article/:article",
        permanent: true,
      },

      // County directories
      {
        source:
          "/government/counties/all",
        destination: "/government/counties",
        permanent: true,
      },
      {
        source:
          "/government/county-assemblies",
        destination:
          "/government/counties/county-assemblies",
        permanent: true,
      },
      {
        source:
          "/government/county-assemblies/:path*",
        destination:
          "/government/counties/county-assemblies/:path*",
        permanent: true,
      },
    ];
  },
};

initOpenNextCloudflareForDev();

export default process.env.ANALYZE === "true"
  ? withBundleAnalyzer({
      enabled: true,
    })(nextConfig)
  : nextConfig;