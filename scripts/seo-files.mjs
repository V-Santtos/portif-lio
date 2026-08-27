// Gerador único de robots.txt e sitemap.xml — usado no build (vite.config.js
// escreve em dist/) e no dev server (middleware serve ao vivo). Não existe
// mais public/robots.txt nem public/sitemap.xml: manter os dois em sincronia
// à mão é o que fazia o sitemap divergir da lista real de projetos.
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Crawlers de IA nomeados explicitamente (GEO). O `Allow: /` genérico já os
// cobria; nomear é declarar intenção pra quem prioriza diretiva nominal.
const AI_CRAWLERS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"];

export function buildRobotsTxt(siteUrl) {
  const blocks = ["User-agent: *\nAllow: /"];
  for (const bot of AI_CRAWLERS) blocks.push(`User-agent: ${bot}\nAllow: /`);
  return `${blocks.join("\n\n")}\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

function lastmodOf(relPath) {
  try {
    return statSync(resolve(ROOT, relPath)).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

// Cada rota aponta pro(s) arquivo(s) que de fato controlam seu conteúdo —
// é daí que sai o lastmod real, não a data do build.
function buildUrlList(projects) {
  const homeSources = ["src/App.jsx", "src/Hero.jsx", "src/Bridge.jsx", "src/Automation.jsx", "src/About.jsx", "src/Contact.jsx"];
  const homeLastmod = homeSources.map(lastmodOf).sort().at(-1);

  const urls = [
    { loc: "/", changefreq: "monthly", priority: "1.0", lastmod: homeLastmod },
    { loc: "/projetos", changefreq: "monthly", priority: "0.9", lastmod: lastmodOf("src/Projetos.jsx") },
    { loc: "/meu-processo", changefreq: "monthly", priority: "0.9", lastmod: lastmodOf("src/Processo.jsx") },
  ];

  // casesData.js é a fonte única de conteúdo de todo case (ver BRIEFING.md).
  const casesLastmod = lastmodOf("src/casesData.js");
  for (const p of projects) {
    urls.push({ loc: `/projetos/${p.id}`, changefreq: "monthly", priority: "0.8", lastmod: casesLastmod });
  }

  urls.push({ loc: "/comecar", changefreq: "yearly", priority: "0.6", lastmod: lastmodOf("src/Comecar.jsx") });
  return urls;
}

export function buildSitemapXml(siteUrl, projects) {
  const urls = buildUrlList(projects);
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${siteUrl}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// llms.txt — a prosa (título, "quem atende", "como contratar") é escrita à
// mão; os blocos de fato (cases, FAQ) são montados a partir de CASES/FAQS
// pra nunca divergir do conteúdo real do site (mesma lógica do sitemap: a
// fonte de verdade é o dado, não uma cópia congelada dele aqui).
export function buildLlmsTxt(siteUrl, projects, cases, caseNames, faqs) {
  const caseBlocks = projects
    .map((p) => {
      const data = cases[p.id];
      if (!data) return null;
      const name = caseNames[p.id] || p.name;
      return `### ${name}\n${data.desc}\n\n**Desafio:** ${data.challenge}\n**Solução:** ${data.solution}\n**Resultado:** ${data.results}\n**Link:** [${name}](${siteUrl}/projetos/${p.id})`;
    })
    .filter(Boolean)
    .join("\n\n");

  const faqBlocks = faqs
    .map((f) => `**${f.question}**\n${f.answers.join(" ")}`)
    .join("\n\n");

  return `# Victor Cardoso

> Sites e sistemas sob medida para pessoas físicas e pequenos e médios negócios. Baseado em Simonésia, MG — atende a região presencialmente e o restante do Brasil remotamente.

## Quem atende

Pessoas físicas (CPF) e pequenos e médios negócios. Não atende grandes empresas — o processo delas é mais burocrático e não é o foco no momento.

## O que faz

### Sistemas sob medida
Ferramentas construídas pra resolver uma dor específica de um negócio: controle de estoque, agendamento, programa de fidelidade, atendimento automatizado. Cada sistema nasce de um problema real, não de um catálogo de features prontas.

### Sites e páginas
Sites institucionais, e-commerce e landing pages de captura, desenhados pra converter. Cada projeto tem identidade visual própria — sem template genérico. [A home do site](${siteUrl}/) também mostra demos interativas de landing pages feitas sob medida, além dos cases completos abaixo.

## Cases

${caseBlocks}

## Perguntas frequentes

${faqBlocks}

## Investimento

Não existe tabela de preço fixa — cada projeto tem escopo diferente. O valor só é definido depois de entender a necessidade, as funcionalidades e a dimensão do que precisa ser construído.

## Como contratar

Formulário: [${siteUrl}/comecar](${siteUrl}/comecar)
WhatsApp: [+55 33 98424-6770](https://wa.me/5533984246770)

## Links

- [Site](${siteUrl}/)
- [Projetos](${siteUrl}/projetos)
- [Processo de trabalho](${siteUrl}/meu-processo)
- [Instagram](https://www.instagram.com/victorcard.s/)
`;
}
