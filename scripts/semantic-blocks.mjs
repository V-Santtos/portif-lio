// Bloco semântico estático por rota — H1/parágrafos/links reais, montado a
// partir dos MESMOS dados que alimentam schema.org e llms.txt (STATIC/CASES
// em src/seo.js e src/casesData.js). Injetado em dist/<rota>/index.html pelo
// plugin em vite.config.js (etapa 6 do plano SEO/GEO): hoje um crawler sem JS
// só vê <div id="root"></div> vazio. Ver
// docs/superpowers/specs/2026-08-26-seo-geo-retomada.md §3.1.
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function navHtml() {
  return `<nav>
<a href="/">Início</a>
<a href="/projetos">Projetos</a>
<a href="/meu-processo">Meu processo</a>
<a href="/comecar">Vamos começar</a>
</nav>`;
}

function faqSectionHtml(faqs) {
  const items = faqs
    .map((f) => `<div><h3>${esc(f.question)}</h3><p>${esc(f.answers.join(" "))}</p></div>`)
    .join("\n");
  return `<section>
<h2>Perguntas frequentes</h2>
${items}
</section>`;
}

function projectsListHtml(projects) {
  return `<ul>
${projects.map((p) => `<li><a href="${p.href}">${esc(p.name)}</a></li>`).join("\n")}
</ul>`;
}

export function buildStaticBlockHtml({ key, seo, projects, faqs }) {
  if (key === "home") {
    return `${navHtml()}
<main>
<h1>${esc(seo.title)}</h1>
<p>${esc(seo.description)}</p>
<section>
<h2>Projetos</h2>
${projectsListHtml(projects)}
</section>
${faqSectionHtml(faqs)}
</main>`;
  }
  if (key === "projetos") {
    return `${navHtml()}
<main>
<h1>${esc(seo.title)}</h1>
<p>${esc(seo.description)}</p>
${projectsListHtml(projects)}
</main>`;
  }
  return `${navHtml()}
<main>
<h1>${esc(seo.title)}</h1>
<p>${esc(seo.description)}</p>
</main>`;
}

export function buildCaseBlockHtml({ name, data, seo }) {
  return `${navHtml()}
<main>
<h1>${esc(name)}</h1>
<p>${esc(seo.description)}</p>
<section><h2>Desafio</h2><p>${esc(data.challenge)}</p></section>
<section><h2>Solução</h2><p>${esc(data.solution)}</p></section>
<section><h2>Resultado</h2><p>${esc(data.results)}</p></section>
<p><a href="/projetos">Ver todos os projetos</a></p>
</main>`;
}
