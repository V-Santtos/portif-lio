import { useRef, useState } from "react";
import Contact from "./Contact.jsx";
import Seo from "./Seo.jsx";
import { currentScrollY, fadeJump, gsap, prefersReducedMotion, scrollPageTo, ScrollTrigger, useIsoLayoutEffect } from "./lib.jsx";
import { usePageTransition } from "./PageTransition.jsx";
import { getStaticSeo } from "./seo.js";
import processHeroPortrait from "../asset/process-hero-portrait.png";

const PROCESS_HERO_IMAGE = processHeroPortrait;

const SITES_ITEMS = [
  {
    title: "Seu site começa no papel.",
    body: "Primeiro passo: entender seu negócio por dentro e por fora — o que você vende, quem é seu cliente e o que leva essas pessoas a escolherem você. Antes de qualquer desenho, você recebe a estrutura completa, o propósito e o papel de cada página.",
  },
  {
    title: "Um site que reflete a sua marca.",
    body: "O design certo muda de negócio pra negócio — não existe uma fórmula pronta, como muitos prometem. Por isso escolho cada peça com cuidado, para ela transparecer a sua marca antes de qualquer texto no site.",
  },
  {
    title: "Feedback sem drama.",
    body: "Você revisa o trabalho por etapas, não tudo de uma vez. Decisões menores ao longo do processo significam menos surpresa e menos retrabalho. Para assim facilitar uma construção mais tranquila.",
  },
  {
    title: "Suporte pós-entrega.",
    body: "Eu não desapareço depois da entrega. Você recebe 10 dias de suporte para correções pequenas, ajustes de desempenho e orientações no que precisar.",
  },
];

// Lado Sistemas do seletor — copy definitiva, 4 cards.
// 03 e 04 dividem o titulo com o lado Sites de proposito (decisao do
// Victor): mesma promessa, mecanica/conteudo diferente.
const SISTEMAS_ITEMS = [
  {
    title: "A criação se inicia numa conversa.",
    body: "Uma ferramenta pode nascer de uma ideia que você deseja ver funcionando ou de um problema já existente que atrapalha seu dia a dia. São caminhos diferentes, e é por isso que eu começo entendendo o que você precisa e qual é a sua dor.",
  },
  {
    title: "Menos função, mais uso.",
    body: "Cada peça da ferramenta é montada a partir de uma necessidade real, sem múltiplas funções que talvez nem sejam usadas. Assim você recebe algo completo, eficiente e simples de se usar todos os dias.",
  },
  {
    title: "Feedback sem drama.",
    body: "Você fica por dentro de como tudo está sendo criado. Se eu encontrar maneiras de deixar a ferramenta ainda mais eficiente para você, eu irei te consultar. E a sugestão pode vir de você também, a qualquer momento do processo.",
  },
  {
    title: "Suporte pós-entrega.",
    body: "O uso no dia a dia é que revela o que precisa de ajuste ou não. Por isso você terá 15 dias após a entrega pra corrigir caso algo tenha passado despercebido e moldar a ferramenta ao seu uso real.",
  },
];

// "O que você recebe" — consciente de tipo desde 2026-08-12. Só o titulo do
// lado Sistemas e definitivo; os 3 cards ainda sao PLACEHOLDER com a copy
// de Sites (mesmo tratamento dado ao Metodo: array duplicado ate escrevermos
// etapa por etapa).
const SITES_RESULT_ITEMS = [
  {
    number: "01",
    title: "Sem precisar explicar tudo do zero.",
    body: "Antes mesmo do primeiro contato, seu cliente já precisa entender quem você é, o que você faz e por que escolher o seu trabalho. O site organiza essas informações e apresenta seu valor de forma clara.",
  },
  {
    number: "02",
    title: "Confiança antes da primeira conversa.",
    body: "Quem chega encontra mais motivos para confiar em você antes de mandar uma mensagem. Sua experiência deixa de ser só uma afirmação e passa a ser percebida em cada detalhe.",
  },
  {
    number: "03",
    title: "Interesse que vira uma decisão mais segura.",
    body: "O site ajuda a filtrar quem não combina com o seu trabalho e dá segurança para o cliente certo avançar. O resultado são conversas mais curtas, claras e alinhadas.",
  },
];

