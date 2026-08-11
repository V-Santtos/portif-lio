import { useRef, useState } from "react";
import Contact from "./Contact.jsx";
import Seo from "./Seo.jsx";
import { currentScrollY, fadeJump, gsap, prefersReducedMotion, scrollPageTo, ScrollTrigger, useIsoLayoutEffect } from "./lib.jsx";
import { usePageTransition } from "./PageTransition.jsx";
import { getStaticSeo } from "./seo.js";

const PROCESS_HERO_IMAGE = "";

const SYSTEM_ITEMS = [
  {
    title: "Planejamos cuidadosamente o seu projeto antes de começar a construção.",
    body: "Primeiro passo: entender seu negócio por dentro e por fora — o que você vende, quem compra e o que leva essa pessoa a escolher você. Antes de qualquer design, você recebe a estrutura completa do site, o propósito e o papel de cada página.",
  },
  {
    title: "A mensagem é definida antes do início do projeto.",
    body: "O Figma permanece fechado até a estratégia estar definida. Primeiro organizamos seu posicionamento, a hierarquia do conteúdo e o caminho de quem navega. Assim, cada elemento resolve um problema real do cliente — não fica ali só pra parecer bonito.",
  },
  {
    title: "Um site que parece custar o que você cobra.",
    body: "Design que reflete sua experiência e o valor do seu trabalho. Limpo, confiante e sem ruído visual, para o cliente perceber competência sem precisar adivinhar.",
  },
  {
    title: "Sites profissionais que você pode manter atualizados facilmente.",
    body: "Entrego uma estrutura rápida, organizada e preparada para busca, com um painel que permite atualizar serviços, cases e conteúdos quando precisar. Sem depender de mim para cada pequena mudança.",
  },
  {
    title: "Feedback sem drama.",
    body: "Você revisa o trabalho por etapas, não tudo de uma vez. Decisões menores ao longo do processo significam menos surpresa, menos retrabalho e uma construção mais tranquila.",
  },
  {
    title: "Lançamento e o que vem depois.",
    body: "Eu não desapareço quando o site entra no ar. Você recebe 30 dias de suporte para correções, ajustes de desempenho e orientações para atualizar o conteúdo com confiança.",
  },
];

const RESULT_ITEMS = [
  {
    number: "01",
    title: "Um site que fecha a distância entre o que você entrega e o que o cliente percebe.",
    body: "Muito negócio bom parece comum na internet porque o site não mostra a qualidade do trabalho que existe por trás. O meu trabalho é aproximar essas duas coisas.",
  },
  {
    number: "02",
    title: "Sem precisar explicar tudo do zero.",
    body: "A conversa não começa com uma apresentação longa sobre o que você faz e por que seu trabalho é diferente. O site organiza essa história e mostra seu valor antes do primeiro contato.",
  },
  {
    number: "03",
    title: "Confiança antes da primeira conversa.",
    body: "Quem chega encontra mais motivos para confiar em você antes de mandar uma mensagem. Sua experiência deixa de ser só uma afirmação e passa a ser percebida em cada detalhe.",
  },
  {
    number: "04",
    title: "Interesse que vira uma decisão mais segura.",
    body: "O site ajuda a filtrar quem não combina com o seu trabalho e dá segurança para o cliente certo avançar. O resultado são conversas mais curtas, claras e alinhadas.",
  },
];

const REALITY_ITEMS = [
  {
    number: "01",
    title: "Sem conta mágica de investir pouco e faturar uma fortuna.",
    body: "Eu não vendo promessa de enriquecimento rápido. O que eu garanto é um site capaz de apresentar seu trabalho com clareza, atrair o cliente certo e construir confiança antes da conversa. O resultado também depende da força da sua oferta e de como as pessoas chegam até você.",
  },
  {
    number: "02",
    title: "Seu site não vai encontrar clientes sozinho.",
    body: "Site converte visita em interesse. Ele não sai procurando pessoas enquanto você dorme. O papel dele é aproveitar melhor o tráfego que já vem de indicação, conteúdo, anúncio, relacionamento e prospecção.",
  },
  {
    number: "03",
    title: "Um bom site amplifica um bom negócio.",
    body: "Site não cria um negócio forte. Ele faz um bom negócio parecer tão bom quanto realmente é: deixa a experiência mais fácil de enxergar, o valor mais simples de entender e os pontos fortes difíceis de ignorar.",
  },
];

