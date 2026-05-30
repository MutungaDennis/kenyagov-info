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
};

export default nextConfig;
