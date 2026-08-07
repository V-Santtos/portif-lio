// Config central de SEO — fonte única de título/descrição por rota.
// Consumida pelo componente <Seo> (react-helmet-async) em cada página.
import { CASES } from "./casesData.js";

// URL de produção. HOJE é o deploy grátis da Vercel. Quando migrar pro
// domínio próprio, troque SÓ esta linha — propaga pra canonical, og:url,
// sitemap e schema (os arquivos estáticos robots.txt / sitemap.xml / index.html
// têm o domínio hardcoded e estão marcados com comentário pra trocar junto).
export const SITE_URL = "https://portif-lio-three-kohl.vercel.app";
// export const SITE_URL = "https://SEU-DOMINIO.com.br"; // TODO: domínio próprio

export const SITE_NAME = "Victor Cardoso";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

// Nome de exibição por case (o casesData.title é o display gigante — ex. "HAWK").
const CASE_NAMES = {
  "hawk-street": "Hawk Street",
  "minas-tintas": "Minas Tintas",
  "barbearia": "Barbearia",
  "flux-time": "Flux Time",
  "art-piso": "Art Piso",
};

// Rotas estáticas
const STATIC = {
  home: {
    path: "/",
    title: "Victor Cardoso — Páginas que convertem. Sistemas que escalam.",
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
    title: "Vamos conversar — Victor Cardoso",
    description:
      "Conte sua ideia e receba um retorno rápido. Sites, sistemas e automações sob medida para o seu negócio.",
  },
};

export function getStaticSeo(key) {
  return STATIC[key];
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
  };
}
