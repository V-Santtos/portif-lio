import { useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { gsap, ScrollTrigger, SplitText, useIsoLayoutEffect, prefersReducedMotion } from "./lib.jsx";
import { usePageTransition } from "./PageTransition.jsx";
import { CASES } from "./casesData.js";

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
    document.documentElement.removeAttribute("data-booting");
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

    const pin = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      pin: true,
      pinSpacing: false,
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

  // "Contato" do nav: rola até o CTA final deste case e dá um brilho no botão "Bora!"
  const goToCta = (e) => {
    e.preventDefault();
    const btn = ctaBtnRef.current;
    if (!btn) {
      // case sem CTA ainda → cai pro contato da home
      transitionTo("/#contato");
      return;
    }
    btn.scrollIntoView({ behavior: "smooth", block: "center" });
    if (prefersReducedMotion()) return;
    window.setTimeout(() => {
      gsap.fromTo(
        btn,
        { boxShadow: "0 0 0 0 rgba(244,74,34,0.55)" },
        { boxShadow: "0 0 0 18px rgba(244,74,34,0)", duration: 1, repeat: 2, ease: "power2.out", clearProps: "boxShadow" }
      );
      gsap.fromTo(
        btn,
        { scale: 1 },
        { scale: 1.06, duration: 0.22, yoyo: true, repeat: 5, ease: "power1.inOut", clearProps: "scale" }
      );
    }, 650);
  };

  // Slug inexistente: volta para a lista de projetos
  if (!data) return <Navigate to="/projetos" replace />;

  return (
    <div className="case-hawk">

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
              <button onClick={goToCta} className="hero__nav-link-btn">Contato</button>
            </div>

            <button type="button" onClick={goToCta} className="hero__talk-btn" aria-label="Começar">
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
                      <figure className="case-shot__figure" data-reveal>
                        {block.captionTop && caption}
                        <img
                          className="case-shot__img"
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
            if (block.type === "split") {
              return (
                <section className="section case-split" key={i}>
                  <div className="container-x">
                    <div className="case-split__grid">
                      <figure className="case-split__media" data-reveal>
                        <img
                          className="case-split__img"
                          src={block.image}
                          alt={block.alt || ""}
                          style={block.ratio ? { aspectRatio: block.ratio } : undefined}
                          loading="lazy"
                        />
                      </figure>
                      <div className="case-split__text" data-reveal>
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
                          ref={ctaBtnRef}
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
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        >
          ↑
        </a>
      </div>

    </div>
  );
}

export default Case;
