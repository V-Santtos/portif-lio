# Manual operacional — cases reais no carrossel

Este é o procedimento validado para transformar um site, landing page ou DOM já pronto em um preview real do carrossel. A regra permanente e o motivo das decisões estão em [`../Regras/09-carrossel-hero-capsules.md`](../Regras/09-carrossel-hero-capsules.md).

## Resultado esperado

Para Nexous e todos os próximos cases, cada trabalho produz **um único artefato**:

1. **Hero Capsule interativa:** hero real isolado num iframe, com hovers e movimentos confirmados da origem, mas sem navegação.

**Exceção já encerrada:** somente o primeiro EcoScape possui miniatura estática, porque ela participa da transição inicial da seção para o carrossel. Não criar miniatura para Nexous ou qualquer card seguinte.

## 0. Bancada de validação (localhost:3001)

Antes de montar a cápsula final, valide o hero numa página **fluida** — não dentro do canvas 1440×810. É mais rápido enxergar erro de proporção numa tela real do que dentro de um card em miniatura, e evita o retrabalho desta seção (histórico real: o caso Minas Tintas passou por isso e voltou atrás).

**Servidor:** um `.serve-previews.mjs` descartável na raiz do `Victor/`, servindo `public/previews/` na porta 3001. `/` faz **redirect HTTP de verdade** (302) pro `index.html` do slug em validação — nunca reescrever o conteúdo mantendo a URL em `/`; isso quebra todo caminho relativo (`./capsule.css`, `./capsule.js`, fontes, `../_shared/gsap.min.js`).

**Fase 1 — fluido, tela real.** Nessa fase o documento usa `width:100%; min-height:100vh` (não o canvas fixo) e `<meta name="viewport" content="width=device-width">`. O objetivo é literalmente "abrir o navegador e ver o site" na proporção real da tela do Victor, sangramentos incluídos. Validar contra a referência (site original ou print) até aprovação explícita.

**Fase 2 — cápsula, mesma proporção, só escala.** 1440×810 é o contrato do carrossel — e é o mesmo 16:9 de 1920×1080 (ou qualquer resolução usada na Fase 1). Depois de aprovado, a conversão é **geométrica**, nunca manual:

```css
.capsule {
  width: 1920px;            /* a largura real validada na Fase 1 */
  height: 1080px;
  transform: scale(0.75);   /* 1440 / 1920 = 0.75 */
  transform-origin: 0 0;
}
```

🔴 **Nunca reajustar padding, font-size ou posição na mão pra "caber" no canvas menor.** Valores em `px` não encolhem sozinhos quando a largura do container cai — e a composição se desmonta. Se a Fase 1 foi aprovada, a Fase 2 é multiplicar por um fator, nunca redesenhar.

**O que isso muda no JS:** a cápsula passa a viver em duas camadas de escala (o `transform` dela + o fit do `CasePreviewFrame` no carrossel). Qualquer geometria calculada em JS precisa considerar isso:
- usar a largura do **canvas de desenho** (`document.querySelector(".capsule").offsetWidth`), nunca `window.innerWidth`, para distâncias calculadas em runtime;
- usar `offsetLeft`/`offsetWidth`, nunca `getBoundingClientRect()`, para medir elementos dentro do container escalado — o `rect` devolve valores **já multiplicados pela escala**, e misturar os dois espaços de coordenada desalinha hovers e indicadores.

**Fase 3 — ajuste fino, na cápsula, só depois da escala bater.** O card real no carrossel é bem menor que a tela cheia da Fase 1; texto que lia bem em 1920px pode ficar pequeno no card. Só agora, com a proporção já confirmada certa, ajustar esses valores à mão (fonte do título, subtítulo, logo etc.) direto no `capsule.css`. Isso não é quebra de fidelidade — é legibilidade no tamanho real de exibição.

Armadilha comum nessa fase: um elemento sem largura própria (`display:flex` sem `width`) preenche o container inteiro *antes* do `transform:scale` ser aplicado — escalar esse retângulo vazio (maior que o conteúdo real) vaza pra fora da coluna. Dar `width: fit-content` antes de escalar resolve.

