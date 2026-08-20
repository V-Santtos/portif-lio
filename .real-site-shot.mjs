import puppeteer from "puppeteer";
const b = await puppeteer.launch({ headless: "new" });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 966 });
await p.goto("http://localhost:3005/", { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 4000));
await p.screenshot({ path: ".real-site-hero.png" });
const info = await p.evaluate(() => {
  const items = Array.from(document.querySelectorAll("nav a, nav span"));
  const contato = items.find((a) => a.textContent.trim() === "Contato");
  return {
    contatoBox: contato ? contato.getBoundingClientRect() : null,
    texts: items.map((a) => a.textContent.trim()).filter(Boolean),
  };
});
console.log(JSON.stringify(info, null, 2));
await b.close();
