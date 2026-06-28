import { useRef } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "./lib.jsx";
import { usePageTransition } from "./PageTransition.jsx";

function Hero({ ready }) {
  const { transitionTo } = usePageTransition();
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
            <a href="#lp">Páginas</a>
            <button onClick={() => transitionTo("/projetos")} className="hero__nav-link-btn">Projetos</button>
            <a href="#auto">Automacao</a>
            <a href="#contato">Contato</a>
          </div>
          <a
            href="#contato"
            className="btn btn--ghost btn--sm hero__nav-cta"
            aria-label="Ir para contato"
          >
            <span>Contato</span>
            <span className="dot-accent" aria-hidden="true"></span>
          </a>
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