const STATEMENTS = [
  {
    desktop: [
      { text: "Antes de construir qualquer coisa," },
      { text: "eu entendo o que o seu" },
      { accent: "negócio precisa." },
    ],
    mobile: [
      { text: "Antes de construir" },
      { text: "qualquer coisa," },
      { text: "eu entendo o que o seu" },
      { accent: "negócio precisa." },
    ],
  },
];

const PROCESS_ITEMS_BY_TYPE = {
  sites: SYSTEM_ITEMS.map((item) => ({ ...item })),
  sistemas: SYSTEM_ITEMS.map((item) => ({ ...item })),
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

    const context = gsap.context(() => {
      gsap.set(lineElements, { yPercent: 135, opacity: 0 });

      // Pin e animação têm inícios diferentes. Manter os dois no mesmo
      // ScrollTrigger faria a seção pinada parar a 15% do topo.
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        pin: statement,
        pinSpacing: false,
        invalidateOnRefresh: true,
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

function ProcessSystemSection() {
  const [selectedType, setSelectedType] = useState("sites");
  const [contentType, setContentType] = useState("sites");
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
      if (hero) {
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
          refreshPriority: -1,
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

  const goToHomeSection = (id) => {
    window.location.href = `/#${id}`;
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
                <button onClick={() => goToHomeSection("auto")} className="hero__nav-link-btn">Sistemas</button>
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
              {PROCESS_HERO_IMAGE && (
                <img className="process-hero__image" src={PROCESS_HERO_IMAGE} alt="" />
              )}
            </div>

            <div className="process-hero__meta">
              <p>Seu site reflete a qualidade do seu trabalho — ou não. Meu processo existe para ajudar o cliente certo a perceber essa diferença.</p>
              <p aria-hidden="true">(Role para o meu sistema)</p>
            </div>
          </div>
          <div className="process-hero__wash" aria-hidden="true" />
        </section>

        {STATEMENTS.map((statement, index) => (
          <ProcessStatement statement={statement} index={index} key={statement.desktop[0].text} />
        ))}
        </div>

        <ProcessSystemSection />

        <section className="process-results process-content-section" aria-labelledby="process-results-title">
          <div className="container-x process-results__inner">
            <h2 className="process-results__title" id="process-results-title" data-process-reveal>
              <span>O que você recebe é</span>
              <span>um site que funciona.</span>
            </h2>
            <div className="process-results__list">
              {RESULT_ITEMS.map((item) => (
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

        <section className="process-reality process-content-section" aria-labelledby="process-reality-title">
          <div className="container-x process-reality__layout">
            <div className="process-reality__left" data-process-reveal>
              <h2 className="process-reality__title" id="process-reality-title">
                Papo
                <span>reto</span>
              </h2>
              <div className="process-reality__note">
                <p>O site não cria um bom negócio.</p>
                <strong>Ele deixa o valor mais fácil de enxergar.</strong>
                <span aria-hidden="true">↘</span>
              </div>
            </div>
            <div className="process-reality__list">
              {REALITY_ITEMS.map((item) => (
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

        <section className="section case-cta">
          <div className="container-x">
            <div className="case-cta__card" data-process-reveal>
              <h3 className="case-cta__title">Pronto pra começar?{"\n"}Bora construir o seu.</h3>
              <p className="case-cta__body">Site ou sistema, o processo é o mesmo. Me conta o que você precisa e a gente parte pra prática.</p>
              <a className="btn btn--accent case-cta__btn" href="https://wa.me/5533984246770" target="_blank" rel="noreferrer">
                Bora!
              </a>
            </div>
          </div>
        </section>

        <Contact />
      </main>
    </>
  );
}

export default Processo;
