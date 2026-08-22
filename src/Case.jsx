import { useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { gsap, ScrollTrigger, SplitText, scrollPageTo, useIsoLayoutEffect, prefersReducedMotion } from "./lib.jsx";
import { usePageTransition } from "./PageTransition.jsx";
import { CASES } from "./casesData.js";
import { nextProject } from "./projectsList.js";
import Seo from "./Seo.jsx";
import { getCaseSeo } from "./seo.js";
import CaseCompare from "./CaseCompare.jsx";
import CaseReveal from "./CaseReveal.jsx";

function Case() {
  const { slug } = useParams();
  const data = CASES[slug];

  const { transitionTo } = usePageTransition();
  const heroRef     = useRef(null);
  const overviewRef = useRef(null);
  const tagsRef     = useRef(null);
  const titleRef    = useRef(null);
  const descRef     = useRef(null);
  const navRef      = useRef(null);
  const blocksRef   = useRef(null);
  const ctaBtnRef   = useRef(null);

  useIsoLayoutEffect(() => {
    // Adia a remoção 1 frame pra a primeira pintura acontecer COM o boot
    // (creme→laranja) visível — assim o Safari iOS amostra a barra inferior
    // laranja no reload do case. O Case monta rápido; sem o defer o boot some
    // antes de pintar e a barra reseta pra creme. Mesmo efeito do hero.
    const raf = requestAnimationFrame(() => {
      document.documentElement.removeAttribute("data-booting");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useIsoLayoutEffect(() => {
    if (!data || prefersReducedMotion()) return;

    const tagEls = tagsRef.current?.querySelectorAll(".case-hawk__tag-inner");
    const title  = titleRef.current;
    const desc   = descRef.current;
    const nav    = navRef.current;
    if (!tagEls || !title || !desc || !nav) return;

    const logo    = nav.querySelector(".hero__logo");
    const links   = Array.from(nav.querySelectorAll(".hero__nav-links a, .hero__nav-links button"));
    const cta     = nav.querySelector(".hero__nav-cta, .hero__talk-btn");
    const navEls  = [logo, ...links, cta].filter(Boolean);

    const split = SplitText.create(title, { type: "chars" });

    gsap.set(tagEls,      { yPercent: 115 });
    gsap.set(split.chars, { yPercent: 115 });
    gsap.set(desc,        { opacity: 0, y: 18 });
    gsap.set(navEls,      { y: 20, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(split.chars, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: "back.out(1.7)",
      })
      .to(navEls, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.07,
      }, "<")
      .to(tagEls, {
        yPercent: 0,
        duration: 0.85,
        stagger: 0.15,
      }, "-=0.3")
      .to(desc, {
        opacity: 1,
        y: 0,
        duration: 0.55,
      }, "<");

    return () => split.revert();
  }, [data]);

  useIsoLayoutEffect(() => {
    const hero     = heroRef.current;
    const overview = overviewRef.current;
    if (!data || !hero || !overview) return;

    hero.style.position     = "relative";
    hero.style.zIndex       = "1";
    overview.style.position = "relative";
    overview.style.zIndex   = "2";

    if (prefersReducedMotion()) return;

    // 🔴 `pinType: "fixed"` no mobile — mesma correção do Hero da home
    // (App.jsx). Sem ela, o ScrollSmoother registra scroller:#smooth-wrapper
    // e o pin cai em pinType "transform", reposicionado por JS na main
    // thread; durante o momentum nativo (que roda no compositor) o
    // contra-transform chega atrasado e o hero pinado TREME. No mobile o
    // #smooth-content não tem transform, então position:fixed ancora na
    // viewport de verdade e o compositor segura o pin sozinho.
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const pin = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      pin: true,
      pinSpacing: false,
      ...(isMobile && { pinType: "fixed" }),
    });

    ScrollTrigger.refresh();
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => pin.kill();
  }, [data]);

  // Reveal dos blocos de conteúdo (andar de baixo) ao entrar na viewport
  useIsoLayoutEffect(() => {
    if (!data || prefersReducedMotion()) return;
    const root = blocksRef.current;
    if (!root) return;
    const items = root.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: 32 });
    const tweens = Array.from(items).map((el) =>
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
      })
    );

    return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  }, [data]);

  // Entrada especial dos blocos com `entrance`: a mídia "assenta" no lugar
  // (começa maior e levemente deslocada) e, na sequência, o texto entra.
  // Uma peça só, sem pin/scrub — degrada pra fade no reduced-motion.
  useIsoLayoutEffect(() => {
    if (!data || prefersReducedMotion()) return;
    const root = blocksRef.current;
    if (!root) return;

    // ATENÇÃO: querySelectorAll, não querySelector. Com mais de um bloco
    // `entrance` no mesmo case (Art Piso tem dois) o singular animava só o
    // primeiro e os outros ficavam parados.
    const limpezas = [];
    let cancelado = false;
    // SplitText mede o texto para montar as máscaras. Se rodar antes da Bebas
    // carregar, mede a fonte de fallback e as janelas nascem com altura errada
    // (palavra cortada). Esperar as fontes é o que evita isso.
    const fontsProntas = document.fonts?.ready ?? Promise.resolve();

    root.querySelectorAll('[data-entrance="media"]').forEach((media) => {
      const section = media.closest("section");
      const textBox = section?.querySelector('[data-entrance="text"]');
      // Espelhado = foto à direita; ela deve nascer do lado DELA, não do miolo.
      const reverse = section?.classList.contains("case-split--reverse");
      const foto = section?.classList.contains("case-split--photo");

      if (foto) {
        // A foto ASSENTA (escala + fade + leve deslize) e, na sequência, o
        // texto entra palavra a palavra. Mesmo assentamento dos blocos que já
        // funcionam (showcase do Hawk) — NÃO usar clip-path: o GSAP não
        // interpola inset() com `round`, então a varredura dava snap (sem
        // assentamento). Os cantos arredondados vêm do border-radius da própria
        // imagem, que sem clip-path fica intacto.
        const img = media.querySelector("img") || media;
        const titulo = textBox?.querySelector(".case-split__title");
        const corpo = textBox?.querySelector(".case-split__body");

        // A foto entra do lado DELA: normal desliza da esquerda, espelhado da direita.
        const xDe = reverse ? -24 : 24;

        // Estado inicial SÍNCRONO: nada pisca enquanto as fontes carregam.
        gsap.set(img, { autoAlpha: 0, scale: 1.06, xPercent: xDe > 0 ? 4 : -4 });
        if (titulo) gsap.set(titulo, { autoAlpha: 0 });
        if (corpo) gsap.set(corpo, { opacity: 0, y: 18 });

        let split = null;
        let tl = null;
        let observer = null;

        // A timeline INTEIRA nasce depois das fontes. Montar antes e pendurar
        // o título depois deixava o disparo acontecer sem ele — o título
        // entrava solto, fora de ordem.
        fontsProntas.then(() => {
          if (cancelado) return;

          if (titulo) {
            split = SplitText.create(titulo, { type: "words", mask: "words" });
            // A janela da máscara do SplitText tem a altura da LINHA. Com
            // line-height 0.95 ela é menor que a letra e corta acento e ponto.
            // Mesma receita do .auto__title da Automation: folga em cima e
            // embaixo, compensada por margem negativa pra não mexer no layout.
            split.words.forEach((palavra) => {
              const janela = palavra.parentNode;
              if (!janela) return;
              janela.style.overflow = "hidden";
              janela.style.paddingTop = "0.18em";
              janela.style.marginTop = "-0.18em";
              janela.style.paddingBottom = "0.1em";
              janela.style.marginBottom = "-0.1em";
            });
            gsap.set(titulo, { autoAlpha: 1 });
            gsap.set(split.words, { yPercent: 135 });
          }

          // Timeline PAUSADA — quem dispara é um IntersectionObserver (geometria
          // ao vivo), NÃO um ScrollTrigger posicional. O spacer do Hero pinado
          // desloca tudo abaixo dele; como esta timeline nasce dentro do
          // fontsProntas.then() (depois do refresh global do pin), a posição
          // cacheada do ScrollTrigger ficava stale e a foto não revelava — é a
          // REGRA da região abaixo do carrossel (rect ao vivo, nunca posicional).
          tl = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });
          tl.to(img, { autoAlpha: 1, scale: 1, xPercent: 0, duration: 1.1 });
          if (split) {
            tl.to(split.words, { yPercent: 0, duration: 0.9, stagger: 0.07 }, "-=0.5");
          }
          if (corpo) {
            tl.to(corpo, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");
          }

          // Dispara uma vez, quando o topo da mídia cruza ~78% da viewport
          // (mesmo ponto do antigo start "top 78%"), lendo a geometria real.
          observer = new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting)) {
                tl.play();
                observer?.disconnect();
                observer = null;
              }
            },
            { rootMargin: "0px 0px -22% 0px" }
          );
          observer.observe(media);
        });

        limpezas.push(() => {
          observer?.disconnect();
          tl?.kill();
          split?.revert();
        });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: media, start: "top 78%", toggleActions: "play none none none" },
      });

      // Blocos antigos (showcase do Hawk): assentamento original, intocado.
      const textEls = textBox ? Array.from(textBox.children) : [];
      gsap.set(media, { opacity: 0, scale: 1.08, xPercent: 6 });
      gsap.set(textEls, { opacity: 0, y: 24 });
      tl.to(media, { opacity: 1, scale: 1, xPercent: 0, duration: 1.0 })
        .to(textEls, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, "-=0.45");

      limpezas.push(() => { tl.scrollTrigger?.kill(); tl.kill(); });
    });

    return () => {
      cancelado = true;
      limpezas.forEach((fn) => fn());
    };
  }, [data]);

  // "Contato" do nav: rola até o CTA final deste case e dá um brilho no botão "Bora!"
  const goToCta = (e) => {
    e.preventDefault();
    const btn = ctaBtnRef.current;
    if (!btn) {
      // case sem CTA ainda → cai pro contato da home
      transitionTo("/#contato");
      return;
    }
    scrollPageTo(btn);
    if (prefersReducedMotion()) return;
    window.setTimeout(() => {
      // halo difuso (blur alto, spread baixo) que pulsa suave — sem anel duro
      gsap.fromTo(
        btn,
        { boxShadow: "0 0 0px 0px rgba(244,74,34,0)" },
        { boxShadow: "0 0 26px 3px rgba(244,74,34,0.5)", duration: 0.6, yoyo: true, repeat: 3, ease: "sine.inOut", clearProps: "boxShadow" }
      );
      gsap.fromTo(
        btn,
        { scale: 1 },
        { scale: 1.035, duration: 0.6, yoyo: true, repeat: 3, ease: "sine.inOut", clearProps: "scale" }
      );
    }, 650);
  };

  // Próximo projeto na lista visível (cicla pro primeiro no fim)
  const next = nextProject(slug);

  // Slug inexistente: volta para a lista de projetos
  if (!data) return <Navigate to="/projetos" replace />;

  const seo = getCaseSeo(slug);

  return (
    <div className="case-hawk">
      {seo && <Seo {...seo} />}

      {/* ── Seção 1 — Hero ─────────────────────────────────────── */}
      <section className="section case-hawk__hero" ref={heroRef}>
        <div
          className="container-x"
          style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}
        >
          <nav className="hero__nav" ref={navRef}>
            <a href="/" className="hero__logo" aria-label="Início">
              <img src="/LOGO.svg" alt="Victor Cardoso" className="hero__logo-mark" />
            </a>
            <div className="hero__nav-links">
              <button onClick={() => transitionTo("/")} className="hero__nav-link-btn">Início</button>
              <button onClick={() => transitionTo("/projetos")} className="hero__nav-link-btn">Projetos</button>
              <button onClick={() => transitionTo("/meu-processo")} className="hero__nav-link-btn">Meu processo</button>
              <button onClick={goToCta} className="hero__nav-link-btn">Contato</button>
            </div>

            {/* Começar padronizado com o resto do site: sempre leva pro /comecar
                (o "Contato" ao lado segue com o goToCta — rolar pro BORA! é papel dele) */}
            <button type="button" onClick={() => transitionTo("/comecar")} className="hero__talk-btn" aria-label="Começar">
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
            {/* Mobile: hambúrguer no lugar do COMEÇAR — abre o overlay global (Navbar) */}
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

          <div className="case-hawk__hero-body">
            <div className="case-hawk__hero-center">
              <div className="case-hawk__tags" ref={tagsRef}>
                {data.tags.map((tag) => (
                  <span className="case-hawk__tag-outer" key={tag}>
                    <span className="case-hawk__tag case-hawk__tag-inner">{tag}</span>
                  </span>
                ))}
              </div>
              <h1
                className="case-hawk__title"
                ref={titleRef}
                style={{ "--title-len": data.title.length }}
              >
                {data.title}
              </h1>
            </div>
            <p className="case-hawk__desc" ref={descRef}>
              {data.desc}
            </p>
          </div>
        </div>

        <div className="hero__wash" aria-hidden="true" />
      </section>

      {/* ── Seção 2 — Visão Geral ──────────────────────────────── */}
      <section className="section case-hawk__overview" ref={overviewRef}>
        <div className="container-x case-hawk__overview-grid">

          <div className="case-hawk__overview-left">
            <span className="case-hawk__info-label">INFORMAÇÕES</span>
            <h2 className="case-hawk__overview-heading">
              PROJETO
              <em>VISÃO</em>
            </h2>
          </div>

          <div className="case-hawk__overview-right">
            <div className="case-hawk__block">
              <h3 className="case-hawk__block-title">DESAFIO</h3>
              <p>{data.challenge}</p>
            </div>
            <div className="case-hawk__block">
              <h3 className="case-hawk__block-title">SOLUÇÃO</h3>
              <p>{data.solution}</p>
            </div>
            <div className="case-hawk__block">
              <h3 className="case-hawk__block-title">RESULTADOS</h3>
              <p>{data.results}</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Blocos de conteúdo (andar de baixo, data-driven) ───── */}
      {data.blocks?.length > 0 && (
        <div className="case-blocks" ref={blocksRef}>
          {data.blocks.map((block, i) => {
            if (block.type === "shot") {
              const caption = (block.label || block.caption) ? (
                <figcaption className={`case-shot__caption${block.captionTop ? " case-shot__caption--top" : ""}`}>
                  {block.label && (
                    <span className="case-shot__caption-label">{block.label}</span>
                  )}
                  {block.label && block.caption && (
                    <span className="case-shot__caption-sep"> — </span>
                  )}
                  {block.caption && (
                    <span className="case-shot__caption-text">{block.caption}</span>
                  )}
                </figcaption>
              ) : null;
              return (
                <section className="section case-shot" key={i}>
                  <div className="container-x">
                    <div className="case-shot__inner">
                      {block.eyebrow && (
                        <p className="eyebrow case-shot__eyebrow" data-reveal>{block.eyebrow}</p>
                      )}
                      <figure className={`case-shot__figure${block.framed ? " case-shot__figure--framed" : ""}`} data-reveal>
                        {block.captionTop && caption}
                        <img
                          className={`case-shot__img${block.framed ? " case-shot__img--framed" : ""}`}
                          src={block.image}
                          alt={block.alt || ""}
                          style={block.ratio ? { aspectRatio: block.ratio } : undefined}
                          loading="lazy"
                        />
                        {!block.captionTop && caption}
                      </figure>
                    </div>
                  </div>
                </section>
              );
            }
            if (block.type === "compare") {
              return (
                <section className="section case-compare-section" key={i}>
                  <div className="container-x">
                    <div className="case-compare__wrap" data-reveal>
                      {(block.title || block.description || block.caption) && (
                        <div className="case-compare__head">
                          {block.title && <h3 className="case-compare__title">{block.title}</h3>}
                          {block.description && <p className="case-compare__desc">{block.description}</p>}
                          {block.caption && <span className="case-compare__hint">{block.caption}</span>}
                        </div>
                      )}
                      <CaseCompare
                        before={block.before}
                        after={block.after}
                        beforeAlt={block.beforeAlt}
                        afterAlt={block.afterAlt}
                        beforeLabel={block.beforeLabel}
                        afterLabel={block.afterLabel}
                        ratio={block.ratio}
                        url={block.url}
                        start={block.start}
                        mockup={block.mockup}
                      />
                    </div>
                  </div>
                </section>
              );
            }
            if (block.type === "reveal") {
              return (
                <CaseReveal
                  key={i}
                  image={block.image}
                  imageMobile={block.imageMobile}
                  alt={block.alt}
                  ratio={block.ratio}
                  mobileRatio={block.mobileRatio}
                  revealInset={block.revealInset}
                  title={block.title}
                  body={block.body}
                />
              );
            }
            if (block.type === "showcase") {
              return (
                <section className="section case-showcase" key={i}>
                  <div className="container-x">
                    <div className="case-showcase__grid">
                      <figure className="case-showcase__media" data-entrance="media">
                        <img
                          className="case-showcase__img"
                          src={block.image}
                          alt={block.alt || ""}
                          style={block.ratio ? { aspectRatio: block.ratio } : undefined}
                          loading="lazy"
                        />
                      </figure>
                      <div className="case-showcase__text" data-entrance="text">
                        {block.title && <h3 className="case-showcase__title">{block.title}</h3>}
                        {block.body && <p className="case-showcase__body">{block.body}</p>}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }
            if (block.type === "split") {
              const mediaAttr = block.entrance ? { "data-entrance": "media" } : { "data-reveal": true };
              const textAttr = block.entrance ? { "data-entrance": "text" } : { "data-reveal": true };
              return (
                <section
                  className={`section case-split${block.variant === "photo" ? " case-split--photo" : ""}${block.reverse ? " case-split--reverse" : ""}`}
                  key={i}
                >
                  <div className="container-x">
                    <div className="case-split__grid">
                      <figure className="case-split__media" {...mediaAttr}>
                        <img
                          className={`case-split__img${block.rounded ? " case-split__img--rounded" : ""}`}
                          src={block.image}
                          alt={block.alt || ""}
                          style={block.ratio ? { aspectRatio: block.ratio } : undefined}
                          loading="lazy"
                        />
                      </figure>
                      <div className="case-split__text" {...textAttr}>
                        {block.title && <h3 className="case-split__title">{block.title}</h3>}
                        {block.body && <p className="case-split__body">{block.body}</p>}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }
            if (block.type === "cta") {
              return (
                <section className="section case-cta" key={i}>
                  <div className="container-x">
                    <div className="case-cta__card" data-reveal>
                      {block.title && <h3 className="case-cta__title">{block.title}</h3>}
                      {block.body && <p className="case-cta__body">{block.body}</p>}
                      {block.buttonHref && (
                        <a
                          className="btn btn--accent case-cta__btn"
                          href={block.buttonHref}
                          target="_blank"
                          rel="noreferrer"
                          // Glow do "Contato" da nav: só em botão de CONTATO (wa.me).
                          // CTA de produto (ex.: Flux Time) não recebe o ref — sem
                          // botão de contato no case, goToCta cai no /#contato.
                          ref={block.buttonHref.includes("wa.me") ? ctaBtnRef : undefined}
                        >
                          {block.buttonLabel || "Falar"}
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              );
            }
            return null;
          })}
        </div>
      )}

      <div className="case-foot">
        <a
          className="footer__back-top"
          href="#"
          aria-label="Voltar ao topo"
          onClick={(e) => { e.preventDefault(); scrollPageTo(0); }}
        >
          ↑
        </a>
        {next && (
          <a
            className="case-next"
            href={next.href}
            aria-label={`Próximo projeto: ${next.name}`}
            onClick={(e) => { e.preventDefault(); transitionTo(next.href); }}
          >
            <span className="case-next__label">Próximo projeto</span>
            <span className="case-next__name">
              {next.name}
              <span className="case-next__arrow" aria-hidden="true">→</span>
            </span>
          </a>
        )}
      </div>

    </div>
  );
}

export default Case;
