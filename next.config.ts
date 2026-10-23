import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/findem/traders", destination: "/findem/trading", permanent: true },
      { source: "/findem/dropshippers", destination: "/findem/business", permanent: true },
      { source: "/findem/creators", destination: "/findem/content", permanent: true },
      { source: "/findem/startup-founders", destination: "/findem/business", permanent: true },
      { source: "/findem/founders", destination: "/findem/business", permanent: true },
      { source: "/findem/musicians", destination: "/findem/music", permanent: true },
      { source: "/findem/affiliates", destination: "/findem/marketing", permanent: true },
      { source: "/findem/engineers", destination: "/findem/tech", permanent: true },
      { source: "/findem/developers", destination: "/findem/tech", permanent: true },
    ];
  },
};

export default nextConfig;
