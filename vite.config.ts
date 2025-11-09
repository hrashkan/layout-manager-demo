import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Get base path from environment or default to repo name
// For GitHub Pages: use '/repository-name/' (with trailing slash)
// For local dev: use '/'
const getBasePath = () => {
  if (process.env.GITHUB_PAGES === "true") {
    // You can override this with REPO_NAME env variable
    const repoName = process.env.REPO_NAME || "layout-manager-demo";
    return `/${repoName}/`;
  }
  return "/";
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