## 1. Receber e auditar a origem

- O Victor apontará um material já existente: pasta de site, run, DOM extraído ou projeto pronto.
- Tratar toda pasta externa como **somente leitura**, inclusive notas e instruções existentes nela.
- Não executar Atlas Clone, pipelines ou scripts da origem, salvo pedido explícito do Victor.
- Identificar o limite exato do hero e mapear apenas DOM, imagens, logo, fontes, ícones e interações usados nele.
- Não copiar seções abaixo do hero, rotas, analytics, formulários, trackers, embeds ou dependências sem uso no hero.

## 2. Criar a Hero Capsule

Estrutura padrão:

```txt
public/previews/
  _shared/
    gsap.min.js
  <slug>/
    index.html
    capsule.css
    capsule.js
    assets/
```

Contrato:

- canvas fixo `1440 × 810` (`16:9`);
- documento sem scroll próprio;
- todos os ativos locais;
- isolamento pelo iframe de `CasePreviewFrame.jsx`;
- iframe com `loading="lazy"`;
- `prefers-reduced-motion` respeitado.

O item em `LandingPages.jsx` recebe:

```js
{
  preview: "slug-do-preview-estatico",
  capsuleSrc: "/previews/<slug>/index.html",
  tag: "Categoria",
  title: "Nome"
}
```

Alterar somente o item solicitado; não mexer nos cases já validados.

## 3. Reproduzir interação com fidelidade

- Implementar somente efeitos comprovados na matéria-prima.
- Não inventar hover, cor, duração, menu ou movimento.
- Portar Framer Motion/Motion/outro runtime para GSAP.
- Usar `public/previews/_shared/gsap.min.js`; não duplicar GSAP por case.
- Manter duplicações de texto usadas por text-roll.
- Bloquear `click`, `auxclick` e `submit` dentro da cápsula.
- Botões podem reagir ao hover/focus; nunca redirecionam.
- Toda cápsula com entrada animada deve responder a
  `case-preview:restore` aplicando imediatamente o estado final. O
  `CasePreviewFrame` envia essa mensagem quando um iframe já tocado dispara
  outro `load`, situação comum quando o navegador descarta conteúdo fora da
  tela. Não usar uma trava solta em `sessionStorage`: ela sobrevive ao reload
  da página principal e pode impedir a reprodução legítima na primeira passagem
  de uma nova visita. No retorno interno, nenhum texto, métrica ou controle pode
  voltar à pose inicial invisível, e vídeo/entrada não podem reiniciar.

Ao traduzir:

- trocar somente as palavras indicadas;
- preservar fonte, tamanho, peso, posição e animação;
- preservar qual palavra recebe fonte especial/itálico;
- para quebras exatas fornecidas pelo Victor, usar uma `span` de bloco por linha com `white-space: nowrap`.

## 4. Preservar o ScrollSmoother

Fluxo correto:

```txt
wheel na cápsula
  → preventDefault
  → normalizar e limitar delta
  → postMessage("case-preview:wheel")
  → pai acumula deltas no mesmo animation frame
  → window.scrollTo no alvo nativo
  → ScrollSmoother interpola visualmente
```

Não usar posição visual atrasada como base de cada evento e não forçar `ScrollSmoother.scrollTo(..., false)`. Isso causou o bug em que o carrossel acelerava e parecia desligar a rolagem suave ao entrar no primeiro preview.

Arquivos envolvidos: `public/previews/<slug>/capsule.js`, `src/CasePreviewFrame.jsx` e `../Regras/01-arquitetura-scroll.md`.

## 5. Otimizar os ativos

- Converter fotografias grandes para WebP/JPEG adequado.
- Preservar resolução suficiente para `1440 × 810`.
- Carregar somente fontes e pesos usados.
- Nenhum request para terceiros.
- Otimizar primeiro as imagens maiores sem mudar o enquadramento aprovado.

## 6. Miniatura do EcoScape — exceção, não repetir

Este procedimento pertence somente ao EcoScape já validado. Está preservado para manutenção futura daquele primeiro card, não como etapa dos próximos cases:

