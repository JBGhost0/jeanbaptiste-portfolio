import type { NextConfig } from "next";

const repo = "jeanbaptiste-portfolio";
// Sous-dossier uniquement sur GitHub Pages (https://JBGhost0.github.io/jeanbaptiste-portfolio/)
const onPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: onPages ? `/${repo}` : "",
  assetPrefix: onPages ? `/${repo}/` : "",
};

export default nextConfig;