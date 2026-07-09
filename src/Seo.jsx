import { Helmet } from "react-helmet-async";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "./seo.js";

// Injeta o <head> por rota: title, description, canonical, OpenGraph e Twitter.
// Alimentado pela config de seo.js. A imagem OG é a mesma da marca em todas as
// rotas (o texto é que muda por página); passar `image` sobrescreve por rota.
export default function Seo({ title, description, path = "/", image = DEFAULT_OG_IMAGE }) {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
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