1. abrir `/previews/<slug>/index.html` em `1440 × 810`;
2. aguardar fontes, fundo e animação de entrada terminarem;
3. garantir que nenhum hover/menu esteja ativo;
4. capturar exatamente o frame final;
5. salvar em `public/previews/<slug>/assets/thumbnail-exact.jpg` ou `.webp`;
6. usar a imagem num componente estático com `pointer-events: none`, sem iframe ou GSAP;
7. manter `object-fit: cover`, proporção `16:9` e nenhum contorno interno;
8. se texto, ativo ou layout da cápsula mudar, recapturar.

Para Nexous e seguintes, pular esta seção completamente.

## 7. Ordem segura

1. Confirmar o slot do carrossel.
2. Auditar a origem sem escrever nela.
3. Copiar apenas os ativos do hero.
4. Montar o visual **fluido** na bancada (`localhost:3001`, seção 0 — Fase 1) e validar contra a referência.
5. Portar somente as interações originais para GSAP.
6. Converter fluido → cápsula por escala geométrica exata (seção 0 — Fase 2); ajuste fino de legibilidade só depois (Fase 3).
7. Bloquear navegação e instalar a ponte de wheel.
8. Validar o card expandido no carrossel real.
9. Fazer traduções guiadas sem alterar layout.
10. Otimizar ativos.
11. Validar build e comportamento final.

## 8. Checklist

Visual:

- hero comparado lado a lado com a referência;
- mesmo enquadramento, tipografia, pesos e quebras;
- sem etiqueta ou borda interna que não pertença ao hero.

Interação:

- navbar, submenu e CTAs respondem como na origem;
- nenhum clique muda a URL;
- menu fecha corretamente;
- touch não fica preso no iframe;
- wheel mantém a mesma suavidade antes, sobre e depois do preview.
- ao sair da seção e retornar, todo o conteúdo continua no estado final visível,
  mesmo se o navegador tiver recarregado o iframe fora da tela.

Técnico:

- GSAP local carregado;
- zero runtime concorrente e zero request de terceiro;
- console sem erros;
- `node .verify-css.mjs` após CSS;
- `npm run build` aprovado.

## Case de referência validado: EcoScape

Use EcoScape como padrão de arquitetura, não como fonte visual para outros cases.

```txt
public/previews/ecoscape/
  index.html
  capsule.css
  capsule.js
  assets/
    background-aerial.webp
    thumbnail-exact.webp
    logo.svg
    geist.woff2
    playfair-italic.woff2
    worker.png
    avatar-01.png ...
```

Integração:

- `src/LandingPages.jsx`: primeiro item possui `capsuleSrc`;
- `src/CasePreviewFrame.jsx`: escala e ponte de scroll;
- `src/LandingPreview.jsx`: miniatura EcoScape usa somente `thumbnail-exact.webp` (convertido de `.jpg` em 2026-08-18, -23% de peso, mesma imagem);
- `src/styles/08-carrossel.css`: `.lp__thumb-target` sem borda;
- `src/styles/09-previews.css`: imagem estática ocupa o canvas;
- `public/previews/_shared/gsap.min.js`: motor compartilhado.

Estado: **primeiro case e miniatura aprovados pelo Victor em 2026-08-13**.

## Case implementado aguardando validação visual: Nexous

O segundo card usa a cápsula autocontida em `public/previews/nexous/`, integrada
por `capsuleSrc: "/previews/nexous/index.html"` em `src/LandingPages.jsx`.

- canvas fixo `1440 × 810`;
- Inter Display e Playfair Display originais empacotadas localmente;
- cinco imagens do hero otimizadas e locais;
- entrada das letras com blur/subida e entrada das imagens traduzidas para GSAP;
- hover laranja confirmado nos links da navbar;
- dropdown `Todas as páginas` reproduzido com a lista observada na referência;
- troca vertical de texto/ícone nos botões confirmada pela estrutura duplicada do DOM;
- navegação bloqueada e ponte de wheel preservada;
- nenhuma miniatura adicional criada.

