import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildRobotsTxt, buildSitemapXml, buildLlmsTxt } from "./scripts/seo-files.mjs";

// SITE_URL vem só de src/seo.js — index.html carrega o token __SITE_URL__
// (substituído aqui) e robots.txt/sitemap.xml/llms.txt deixaram de existir
// em public/: são gerados no build (dist/) e servidos ao vivo no dev server,
// pra nunca mais divergir da lista real de rotas/projetos/cases.
async function loadSeoContext() {
  const { SITE_URL, CASE_NAMES } = await import("./src/seo.js");
  const { PROJECTS } = await import("./src/projectsList.js");
  const { CASES } = await import("./src/casesData.js");
  const { FAQS } = await import("./src/faqData.js");
  return { SITE_URL, CASE_NAMES, PROJECTS, CASES, FAQS };
}

function seoFilesPlugin() {
  let outDir = "dist";

  return {
    name: "seo-files",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    transformIndexHtml: {
      order: "pre",
      async handler(html) {
        const { SITE_URL } = await import("./src/seo.js");
        return html.replaceAll("__SITE_URL__", SITE_URL);
      },
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!["/robots.txt", "/sitemap.xml", "/llms.txt"].includes(req.url)) return next();
        const { SITE_URL, CASE_NAMES, PROJECTS, CASES, FAQS } = await loadSeoContext();
        if (req.url === "/robots.txt") {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(buildRobotsTxt(SITE_URL));
        } else if (req.url === "/sitemap.xml") {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(buildSitemapXml(SITE_URL, PROJECTS));
        } else {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(buildLlmsTxt(SITE_URL, PROJECTS, CASES, CASE_NAMES, FAQS));
        }
      });
    },
    async closeBundle() {
      const { SITE_URL, CASE_NAMES, PROJECTS, CASES, FAQS } = await loadSeoContext();
      writeFileSync(resolve(outDir, "robots.txt"), buildRobotsTxt(SITE_URL));
      writeFileSync(resolve(outDir, "sitemap.xml"), buildSitemapXml(SITE_URL, PROJECTS));
      writeFileSync(resolve(outDir, "llms.txt"), buildLlmsTxt(SITE_URL, PROJECTS, CASES, CASE_NAMES, FAQS));
    },
  };
}

export default defineConfig({
  plugins: [react(), seoFilesPlugin()],
  server: {
    host: true,
    port: 3000,
  },
});
