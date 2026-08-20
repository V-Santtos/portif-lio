import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("public/previews");
const AUREA_VALIDATION_ROOT = path.resolve("previews/aurea-hero-editavel");
const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
  ".woff2": "font/woff2", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".mp4": "video/mp4",
};

http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]);

  if (p === "/") {
    res.writeHead(302, { Location: "/aurea/index.html" });
    return res.end();
  }

  const isAureaValidation = p.startsWith("/aurea/");
  const root = isAureaValidation ? AUREA_VALIDATION_ROOT : ROOT;
  const relativePath = isAureaValidation ? p.slice("/aurea".length) : p;
  const full = path.resolve(root, `.${relativePath}`);
  const outsideRoot = path.relative(root, full).startsWith("..");
  if (outsideRoot) { res.writeHead(403); return res.end(); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found: " + p); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(full)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(3001, () => console.log("bancada em http://localhost:3001"));
