# BRIEFING — Portfolio Pessoal (Victor Cardoso)

> Documento de direção geral do portfólio. Reflete o **estado atual real** do projeto.
> Detalhe fino de implementação e estado de trabalho ficam no `CONTEXTO.md`.

## Visão Geral

Portfolio pessoal de alto impacto visual, white/clean/minimalista com detalhes em preto e **laranja** como cor de destaque. É um **portfolio de serviços para clientes** (quem precisa de uma página que converte ou quer automatizar o negócio) — não um portfolio de dev para recrutadores. O tom de todas as seções fala direto com quem tem uma dor, não com pares técnicos.

Referência de estilo: **Bogdan Kolomiyets** (bogdankolomiyets.com) — fundo creme quente, tipografia display condensada, transições de página.

---

## Stack Tecnológica

| Item | Detalhe |
|---|---|
| Build | **Vite 6** |
| UI | **React 18** |
| Roteamento | **react-router-dom v7** (`BrowserRouter + Routes`) — site multi-rotas |
| Animação scroll | **GSAP + ScrollTrigger** |
| Layout/transform | **GSAP Flip** (expansão do carrossel) |
| Efeitos de texto | **GSAP SplitText** |
| Estilização | **CSS puro** (`styles.css` com tokens em `:root`) |

> **Sem Next.js, sem Tailwind, sem Framer Motion, sem Lenis.** Toda animação é GSAP; todo estilo é CSS puro. Decisão consolidada — não reintroduzir essas dependências sem motivo claro.

Projeto oficial em `Site Victor/Victor/`. Servidor: `http://localhost:3000`.

---

## Identidade Visual

### Paleta

| Token | HEX | Uso |
|---|---|---|
| `--color-surface` | `#FEF8E8` | Fundo das seções claras — creme quente |
| `--color-dark` | `#1b1a18` | Fundo das seções escuras (PreHero, Automation) — escuro quente |
| `--color-foreground` | `#161616` | Texto principal |
| `--color-muted-foreground` | `#A8AAAC` | Texto secundário |
| `--color-border` | `#E4E2E3` | Bordas e divisores |
| `--color-accent` | `#F44A22` | Cor principal de destaque |
| `--color-accent-to` | `#FF6B35` | Fim do gradiente de accent |

```css
--gradient-accent: linear-gradient(135deg, #F44A22, #FF6B35);
```

> **Sem branco puro** nos fundos — só creme (`--color-surface`) e escuro quente (`--color-dark`). Sem grain nas seções (exceto efeito pontual em previews). Gradiente accent apenas em CTAs/destaques (no máx. ~2 usos visíveis por tela).

### Tipografia

| Token | Fonte | Uso |
|---|---|---|
| `--font-display` | **Bebas Neue** (fallback Anton) | Títulos do Hero e de seção, display condensado grande |
| `--font-body` | **Inter** | Subtítulos, body, labels, captions |

> Fonte local **Anton** (`@font-face "Anton Preview"`) usada só dentro do preview Dinevo do carrossel.

### Estilo geral

- Espaçamento generoso, hierarquia editorial clara.
- Separação por espaço negativo e bordas finas (`1px solid --color-border`) — sem sombras pesadas.
- `prefers-reduced-motion` respeitado em todos os efeitos.

---

## Arquitetura — Rotas

```txt
/                  → App.jsx      Home (scroll único)
/projetos          → Projetos.jsx Lista de cases (5 projetos clicáveis)
/projetos/:slug    → Case.jsx     Case individual (template data-driven)
/comecar           → Comecar.jsx  Questionário/contato (destino do botão COMEÇAR)
```

Roteamento em `main.jsx`. Componentes globais (fora das rotas): **Navbar/menu overlay** e **provider de transição de página**.

---

## Home — Seções (`App.jsx`)

```txt
PreHero → Hero → LandingPages → Bridge → Automation → [About: desligada] → Contact
```

- **Só o `.hero` pina globalmente.** O carrossel (`LandingPages`) tem pin interno próprio; Bridge, Automation e Contact rolam livres.
- **`About` está construída mas desligada** (`SHOW_ABOUT_SECTION = false` em `App.jsx`) — fora da estrutura ativa, em stand-by até ter foto/asset definitivo. Credibilidade do Victor hoje vive no Contato/rodapé.

### PreHero (intro)
Tela escura `100vh`, frase curta, desliza pra cima revelando o Hero. **Abertura (loader + slide-up) é one-shot por aba** — ao voltar de outras rotas, entrega o Hero direto.
- Copy: `Seu próximo nível.`

### Hero
Composição editorial em fundo creme, título display gigante + nav + meta nos cantos.
- **Título:** `PÁGINAS QUE CONVERTEM. / SISTEMAS QUE ESCALAM.` (CONVERTEM em accent, SplitText por palavra)
- **Meta esquerda:** `Credibilidade e automação / para sua rotina, suas ideias e seu negócio.`
- **Meta direita:** `— Construa o caminho.`
- **Nav:** PROJETOS · AUTOMATIZE · CONTATO · botão **COMEÇAR**.

