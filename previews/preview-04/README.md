# Preview 04 - Dinevo Hero

Pacote isolado de extração e reconstrução do Hero do site `https://dinevo.framer.website/`.

## Mapa da Pasta

- `index.html` - scaffold HTML estático do Hero em português.
- `styles.css` - CSS isolado para aproximar composição, cores, tipografia e camadas visuais.
- `assets/` - ativos públicos baixados do site de referência.
- `data/hero-summary.json` - resumo estruturado do Hero usado na reconstrução.
- `extraction/raw/dinevo-home.html` - HTML bruto preservado da página de origem.
- `extraction/data/hero-evidence.json` - evidências principais usadas como base.

## Confirmado

- Origem: `https://dinevo.framer.website/`.
- Plataforma da página de origem: Framer.
- Título/meta: `Dinevo - Restaurant, Food & Cafe Framer Template`.
- Navegação confirmada: `Home`, `About Us`, `Menu`, `Pages`, `Contact`.
- CTA confirmado: `BOOK A TABLE`.
- Logo textual confirmado: `Dinevo`.
- Eyebrow original confirmado: `上質な時間を`.
- Título original confirmado: `Where Elegance Meets Flavor`.
- Imagem principal do Hero confirmada: `CfBX6pKWPnpu2mygYIJgwhjE.png`, baixada como `assets/hero-plate.png`.
- Imagens auxiliares confirmadas e baixadas para composição: `dish-small.png`, `chef-small.png`, `chef-portrait.png`, `favicon-mark.png`.
- Cores confirmadas no HTML: fundo creme `rgb(254, 246, 223)`, preto `rgb(0, 0, 0)`, laranja `rgb(233, 66, 34)` e branco.

## Gerado Como Scaffold

- O HTML/CSS deste preview foi reconstruído manualmente para teste isolado.
- A tradução/adaptação em português usa:
  - nav: `Início`, `Sobre`, `Menu`, `Páginas`, `Contato`;
  - CTA: `Reservar mesa`;
  - eyebrow japonês original: `上質な時間を`;
  - título: `Onde a elegância encontra sabor`;
  - apoio: texto curto de restaurante premium;
  - CTA secundário visual: `Explorar menu`.
- O logotipo foi recriado como texto + marca geométrica em CSS, porque o site usa SVG inline no Framer.
- O card branco da direita foi alinhado à referência `Experience Our Signature Dishes`, usando a imagem `signature-dish-b.jpg`.
- A prova social com avatares e `10+` foi recriada como scaffold estático.
- A fonte Anton foi salva localmente em `assets/fonts/anton-latin.woff2` para evitar alternância visual entre fallback e webfont.
- O bloco textual foi reposicionado um pouco mais para baixo para preencher melhor a composição.
- As camadas e cards flutuantes são aproximações visuais do Hero, não uma cópia do runtime original.

## Parcial ou Inferido

- A fonte original parece usar Anton/Inter via Framer. O preview carrega uma fonte pública do próprio Framer e mantém fallback local.
- O comportamento de animação do Framer não foi portado.
- A distribuição espacial foi ajustada para funcionar como preview estático e responsivo.

## Bloqueado ou Não Portado

- Não houve migração do projeto Framer original.
- Não houve integração com o carrossel oficial.
- Não foram trazidas seções abaixo do Hero.

## Próxima Revisão

Validar visualmente o preview isolado antes de decidir se ele entra no carrossel real.