// Lado Sistemas de "O que você recebe" — 01, 02 e 03 fechados (2026-08-13).
// Cada card nomeia uma DOR universal (01 = estrutura, 02 = tempo, 03 =
// crescimento), nunca um caso concreto: o portfolio recebe lead de qualquer
// nicho, e citar galpao/loja/WhatsApp fecha a porta pra quem nao e aquilo.
const SISTEMAS_RESULT_ITEMS = [
  {
    number: "01",
    title: "Seu processo ganha estrutura.",
    body: "Se hoje os problemas do seu negócio estão espalhados, com um em cada canto, a ferramenta certa muda isso. Você passa a ter um lugar único e sólido onde consegue gerenciar adequadamente cada parte dos seus processos diários e resolvê-los.",
  },
  {
    number: "02",
    title: "Seu tempo, de volta\ne a seu favor.",
    body: "O que consome horas do seu dia raramente é o trabalho em si, mas sim as tarefas manuais em volta dele. Com a ferramenta certa, tudo fica mais simples, mais organizado e você ganha tempo para focar no que realmente importa.",
  },
  {
    number: "03",
    title: "Uma solução exclusiva \ne  escalável.",
    body: "Ferramentas prontas são feitas para atender todo mundo. Por isso, muitas vezes vêm cheias de funções que você não usa e deixam de lado justamente o que o seu negócio precisa. Com uma solução sob medida, você tem apenas o que faz sentido para a sua rotina e ela pode evoluir junto com o seu negócio.",
  },
];

const RESULTS_BY_TYPE = {
  sites: {
    title: ["O que você recebe é", "um site que funciona."],
    items: SITES_RESULT_ITEMS,
  },
  sistemas: {
    title: ["O que você recebe é", "uma ferramenta que funciona."],
    items: SISTEMAS_RESULT_ITEMS,
  },
};

// "Um papo reto" — consciente de tipo desde 2026-08-12. Titulo da secao nao
// cita "site", entao fica fixo no JSX; so os itens variam por tipo.
//
// 2026-08-13: a secao ficou OCULTA no lado Sistemas (decisao do Victor).
// Ela nao foi deletada de proposito — pode voltar quando houver material.
// Motivo do corte: no lado Sites existem tres promessas infladas do mercado
// pra derrubar (site vende sozinho / traz cliente sozinho / salva negocio
// fraco), uma por card. Em Sistemas so existe UMA verdade desse tipo — a
// ferramenta so ajuda se for usada de fato — e as outras candidatas diziam
// a mesma coisa por outro angulo ("voce ainda tem trabalho"). Uma verdade
// nao vira grade de tres cards sem virar enchimento.
//
// Pra trazer de volta: escrever os itens em SISTEMAS_REALITY_ITEMS. A secao
// volta a renderizar sozinha — o guard e a existencia de itens.
const SITES_REALITY_ITEMS = [
  {
    number: "01",
    title: "Sem promessa milagrosa.",
    body: "O que eu garanto é um site capaz de apresentar seu trabalho com clareza, atrair o cliente certo e construir confiança antes mesmo dele enviar a primeira mensagem. O resultado também depende da força da sua oferta e de como as pessoas chegam até você.",
  },
  {
    number: "02",
    title: "O site não encontra clientes sozinho.",
    body: "Site converte visita em interesse. Ele não sai procurando pessoas enquanto você dorme. O papel dele é aproveitar melhor o tráfego que já vem de indicação, conteúdo, anúncio, relacionamento e prospecção.",
  },
  {
    number: "03",
    title: "Um bom site amplifica um bom negócio.",
    body: "Site não cria um negócio forte. Ele faz um bom negócio parecer tão bom quanto realmente é, deixando a experiência mais fácil de enxergar, o valor mais simples de entender e os pontos fortes difíceis de ignorar.",
  },
];

// Vazio de proposito: e o que mantem a secao oculta no lado Sistemas.
// Nao repovoar com a copy de Sites — copia disfarcada entre os dois lados
// e proibida (Regras/06 §3). Ver o comentario acima.
const SISTEMAS_REALITY_ITEMS = [];

const REALITY_ITEMS_BY_TYPE = {
  sites: SITES_REALITY_ITEMS,
  sistemas: SISTEMAS_REALITY_ITEMS,
};