### LandingPages (carrossel)
Serviço de páginas de captura, exibido via carrossel horizontal.
- **GSAP Flip + ScrollTrigger** (scrubbado, pin interno) — expande thumbnail e desliza os cards. **Não é auto-play.**
- Previews 01–05 são **componentes React** (`LandingPreview.jsx`), canvas fixo `1280×720` escalado 16:9: **EcoScape · Nexous · Roofora · Dinevo · Minta**.
- Botão "voltar ao topo" aparece ao rolar de volta.

### Bridge (ponte)
Respiro editorial entre os serviços; fundo creme, efeito **letter-swap** por caractere.
- Copy: `O site captura. / O sistema organiza.` (eyebrow "A escada" + imagem `escada.png`).

### Automation
Único bloco **dark** entre as seções de baixo. Serviço de automação.
- **Título:** `TUDO O QUE SEGUE / UM PADRÃO PODE / SER [caixa laranja] MELHORADO → AUTOMATIZADO.` (word-swap por evento).
- **3 cards:** Atendimento · Processos · Comunicação.
- CTA: **Falar no WhatsApp** (ganha halo accent no fluxo de contato).

### Contact
CTA final + rodapé.
- **Headline:** `Bora construir juntos!`
- **E-mail:** `sanntos.creator@gmail.com`
- **Redes:** LinkedIn · Instagram (placeholder `#`) · WhatsApp (`wa.me/5533984246770`).
- Rodapé: `© 2026 Victor Cardoso` · `Construa o caminho.`

---

## Projetos & Cases

### `/projetos` — Lista
Lista à esquerda, frame de mídia à direita que trilha o item em hover. Hoje **4 visíveis**: **Minas Tintas · Hawk Street · Flux Time · Art Piso** (Barbearia existe mas está oculta). Ordem e visibilidade saem da fonte única `src/projectsList.js`. Capas em vídeo/imagem; cada item abre o case.

### `/projetos/:slug` — Case (template único)
Template data-driven (`Case.jsx` + `casesData.js`): Hero pinado → **PROJETO VISÃO** (Desafio/Solução/Resultados) → andar de baixo opcional → área final (voltar ao topo + botão "Próximo projeto"). Editar conteúdo = editar só `casesData.js`.

Tipos de bloco do andar de baixo: `shot` · `split` · `compare` (antes/depois arrastável) · `reveal` · `showcase` · `cta`. O `cta` ("BORA!" → WhatsApp) é o fechamento comum — a exceção é o Flux Time, produto próprio, onde o fechamento é testar o app.

---

## `/comecar` — Questionário/Contato
Destino dos botões **COMEÇAR**. Título `VAMOS / CONVERSAR.` + formulário (Nome · E-mail-ou-telefone inteligente · Prazo · Orçamento · Mensagem). Botão **Bora!** — **envio real plugado** (webhook n8n). Ao enviar, o form dá lugar a uma tela de sucesso (✓ que se desenha + confete).

---

## Componentes globais

- **Navbar / Menu overlay** (`Navbar.jsx`): barra flutuante que aparece ao rolar de volta (logo · MENU · COMEÇAR); overlay fullscreen accent com links Bebas (INÍCIO / PROJETOS / CONTATO).
- **Transição de página** (`PageTransition.jsx`): painel **creme** sobe, logo VC escura anima (draw stroke → fill), navega, painel sai pelo topo. Usada na troca entre rotas. (Creme e não escuro por decisão técnica — o Safari iOS amostrava o painel preto e prendia a status bar.)

---

## Efeitos GSAP ativos

| Efeito | Onde |
|---|---|
| ScrollTrigger + stagger | Entrada de elementos em todas as seções |
| Pin (`.hero`) | Só o Hero pina globalmente |
| Pin interno + Flip | Carrossel de LandingPages |
| SplitText por palavra | Títulos de Hero / Contato / seções |
| Letter-swap / word-swap | Bridge e Automation |
| Tween de transição | Troca de rota (PageTransition) |

---

## Dados do Cliente

| Campo | Valor |
|---|---|
| Nome | **Victor Cardoso** |
| WhatsApp | `5533984246770` |
| E-mail | `sanntos.creator@gmail.com` |
| Logo | `LOGO.svg` (raiz / `public/`) |
| Links sociais | a confirmar (LinkedIn/Instagram em placeholder) |
| Foto pessoal | a confirmar |

---

## Itens Ainda Pendentes

- [ ] **Foto/asset do Victor** — destrava o `AboutCard` (reativar `SHOW_ABOUT_SECTION`) e o avatar do botão "Começar".
- [ ] **Links sociais reais** (LinkedIn, Instagram) — hoje `href="#"`.
- [ ] **Andar de baixo** dos cases **Flux Time** e **Barbearia** — falta capturar as imagens. (Minas Tintas, Hawk Street e Art Piso ✅.)

> Estado de trabalho detalhado, regras técnicas e decisões em andamento: ver `CONTEXTO.md`.
> Voz da marca e fluxo de copy: ver `CONTEXTO-COPY.md`.