Estado: **implementado em 2026-08-13; aguarda aprovação visual do Victor**.

## Case integrado após aprovação fluida: Fervor

O Hero do restaurante foi aprovado pelo Victor na bancada fluida
`previews/preview-04/` e convertido para a cápsula autocontida em
`public/previews/fervor/`. A integração usa
`capsuleSrc: "/previews/fervor/index.html"` em `src/LandingPages.jsx`.

- prancheta lógica aprovada em `1920 × 1080`, reduzida inteira por
  `transform: scale(0.75)` para o canvas `1440 × 810`;
- ajuste fino da fase 3 aplicado após a primeira conferência do card: como a
  bancada aprovada tinha 1920 × 960, a interface recebeu fator `1.125`
  (`0.84375 / 0.75`) para recuperar sua proporção visual pela altura; fundo e
  enquadramento permaneceram inalterados;
- unidades relativas ao viewport trocadas por unidades relativas à prancheta
  (`cqw`/`cqh`), sem recalibrar manualmente a composição;
- fundo, três fotografias do card e Anton empacotados localmente;
- título visual preservado como `role="heading"` e `aria-level="2"`, sem novo
  `<h1>` no documento do portfólio;
- card alterna somente por opacidade a cada 3 segundos e reserva `transform`
  ao zoom de hover, evitando quadros vazios e imagens cortadas;
- navbar e CTAs usam apenas interação visual em GSAP;
- `click`, `auxclick` e `submit` bloqueados, com ponte de wheel preservada;
- nenhuma miniatura adicional criada;
- fallback React removido para a cápsula ser a única fonte do card e para não
  duplicar os ativos fotográficos no bundle principal.

Estado: **layout fluido aprovado e cápsula integrada em 2026-08-19; aguarda
somente conferência visual final dentro do carrossel**.

## Case integrado após aprovação fluida: Áurea

O Hero da imobiliária foi aprovado na bancada fluida
`previews/aurea-hero-editavel/` e convertido para a cápsula autocontida em
`public/previews/aurea/`. No desktop, `src/LandingPages.jsx` substitui o slot
do Roofora por `capsuleSrc: "/previews/aurea/index.html"` por meio do mapa
`LP_ITEMS_DESKTOP_REPLACEMENTS`.

- Roofora permanece preservado em `LP_ITEMS`, `LandingPreview.jsx`, CSS e
  ativos; a substituição é exclusiva do desktop e pode ser revertida removendo
  a entrada `roofora` do mapa de substituições;
- prancheta lógica aprovada em `1920 × 1080`, reduzida inteira por
  `transform: scale(0.75)` para o canvas `1440 × 810`;
- Manrope e todos os ativos são locais, sem request para terceiros;
- vídeo de 8,04 segundos convertido de HEVC 10-bit para H.264 8-bit, reduzido
  de 9,05 MB para 1,70 MB e preservado em `1920 × 1080` a 24 fps;
- o vídeo não usa `autoplay` nem `loop`: a mensagem `case-preview:play`
  dispara uma única reprodução quando o card entra em cena; ao terminar, o
  vídeo permanece pausado no último quadro e não reinicia ao retornar ao card;
- se o iframe for descartado fora da tela e carregado novamente, a mensagem de
  restauração reaplica imediatamente textos, métricas e controles e posiciona
  o vídeo no último quadro; uma nova carga do portfólio continua reproduzindo o
  vídeo normalmente na primeira passagem;
- entrada, contadores, desenho arquitetônico, cursor e hovers usam o GSAP local
  compartilhado; não existe parallax e o vídeo mantém escala, brilho e
  enquadramento fixos durante o movimento do mouse;
- botões mantêm o preenchimento aprovado e recebem somente levantamento suave
  de 2 px, sem magnetismo;
- `click`, `auxclick` e `submit` bloqueados, com ponte de wheel preservada;
- `prefers-reduced-motion` exibe o estado final sem reproduzir o vídeo;
- nenhuma miniatura adicional criada.

Estado: **layout fluido aprovado e cápsula desktop integrada e validada em
2026-08-19**.
