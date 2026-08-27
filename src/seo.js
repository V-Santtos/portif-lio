// Config central de SEO — fonte única de título/descrição/schema por rota.
// Consumida pelo componente <Seo> (react-helmet-async) em cada página.
import { CASES } from "./casesData.js";
import { FAQS } from "./faqData.js";

// URL de produção — ÚNICA fonte de verdade (vite.config.js). index.html
// recebe o valor via token __SITE_URL__ substituído no build; robots.txt,
// sitemap.xml e llms.txt são gerados a partir daqui (ver scripts/seo-files.mjs)
// — não existem mais como arquivo estático em public/. Trocar SÓ esta linha
// propaga pra tudo.
//
// Domínio no ar desde 2026-08-26: www.victorcardos.com.br (com "www" — o
// apex victorcardos.com.br redireciona pra cá, confirmado ao vivo). Etapa 1b
// do plano de SEO/GEO (docs/superpowers/specs/2026-08-26-...) concluída aqui;
// falta só commitar/publicar pra isso valer no site de verdade.
export const SITE_URL = "https://www.victorcardos.com.br";
// export const SITE_URL = "https://portif-lio-three-kohl.vercel.app"; // domínio antigo, fallback se precisar reverter

export const SITE_NAME = "Victor Cardoso";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

// Nome de exibição por case (o casesData.title é o display gigante — ex. "HAWK").
// Exportado: também usado por scripts/seo-files.mjs pra gerar o llms.txt.
export const CASE_NAMES = {
  "hawk-street": "Hawk Street",
  "minas-tintas": "Minas Tintas",
  "barbearia": "Barbearia",
  "flux-time": "Flux Time",
  "art-piso": "Art Piso",
};

// ---------------------------------------------------------------------------
// Schema.org (JSON-LD) — grafo único amarrado por @id.
//
// O nó Person mora só no index.html (fallback estático, presente em toda
// rota da SPA) e NÃO é reemitido aqui — senão duplicaria quando o React
// monta (o Helmet não remove script sem data-rh, só meta/title/link, ver
// comentário em index.html). Os schemas daqui referenciam Person por @id.
//
// Vocabulário aqui é livre do veto de Regras/06 (que é sobre COPY VISÍVEL):
// JSON-LD não aparece pra quem lê a página, só pra crawler/parser. É
// exatamente a "camada 2" descrita no plano de SEO/GEO (§8.1) — termos de
// busca que não cabem na voz do site entram aqui.
// ---------------------------------------------------------------------------
const PERSON_ID = `${SITE_URL}/#person`;
const BUSINESS_ID = `${SITE_URL}/#business`;

export function buildProfessionalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": BUSINESS_ID,
    name: SITE_NAME,
    url: SITE_URL,
    image: DEFAULT_OG_IMAGE,
    description:
      "Desenvolvimento de sites, landing pages e sistemas sob medida para pessoas físicas e pequenos e médios negócios. Sites institucionais, e-commerce, automação de atendimento e processos, e ferramentas personalizadas — controle de estoque, agendamento, programas de fidelidade.",
    // Base em Simonésia/MG (confirmado pelo Victor, 2026-08-26). CEP
    // 36930-000 — o Victor passou "3630000" (7 dígitos, incompleto);
    // confirmado o valor certo por busca (CEP geral do município).
    address: {
      "@type": "PostalAddress",
      addressLocality: "Simonésia",
      addressRegion: "MG",
      postalCode: "36930-000",
      addressCountry: "BR",
    },
    // Atende presencial na região e remoto pro resto do país — por isso
    // cidade (local) + estado (regional), não só um dos dois.
    areaServed: [
      { "@type": "City", name: "Simonésia" },
      { "@type": "State", name: "Minas Gerais" },
    ],
    // Sem priceRange: a única faixa observada (R$800–1.500) vem de uma
    // proposta específica (Documentos/Mentoria/), não é tabela pública do
    // Victor — apresentar como preço geral seria inventar um dado.
    serviceType: [
      "Criação de sites institucionais",
      "Landing pages para conversão",
      "E-commerce sob medida",
      "Sistemas de controle de estoque",
      "Sistemas de agendamento",
      "Programas de fidelidade",
      "Automação de atendimento via WhatsApp",
    ],
    telephone: "+5533984246770",
    founder: { "@id": PERSON_ID },
  };
}

export function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answers.join(" "),
      },
    })),
  };
}

function extractYear(tags) {
  return tags?.find((t) => /^\d{4}$/.test(t)) ?? null;
}

function buildCreativeWorkSchema(slug, name, data) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    url: `${SITE_URL}/projetos/${slug}`,
    description: data.desc,
    keywords: data.tags?.join(", "),
    dateCreated: extractYear(data.tags),
    creator: { "@id": PERSON_ID },
  };
}

function buildBreadcrumbSchema(slug, name) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Projetos", item: `${SITE_URL}/projetos` },
      { "@type": "ListItem", position: 3, name, item: `${SITE_URL}/projetos/${slug}` },
    ],
  };
}

// Rotas estáticas
const STATIC = {
  home: {
    path: "/",
    title: "Victor Cardoso — Sites que convertem. Sistemas que escalam",
    description:
      "Páginas de captura e automações para negócios que querem crescer. Sites e sistemas sob medida, feitos para converter.",
  },
  projetos: {
    path: "/projetos",
    title: "Projetos — Victor Cardoso",
    description:
      "Seleção de projetos sob medida — landing pages, e-commerce, sistemas e apps. Cada um pensado para converter e escalar.",
  },
  processo: {
    path: "/meu-processo",
    title: "Meu processo — Victor Cardoso",
    description:
      "Conheça o processo por trás de sites e sistemas sob medida — da estratégia e da mensagem ao lançamento e ao suporte.",
  },
  comecar: {
    path: "/comecar",
    title: "Vamos começar — Victor Cardoso",
    description:
      "Conte sua ideia e receba um retorno rápido. Sites, sistemas e automações sob medida para o seu negócio.",
  },
};

export function getStaticSeo(key) {
  const base = STATIC[key];
  if (!base) return base;
  // Só a home carrega ProfessionalService + FAQPage — são schemas do
  // negócio como um todo, não fazem sentido em /projetos, /meu-processo etc.
  if (key === "home") {
    return { ...base, schema: [buildProfessionalServiceSchema(), buildFaqSchema()] };
  }
  return base;
}

// SEO de um case: título = nome do projeto; descrição = a própria desc do case.
export function getCaseSeo(slug) {
  const data = CASES[slug];
  if (!data) return null;
  const name = CASE_NAMES[slug] || slug;
  return {
    path: `/projetos/${slug}`,
    title: `${name} — ${SITE_NAME}`,
    description: data.desc,
    schema: [buildCreativeWorkSchema(slug, name, data), buildBreadcrumbSchema(slug, name)],
  };
}
