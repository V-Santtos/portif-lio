# Preview 04 - Fervor Hero

Pacote isolado de extração e reconstrução do Hero do site `https://dinevo.framer.website/`.

## Mapa da Pasta

- `index.html` - preview fluido do Hero em português.
- `styles.css` - CSS isolado para aproximar composição, cores, tipografia e camadas visuais.
- `preview.js` - ciclo GSAP local do card de pratos.
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
  - eyebrow adaptado: `Do forno para a mesa,`;
  - título: `Onde a elegância encontra sabor`;
  - apoio: texto curto de restaurante premium;
  - CTA secundário visual: `Explorar menu`.
- A adaptação usa provisoriamente o nome `Fervor`, somente em texto e sem símbolo, até a definição da marca final.
- O fundo da adaptação usa `assets/sora-hero-pizza.jpg`, derivado da fotografia fornecida localmente `ivan-torres-MQUqbmszGGM-unsplash.jpg` e otimizado para 2400 × 1600 px.
- O card branco da direita foi alinhado à referência `Experience Our Signature Dishes`, usando as três fotografias fornecidas para a adaptação Fervor. Elas avançam a cada 3 segundos e o prato ativo amplia levemente no hover.
- A referência original usa prova social com avatares e `10+`; a adaptação Fervor remove esse bloco e alinha o texto de apoio diretamente à esquerda.
- A fonte Anton foi salva localmente em `assets/fonts/anton-latin.woff2` para evitar alternância visual entre fallback e webfont.
- O bloco textual foi reposicionado um pouco mais para baixo para preencher melhor a composição.
- As camadas e cards flutuantes são aproximações visuais do Hero; o ciclo do card de pratos foi reconstruído localmente com GSAP.

## Parcial ou Inferido

- A fonte original parece usar Anton/Inter via Framer. O preview carrega uma fonte pública do próprio Framer e mantém fallback local.
- O ciclo das três fotografias e o hover correspondente foram portados; as demais animações de entrada do Framer continuam fora de escopo.
- A distribuição espacial foi ajustada para funcionar como preview fluido e responsivo.

## Bloqueado ou Não Portado

- Não houve migração do projeto Framer original.
- Não houve integração com o carrossel oficial.
- Não foram trazidas seções abaixo do Hero.

## Próxima Revisão

Validar visualmente o preview isolado antes de decidir se ele entra no carrossel real.
