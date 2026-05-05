import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
