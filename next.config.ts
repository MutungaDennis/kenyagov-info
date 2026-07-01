import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 1. Tell Next.js to leave pdfjs-dist alone and resolve it directly from node_modules
  serverExternalPackages: ['pdfjs-dist'],

  sassOptions: {
    quietDeps: true,
    silenceDeprecations: ["import", "if-function", "legacy-js-api"],
    includePaths: [path.join(__dirname, "node_modules")],
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // This maps 'govuk-frontend' directly to the folder containing the assets
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