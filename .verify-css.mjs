// .verify-css.mjs — prova que quebrar o styles.css nao mudou o CSS final.
// Uso: node .verify-css.mjs --save   (grava o baseline)
//      node .verify-css.mjs          (compara; exit 1 se divergiu)
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASELINE = ".css-baseline.txt";
const salvar = process.argv.includes("--save");

execSync("npm run build", { stdio: "inherit" });

const dir = "dist/assets";
const arquivo = readdirSync(dir).find((f) => f.endsWith(".css"));
if (!arquivo) {
  console.error("FAIL: nenhum .css em dist/assets");
  process.exit(1);
}

// O hash do nome muda a cada build; o CONTEUDO e o que importa.
const css = readFileSync(join(dir, arquivo), "utf8");
const normalizado = css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .trim();

if (salvar) {
  writeFileSync(BASELINE, normalizado);
  console.log(`baseline salvo: ${normalizado.length} chars (de ${arquivo})`);
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error(`FAIL: ${BASELINE} nao existe. Rode com --save primeiro.`);
  process.exit(1);
}

const base = readFileSync(BASELINE, "utf8");
if (normalizado === base) {
  console.log(`PASS: CSS final identico ao baseline (${base.length} chars)`);
  process.exit(0);
}

console.error(`FAIL: o CSS final MUDOU.`);
console.error(`  baseline: ${base.length} chars`);
console.error(`  agora:    ${normalizado.length} chars`);

// Mostra o primeiro ponto de divergencia com contexto — e onde esta o erro.
let i = 0;
while (i < base.length && i < normalizado.length && base[i] === normalizado[i]) i++;
console.error(`\nprimeira divergencia no char ${i}:`);
console.error(`  baseline: ...${base.slice(Math.max(0, i - 90), i + 90)}...`);
console.error(`  agora:    ...${normalizado.slice(Math.max(0, i - 90), i + 90)}...`);
process.exit(1);
