import { Helmet } from "react-helmet-async";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "./seo.js";

// Injeta o <head> por rota: title, description, canonical, OpenGraph, Twitter
// e schema.org (JSON-LD). Alimentado pela config de seo.js. A imagem OG é a
// mesma da marca em todas as rotas (o texto é que muda por página); passar
// `image` sobrescreve por rota.
//
// `schema`: array opcional de objetos JSON-LD (de seo.js) — cada um vira seu
// próprio <script>. Não inclui o nó Person: esse mora fixo no index.html
// (ver comentário lá) pra não duplicar quando o Helmet monta.
export default function Seo({ title, description, path = "/", image = DEFAULT_OG_IMAGE, schema = [] }) {
  const url = `${SITE_URL}${path}`;
  // schema.org via prop `script` do Helmet (formato oficial pra JSON-LD:
  // array de {type, innerHTML}) — não como JSX children. Testado: children
  // JSX (com ou sem dangerouslySetInnerHTML) é descartado em silêncio nesta
  // versão de react-helmet-async; a prop direta bate no mesmo formato que
  // getTagsFromPropsList espera, sem passar pela conversão de children.
  const scriptTags = schema.map((node) => ({
    type: "application/ld+json",
    innerHTML: JSON.stringify(node),
  }));

  // 🔴 defer={false} é OBRIGATÓRIO — achado em 2026-08-26. Sem isso, o
  // <Seo> NUNCA atualizava title/meta/schema em NENHUMA rota (bug
  // pré-existente, mascarado porque a Home usa o mesmo texto do fallback
  // estático do index.html). Causa: por padrão o Helmet adia o commit no
  // DOM pra um requestAnimationFrame; as rotas (main.jsx) vivem dentro de
  // um único <Suspense> compartilhado com as 4 rotas React.lazy — a troca
  // de rota interrompe/reagenda o render antes do rAF disparar, e o
  // callback adiado nunca aplica o estado certo. defer={false} commita a
  // tag de forma síncrona no commit phase, sem essa corrida. Confirmado em
  // build de produção (`vite preview`), title/schema corretos em /,
  // /projetos e /projetos/hawk-street. Não remover sem re-testar as 3 rotas.
  return (
    <Helmet script={scriptTags} defer={false}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />

      {/* OpenGraph (WhatsApp, Facebook, LinkedIn, etc.) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
