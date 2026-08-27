import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildRobotsTxt, buildSitemapXml, buildLlmsTxt } from "./scripts/seo-files.mjs";
import { buildStaticBlockHtml, buildCaseBlockHtml } from "./scripts/semantic-blocks.mjs";
import { buildRouteHtml, writeRouteHtml } from "./scripts/route-html.mjs";

// SITE_URL vem só de src/seo.js — index.html carrega o token __SITE_URL__
// (substituído aqui) e robots.txt/sitemap.xml/llms.txt deixaram de existir
// em public/: são gerados no build (dist/) e servidos ao vivo no dev server,
// pra nunca mais divergir da lista real de rotas/projetos/cases.
async function loadSeoContext() {
  const { SITE_URL, CASE_NAMES, getStaticSeo, getCaseSeo } = await import("./src/seo.js");
  const { PROJECTS } = await import("./src/projectsList.js");
  const { CASES } = await import("./src/casesData.js");
  const { FAQS } = await import("./src/faqData.js");
  return { SITE_URL, CASE_NAMES, PROJECTS, CASES, FAQS, getStaticSeo, getCaseSeo };
}

// Rotas estáticas com bloco semântico próprio (etapa 6). "home" escreve por
// cima do próprio dist/index.html — as demais ganham dist/<rota>/index.html.
const STATIC_ROUTE_KEYS = [
  { key: "home", path: "/" },
  { key: "projetos", path: "/projetos" },
  { key: "processo", path: "/meu-processo" },
  { key: "comecar", path: "/comecar" },
];

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
      const { SITE_URL, CASE_NAMES, PROJECTS, CASES, FAQS, getStaticSeo, getCaseSeo } = await loadSeoContext();
      writeFileSync(resolve(outDir, "robots.txt"), buildRobotsTxt(SITE_URL));
      writeFileSync(resolve(outDir, "sitemap.xml"), buildSitemapXml(SITE_URL, PROJECTS));
      writeFileSync(resolve(outDir, "llms.txt"), buildLlmsTxt(SITE_URL, PROJECTS, CASES, CASE_NAMES, FAQS));

      // Etapa 6 — bloco semântico estático por rota (lido a partir de
      // dist/index.html JÁ com __SITE_URL__ substituído pelo transformIndexHtml).
      const template = readFileSync(resolve(outDir, "index.html"), "utf-8");

      for (const { key, path } of STATIC_ROUTE_KEYS) {
        const seo = getStaticSeo(key);
        if (!seo) continue;
        const block = buildStaticBlockHtml({ key, seo, projects: PROJECTS, faqs: FAQS });
        const html = buildRouteHtml(template, { siteUrl: SITE_URL, path, seo, block });
        writeRouteHtml(outDir, path, html);
      }

      for (const p of PROJECTS) {
        const seo = getCaseSeo(p.id);
        const data = CASES[p.id];
        if (!seo || !data) continue;
        const name = CASE_NAMES[p.id] || p.name;
        const block = buildCaseBlockHtml({ name, data, seo });
        const html = buildRouteHtml(template, { siteUrl: SITE_URL, path: seo.path, seo, block });
        writeRouteHtml(outDir, seo.path, html);
      }
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
