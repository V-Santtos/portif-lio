/**
 * Conversao PNG (com alpha) -> WebP via canvas do Chromium headless.
 * Sem dependencia nova (sharp/cwebp indisponiveis no ambiente): reusa o
 * puppeteer que ja e devDependency do projeto.
 * Uso: node .convert-webp.mjs <entrada.png> <saida.webp> [qualidade=0.85]
 */
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const [, , input, output, qualityArg] = process.argv;
if (!input || !output) {
  console.error("uso: node .convert-webp.mjs <entrada> <saida> [qualidade]");
  process.exit(1);
}
const quality = Number(qualityArg ?? 0.85);

const buf = fs.readFileSync(path.resolve(input));
const b64 = buf.toString("base64");

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setContent("<img id=i>");
const dataUrl = await page.evaluate(async (b64, quality) => {
  const img = document.getElementById("i");
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = "data:image/png;base64," + b64;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d").drawImage(img, 0, 0);
  return canvas.toDataURL("image/webp", quality);
}, b64, quality);

const outBuf = Buffer.from(dataUrl.split(",")[1], "base64");
fs.writeFileSync(path.resolve(output), outBuf);
console.log(`ok: ${input} (${buf.length}b) -> ${output} (${outBuf.length}b)`);
await browser.close();