// CTA final — consciente de tipo desde 2026-08-13. O corpo antigo ("Site ou
// sistema, o processo e o mesmo") contradizia o resto da pagina, que passou
// dois dias inteiros provando que sao coisas diferentes. Titulo continua
// igual nos dois lados (nao foi pedido pra mudar); corpo agora e por tipo,
// texto final ditado pelo Victor — literal, so ortografia corrigida.
//
// Titulo cortado pra 1 linha so (2026-08-13, decisao do Victor): "Bora
// construir o seu." saiu por repetir "bora" com o botao ("BORA!") e o
// heading do Contact logo abaixo ("BORA CONSTRUIR JUNTOS"). String simples
// (nao array) porque nao ha mais segunda linha pra unir com "\n" — mesmo
// padrao do titulo de CTA em Case.jsx, que tambem e string unica.
const CTA_TITLE = "Pronto pra começar?";

const CTA_BY_TYPE = {
  sites: {
    title: CTA_TITLE,
    body: "Você não precisa ter tudo estruturado desde o início. Me conta o que seu negócio faz e quem você quer atrair. O resto, a gente constrói junto.",
  },
  sistemas: {
    title: CTA_TITLE,
    body: "Tem uma ideia, um processo que precisa melhorar ou alguma parte do seu negócio que poderia funcionar melhor? Me conta qual é o seu caso e o resto a gente constrói junto.",
  },
};

const STATEMENTS = [
  {
    desktop: [
      { text: "Antes de construir qualquer" },
      { text: "coisa, eu entendo o que o" },
      { accent: "seu negócio precisa." },
    ],
    mobile: [
      { text: "Antes de construir" },
      { text: "qualquer coisa," },
      { text: "eu entendo o que o" },
      { accent: "seu negócio precisa." },
    ],
  },
];

const PROCESS_ITEMS_BY_TYPE = {
  sites: SITES_ITEMS,
  sistemas: SISTEMAS_ITEMS,
};

const PROCESS_TYPES = [
  { id: "sites", label: "Sites" },
  { id: "sistemas", label: "Sistemas" },
];

// A frase começa quando 85% da próxima tela já entrou na viewport:
// o topo do scroller ainda está a 15% do topo. O pin continua em top/top.
const STATEMENT_ANIMATION_START = "top 15%";

function StartButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="hero__talk-btn" aria-label="Começar">
      <span className="hero__talk-avatar" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="5" width="14" height="16" rx="2" />
          <path d="M9 5V4.2A1.2 1.2 0 0 1 10.2 3h3.6A1.2 1.2 0 0 1 15 4.2V5" />
          <line x1="8.5" y1="11" x2="15.5" y2="11" />
          <line x1="8.5" y1="14.5" x2="15.5" y2="14.5" />
          <line x1="8.5" y1="18" x2="12.5" y2="18" />
        </svg>
      </span>
      <span className="hero__talk-label">Começar</span>
    </button>
  );
}

function ProcessStatement({ statement, index }) {
  const scrollerRef = useRef(null);

  useIsoLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const statement = root.querySelector(".process-statement");
    const lineElements = root.querySelectorAll(".process-statement__line");
    if (!statement || !lineElements.length) return;

    if (prefersReducedMotion()) {
      gsap.set(lineElements, { yPercent: 0, opacity: 1, clearProps: "transform" });
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const context = gsap.context(() => {
      gsap.set(lineElements, { yPercent: 135, opacity: 0 });

      // Pin e animação têm inícios diferentes. Manter os dois no mesmo
      // ScrollTrigger faria a seção pinada parar a 15% do topo.
      // pinType:"fixed" no mobile — mesma correção do pin do Hero (App.jsx)
      // e do carrossel (LandingPages.jsx): sem isso o pin cai em pinType
      // "transform" (o ScrollSmoother registra scroller:#smooth-wrapper) e
      // reposiciona por JS na main thread, que atrasa atrás do compositor
      // durante o momentum do touch e treme.
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        pin: statement,
        pinSpacing: false,
        invalidateOnRefresh: true,
        ...(isMobile && { pinType: "fixed" }),
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: STATEMENT_ANIMATION_START,
            // "bottom bottom" e nao "bottom top": o curso do trigger passa a ser
            // (altura do scroller - altura da viewport), que e EXATAMENTE a janela
            // em que o .process-statement fica grudado. Com "bottom top" o curso
            // era a altura inteira do scroller, entao a saida (75% da timeline)
            // so disparava depois de o sticky descolar (66,7%) — a frase ja tinha
            // subido pra fora da tela por scroll normal e a saida nunca era vista.
            // Derivado da geometria: continua certo se o 300svh do scroller mudar.
            end: "bottom bottom",
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        })
        .to(lineElements, {
          yPercent: 0,
          opacity: 1,
          duration: 0.24,
          stagger: 0.035,
          ease: "power2.out",
        })
        .to({}, { duration: 0.48 })
        .to(lineElements, {
          yPercent: -135,
          opacity: 0,
          duration: 0.24,
          stagger: 0.03,
          ease: "power2.in",
        });
    }, root);

    return () => context.revert();
  }, []);

  const label = statement.desktop.map((line) => `${line.text || ""}${line.accent || ""}`).join(" ");

  const renderLines = (lines, variant) => (
    <h2 className={`process-statement__title process-statement__title--${variant}`}>
      {lines.map((line) => (
        <span className="process-statement__line-mask" key={`${line.text || ""}${line.accent || ""}`}>
          <span className="process-statement__line">
            {line.text}
            {line.accent && <span className="process-statement__accent">{line.accent}</span>}
          </span>
        </span>
      ))}
    </h2>
  );

  return (
    <div className="process-statement-scroller" ref={scrollerRef} data-statement={index + 1}>
      <section className="process-statement" aria-label={label}>
        <div className="container-x process-statement__content" aria-hidden="true">
          {renderLines(statement.desktop, "desktop")}
          {renderLines(statement.mobile, "mobile")}
        </div>
      </section>
    </div>
  );
}

