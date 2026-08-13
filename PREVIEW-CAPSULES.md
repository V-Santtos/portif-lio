# Manual operacional — cases reais no carrossel

Este é o procedimento validado para transformar um site, landing page ou DOM já pronto em um preview real do carrossel. A regra permanente e o motivo das decisões estão em [`../Regras/09-carrossel-hero-capsules.md`](../Regras/09-carrossel-hero-capsules.md).

## Resultado esperado

Para Nexous e todos os próximos cases, cada trabalho produz **um único artefato**:

1. **Hero Capsule interativa:** hero real isolado num iframe, com hovers e movimentos confirmados da origem, mas sem navegação.

**Exceção já encerrada:** somente o primeiro EcoScape possui miniatura estática, porque ela participa da transição inicial da seção para o carrossel. Não criar miniatura para Nexous ou qualquer card seguinte.

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
4. Montar o visual do card expandido.
5. Portar somente as interações originais para GSAP.
6. Bloquear navegação e instalar a ponte de wheel.
7. Validar o card expandido no carrossel real.
8. Fazer traduções guiadas sem alterar layout.
9. Otimizar ativos.
10. Validar build e comportamento final.

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
    thumbnail-exact.jpg
    logo.svg
    geist.woff2
    playfair-italic.woff2
    worker.png
    avatar-01.png ...
```

Integração:

- `src/LandingPages.jsx`: primeiro item possui `capsuleSrc`;
- `src/CasePreviewFrame.jsx`: escala e ponte de scroll;
- `src/LandingPreview.jsx`: miniatura EcoScape usa somente `thumbnail-exact.jpg`;
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
