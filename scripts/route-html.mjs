// Injeta meta tags e bloco semântico específicos de uma rota no shell
// dist/index.html, e escreve o resultado em dist/<rota>/index.html — etapa 6
// do plano SEO/GEO (ver docs/superpowers/specs/2026-08-26-seo-geo-retomada.md
// §3.1). Tags marcadas com data-rh="true" seguem a mesma convenção do
// index.html original: o Helmet reconhece e substitui sem duplicar quando o
// React monta (usuário real nunca vê este HTML estático).
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function escAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escText(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function setTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${escText(title)}</title>`);
}

function setMetaContent(html, key, value) {
  const re = new RegExp(`(<meta[^>]*(?:name|property)="${key}"[^>]*content=")[^"]*(")`);
  return html.replace(re, (_m, before, after) => `${before}${escAttr(value)}${after}`);
}

function setCanonical(html, href) {
  return html.replace(/(<link rel="canonical"[^>]*href=")[^"]*(")/, (_m, before, after) => `${before}${escAttr(href)}${after}`);
}

function appendSchemas(html, schemas) {
  if (!schemas?.length) return html;
  const scripts = schemas
    .map((s) => `<script type="application/ld+json" data-rh="true">${JSON.stringify(s).replace(/</g, "\\u003c")}</script>`)
    .join("\n");
  return html.replace("</head>", `${scripts}\n</head>`);
}

function injectRootBlock(html, block) {
  return html.replace('<div id="root"></div>', `<div id="root">${block}</div>`);
}

// seo: { title, description, schema? } — o mesmo shape de getStaticSeo/getCaseSeo.
export function buildRouteHtml(template, { siteUrl, path, seo, block }) {
  const url = `${siteUrl}${path}`;
  let html = template;
  html = setTitle(html, seo.title);
  html = setMetaContent(html, "description", seo.description);
  html = setCanonical(html, url);
  html = setMetaContent(html, "og:title", seo.title);
  html = setMetaContent(html, "og:description", seo.description);
  html = setMetaContent(html, "og:url", url);
  html = setMetaContent(html, "twitter:title", seo.title);
  html = setMetaContent(html, "twitter:description", seo.description);
  html = appendSchemas(html, seo.schema);
  html = injectRootBlock(html, block);
  return html;
}

export function writeRouteHtml(outDir, path, html) {
  const dir = path === "/" ? outDir : resolve(outDir, path.replace(/^\//, ""));
  if (path !== "/") mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), html);
}
