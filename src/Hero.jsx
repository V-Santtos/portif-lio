import { useRef } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect, fadeJump } from "./lib.jsx";
import { usePageTransition } from "./PageTransition.jsx";

function Hero({ ready }) {
  const { transitionTo } = usePageTransition();

  // Links da navbar como âncoras de seção (Projetos continua sendo rota).
  const scrollToId = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  // Contato: salto até o final suavizado por um fade (não atravessa o scrub do
  // carrossel, que dá impressão de travamento) e sinaliza o destino no WhatsApp.
  const goToContact = () => {
    fadeJump(() => {
      document.getElementById("contato")?.scrollIntoView();
      window.dispatchEvent(new CustomEvent("contact:highlight"));
    });
  };

  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const metaLeftRef = useRef(null);
  const metaRightRef = useRef(null);
  const navRef = useRef(null);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const titleSpans = titleRef.current?.querySelectorAll(".word > span");
    if (titleSpans) gsap.set(titleSpans, { y: 0, yPercent: 110 });
    gsap.set([metaLeftRef.current, metaRightRef.current], { y: 16, opacity: 0 });
    gsap.set(navRef.current, { y: -16, opacity: 0 });
  }, []);

  useIsoLayoutEffect(() => {
    if (!ready) return;
    const titleSpans = titleRef.current.querySelectorAll(".word > span");

    const reduce = prefersReducedMotion();
    if (reduce) {
      gsap.set(titleSpans, { y: 0, yPercent: 0, clearProps: "transform" });
      [metaLeftRef.current, metaRightRef.current, navRef.current].forEach((el) => {
        if (el) {
          el.style.opacity = 1;
          el.style.transform = "none";
        }
      });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.05 });

    tl.to(navRef.current, { y: 0, opacity: 1, duration: 0.6 });
    tl.to(
      titleSpans,
      { y: 0, yPercent: 0, duration: 1.0, stagger: 0.085 },
      "-=0.35"
    );
    tl.to(metaLeftRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.55");
    tl.to(metaRightRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.65");

    return () => tl.kill();
  }, [ready]);

  return (
    <section className="section hero" ref={sectionRef} data-screen-label="01 Hero">
      <div className="container-x" style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        <nav className="hero__nav" ref={navRef}>
          <a href="#" className="hero__logo" aria-label="Victor Cardoso - inicio">
            <img src="/LOGO.svg" alt="Victor Cardoso" className="hero__logo-mark" />
          </a>
          <div className="hero__nav-links">
            <button onClick={() => transitionTo("/projetos")} className="hero__nav-link-btn">Projetos</button>
            <button onClick={() => scrollToId("auto")} className="hero__nav-link-btn">Automatize</button>
            <button onClick={goToContact} className="hero__nav-link-btn">Contato</button>
          </div>
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
        </nav>

        <div className="hero__main">
          <h1 className="hero__title" ref={titleRef}>
            <span className="hero__line">
              <span className="word"><span>PÁGINAS</span></span>{" "}
              <span className="word"><span>QUE</span></span>{" "}
              <span className="word accent"><span>CONVERTEM.</span></span>
            </span>
            <span className="hero__line">
              <span className="word"><span>SISTEMAS</span></span>{" "}
              <span className="word"><span>QUE</span></span>{" "}
              <span className="word"><span>ESCALAM.</span></span>
            </span>
          </h1>
        </div>

        <div className="hero__meta">
          <div className="left" ref={metaLeftRef}>
            Sistemas inteligentes para sua rotina,<br />
            suas ideias e seu negocio.
          </div>
          <div className="right" ref={metaRightRef}>
            - Construa o caminho.
          </div>
        </div>
      </div>

      <div className="hero__wash" aria-hidden="true"></div>
    </section>
  );
}

export default Hero;