function ProcessSystemSection({ selectedType, contentType, setSelectedType, setContentType }) {
  const itemsRef = useRef(null);
  const exitTweenRef = useRef(null);
  const hasRenderedRef = useRef(false);

  useIsoLayoutEffect(() => {
    if (!hasRenderedRef.current) {
      hasRenderedRef.current = true;
      return undefined;
    }

    const items = itemsRef.current?.querySelectorAll(".process-system__item-content");
    if (!items?.length) {
      return undefined;
    }

    if (prefersReducedMotion()) {
      gsap.set(items, { clearProps: "transform,opacity" });
      ScrollTrigger.refresh();
      return undefined;
    }

    const enterTween = gsap.fromTo(
      items,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.58,
        stagger: 0.045,
        ease: "power3.out",
        overwrite: true,
        onComplete: () => {
          gsap.set(items, { clearProps: "transform,opacity" });
          ScrollTrigger.refresh();
        },
      }
    );

    return () => enterTween.kill();
  }, [contentType]);

  useIsoLayoutEffect(
    () => () => {
      exitTweenRef.current?.kill();
    },
    []
  );

  const selectProcessType = (nextType) => {
    if (nextType === selectedType) return;

    setSelectedType(nextType);

    const items = itemsRef.current?.querySelectorAll(".process-system__item-content");
    if (prefersReducedMotion() || !items?.length) {
      setContentType(nextType);
      return;
    }

    exitTweenRef.current?.kill();
    exitTweenRef.current = gsap.to(items, {
      y: -24,
      opacity: 0,
      duration: 0.3,
      stagger: 0.025,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => setContentType(nextType),
    });
  };

  const items = PROCESS_ITEMS_BY_TYPE[contentType];

  return (
    <section className="process-system process-content-section" aria-labelledby="process-system-title">
      <div className="container-x process-system__layout">
        <header className="process-system__header" data-process-reveal>
          <h2 className="process-system__title" id="process-system-title">
            <span>Meu</span>
            Método
          </h2>
          <div
            className="process-system__switch"
            data-active={selectedType}
            role="group"
            aria-label="Escolha o tipo de projeto"
          >
            {PROCESS_TYPES.map((type) => (
              <button
                className="process-system__switch-button"
                type="button"
                aria-pressed={selectedType === type.id}
                onClick={() => selectProcessType(type.id)}
                key={type.id}
              >
                {type.label}
              </button>
            ))}
          </div>
        </header>

        <div
          className="process-system__items"
          data-process-type={contentType}
          aria-label={`Etapas para ${contentType}`}
          ref={itemsRef}
        >
          {items.map((item, index) => (
            <article className="process-system__item" data-process-reveal key={index}>
              <div className="process-system__item-content">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Processo() {
  const pageRef = useRef(null);
  const { transitionTo } = usePageTransition();
  // Seletor Sites/Sistemas do Método — o estado mora aqui (nao dentro do
  // ProcessSystemSection) porque, desde 2026-08-12, ele tambem comanda o
  // conteudo de "O que voce recebe", "Um papo reto" e o CTA final.
  const [selectedType, setSelectedType] = useState("sites");
  const [contentType, setContentType] = useState("sites");
  const results = RESULTS_BY_TYPE[contentType];
  const reality = REALITY_ITEMS_BY_TYPE[contentType];
  const cta = CTA_BY_TYPE[contentType];

  useIsoLayoutEffect(() => {
    // Sem isto, acesso direto/F5 em /meu-processo fica com o #__boot (z-index 99)
    // por cima e o body travado em overflow:hidden — tela creme vazia.
    // Adia 1 frame igual ao Case: o hero daqui também tem wash creme→laranja, e
    // a primeira pintura precisa acontecer COM o boot visível pra a barra do
    // Safari iOS nascer laranja em vez de resetar pra creme.
    const raf = requestAnimationFrame(() => {
      document.documentElement.removeAttribute("data-booting");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useIsoLayoutEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const reduce = prefersReducedMotion();
    const processNav = root.querySelector(".process-hero__nav");
    const context = gsap.context(() => {
      const heroWord = root.querySelector(".process-hero__word-inner");
      const heroAccent = root.querySelector(".process-hero__accent-inner");
      const heroMeta = root.querySelectorAll(".process-hero__meta > *");
      const revealElements = root.querySelectorAll("[data-process-reveal]");
      const hero = root.querySelector(".process-hero");

      if (reduce) {
        gsap.set([heroWord, heroAccent, ...heroMeta, ...revealElements], {
          y: 0,
          yPercent: 0,
          opacity: 1,
          clearProps: "transform",
        });
        return;
      }

      // Mesmo overlap da abertura da home: enquanto a primeira frase entra,
      // o hero continua na viewport e a proxima secao o cobre. Sem spacing
      // extra, porque a hero ja ocupa uma viewport no fluxo normal.
      // pinType:"fixed" no mobile — mesma correção do pin do Hero da home
      // (App.jsx) e do carrossel (LandingPages.jsx): sem isso o pin cai em
      // pinType "transform" e treme durante o momentum do touch. Ver o
      // comentário completo em App.jsx.
      if (hero) {
        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
          refreshPriority: -1,
          ...(isMobile && { pinType: "fixed" }),
        });
      }

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(heroWord, { yPercent: 120 }, { yPercent: 0, duration: 1.05 })
        .fromTo(heroAccent, { yPercent: 125, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8 }, "-=0.65")
        .fromTo(heroMeta, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, stagger: 0.08 }, "-=0.45");

      revealElements.forEach((element) => {
        gsap.fromTo(
          element,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.82,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, root);

    // O nav acompanha a direcao VISUAL do ScrollSmoother: desce o scroll,
    // o conjunto inteiro sobe e sai; volta o scroll, ele reaparece. O ticker
    // cobre os frames em que o smoother continua se movendo entre eventos.
    let navTween = null;
    let navHidden = false;
    let lastNavY = currentScrollY();

    const setNavHidden = (hidden) => {
      if (!processNav || hidden === navHidden) return;
      navHidden = hidden;
      navTween?.kill();
      navTween = gsap.to(processNav, {
        yPercent: hidden ? -140 : 0,
        opacity: hidden ? 0 : 1,
        duration: reduce ? 0 : 0.42,
        ease: hidden ? "power3.in" : "power3.out",
        overwrite: true,
      });
    };

    const updateProcessNav = () => {
      const currentY = currentScrollY();
      const delta = currentY - lastNavY;

      if (currentY <= 2) {
        setNavHidden(false);
      } else if (delta > 0.5) {
        setNavHidden(true);
      } else if (delta < -0.5) {
        setNavHidden(false);
      }

      lastNavY = currentY;
    };

    window.addEventListener("scroll", updateProcessNav, { passive: true });
    gsap.ticker.add(updateProcessNav);

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", updateProcessNav);
      gsap.ticker.remove(updateProcessNav);
      navTween?.kill();
      if (processNav) gsap.set(processNav, { clearProps: "transform,opacity" });
      context.revert();
    };
  }, []);

  const goToContact = () => {
    fadeJump(() => {
      document.getElementById("contato")?.scrollIntoView();
      window.dispatchEvent(new CustomEvent("contact:highlight"));
    });
  };

  return (
    <>
      <Seo {...getStaticSeo("processo")} />
      <main className="process-page" ref={pageRef}>
        <div className="process-hero-stage">
        <section className="section hero process-hero" id="processo" data-screen-label="Meu processo">
          <div className="container-x process-hero__inner">
            <nav className="hero__nav process-hero__nav" aria-label="Navegação principal">
              <button type="button" onClick={() => transitionTo("/")} className="hero__logo" aria-label="Victor Cardoso — início">
                <img src="/LOGO.svg" alt="" className="hero__logo-mark" />
              </button>
              <div className="hero__nav-links">
                <button onClick={() => transitionTo("/projetos")} className="hero__nav-link-btn">Projetos</button>
                <button onClick={() => scrollPageTo(0)} className="hero__nav-link-btn" aria-current="page">Meu processo</button>
                <button onClick={goToContact} className="hero__nav-link-btn">Contato</button>
              </div>
              <StartButton onClick={() => transitionTo("/comecar")} />
              <button
                type="button"
                className="hero__menu-btn"
                aria-label="Abrir menu"
                onClick={() => window.dispatchEvent(new CustomEvent("nav:open-menu"))}
              >
                <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
                  <rect width="22" height="2" fill="currentColor" />
                  <rect y="6" width="22" height="2" fill="currentColor" />
                  <rect y="12" width="22" height="2" fill="currentColor" />
                </svg>
              </button>
            </nav>

            <div className="process-hero__display">
              <h1 className="process-hero__title" aria-label="Meu processo">
                <span className="process-hero__word-mask" aria-hidden="true">
                  <span className="process-hero__word-inner">Processo</span>
                </span>
                <span className="process-hero__accent-mask" aria-hidden="true">
                  <span className="process-hero__accent-inner">Meu</span>
                </span>
              </h1>
            </div>

            {/* Ordem de pilha do hero: titulo (2) < foto (3) < wash (4) < nav (5)
                < meta (6). A foto cobre a palavra PROCESSO — se ficar por baixo,
                os vazios das letras enchem de cinza e a palavra perde o contorno.
                Ambos moram DENTRO do __inner porque ele ja e o contexto de
                empilhamento (container-type: inline-size aplica contain: layout);
                fora dele nao ha z-index que os separe do titulo. */}
            {PROCESS_HERO_IMAGE && (
              <img className="process-hero__image" src={PROCESS_HERO_IMAGE} alt="" />
            )}
            <div className="process-hero__wash" aria-hidden="true" />

            <div className="process-hero__meta">
              {/* Texto do Victor (2026-08-13), literal. Substituiu o placeholder
                  emprestado da referencia (bogdankolomiyets.com), que abria com
                  "Seu site reflete..." e por isso fechava a pagina no lado Sites
                  antes mesmo do leitor chegar no seletor. Precisa continuar
                  neutro: mora ACIMA do toggle, entao nao pode citar "site" nem
                  "ferramenta". Tambem nao pode falar de "entender antes de
                  construir" — esse angulo e do statement pinado logo abaixo. */}
              <p>Antes de confiar um projeto a alguém, você merece saber como essa pessoa trabalha.<br />Por isso esse processo existe.</p>
              <p aria-hidden="true"></p>
            </div>
          </div>
        </section>

        {STATEMENTS.map((statement, index) => (
          <ProcessStatement statement={statement} index={index} key={statement.desktop[0].text} />
        ))}
        </div>

        <ProcessSystemSection
          selectedType={selectedType}
          contentType={contentType}
          setSelectedType={setSelectedType}
          setContentType={setContentType}
        />

        <section className="process-results process-content-section" aria-labelledby="process-results-title">
          <div className="container-x process-results__inner">
            <h2 className="process-results__title" id="process-results-title" data-process-reveal>
              <span>{results.title[0]}</span>
              <span>{results.title[1]}</span>
            </h2>
            <div className="process-results__list">
              {results.items.map((item) => (
                <article className="process-results__item" data-process-reveal key={item.number}>
                  <span className="process-number">({item.number})</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {reality.length > 0 && (
          <section className="process-reality process-content-section" aria-labelledby="process-reality-title">
            <div className="container-x process-reality__inner">
              <h2 className="process-reality__title" id="process-reality-title" data-process-reveal>
                Um papo <span>reto</span>
              </h2>
              <div className="process-reality__list">
                {reality.map((item) => (
                  <article className="process-reality__item" data-process-reveal key={item.number}>
                    <span className="process-number">({item.number})</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section case-cta">
          <div className="container-x">
            <div className="case-cta__card" data-process-reveal>
              <h3 className="case-cta__title">{cta.title}</h3>
              <p className="case-cta__body">{cta.body}</p>
              <a className="btn btn--accent case-cta__btn" href="https://wa.me/5533984246770" target="_blank" rel="noreferrer">
                Bora!
              </a>
            </div>
          </div>
        </section>

        <Contact showFaq={false} showCta={false} />
      </main>
    </>
  );
}

export default Processo;
