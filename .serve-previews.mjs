import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Ancorado no ARQUIVO, não no CWD: o servidor pode ser lançado da raiz do
// `Site Victor/` (launch.json) ou de dentro do `Victor/` (node .serve-previews.mjs).
// Com `path.resolve` puro, o primeiro caso resolvia pra pasta errada e tudo dava 404.
const AQUI = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(AQUI, "public/previews");
// Bancada em validação (Fase 1 — fluida). Trocar as DUAS linhas ao mudar de
// case: o prefixo da URL e a pasta. `/_shared/` nunca passa por aqui — cai no
// ROOT, então a bancada usa o MESMO gsap.min.js que a cápsula usará na Fase 2.
const VALIDATION_PREFIX = "/mv";
const VALIDATION_ROOT = path.resolve(AQUI, "previews/mv-hero-editavel");
const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
  ".woff2": "font/woff2", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".mp4": "video/mp4",
};

http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]);

  if (p === "/") {
    // Redirect HTTP de VERDADE (302). Nunca reescrever o conteúdo mantendo a
    // URL em `/`: isso quebra todo caminho relativo (./styles.css, assets/…).
    res.writeHead(302, { Location: `${VALIDATION_PREFIX}/index.html` });
    return res.end();
  }

  const isValidation = p.startsWith(`${VALIDATION_PREFIX}/`);
  const root = isValidation ? VALIDATION_ROOT : ROOT;
  const relativePath = isValidation ? p.slice(VALIDATION_PREFIX.length) : p;
  const full = path.resolve(root, `.${relativePath}`);
  const outsideRoot = path.relative(root, full).startsWith("..");
  if (outsideRoot) { res.writeHead(403); return res.end(); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found: " + p); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(full)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(3001, () => console.log("bancada em http://localhost:3001"));
