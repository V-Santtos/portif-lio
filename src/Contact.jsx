import { useRef } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect, useTitleReveal } from "./lib.jsx";

function Contact() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const infoRef = useRef(null);
  const waRef = useRef(null);

  useTitleReveal(titleRef, { trigger: sectionRef, start: "top 70%", stagger: 0.09 });

  // Pulse discreto no WhatsApp quando o link "Contato" da navbar leva até aqui.
  useIsoLayoutEffect(() => {
    const highlight = () => {
      const el = waRef.current;
      if (!el || prefersReducedMotion()) return;
      window.setTimeout(() => {
        gsap.fromTo(
          el,
          { color: "#161616" },
          { color: "#F44A22", duration: 0.42, yoyo: true, repeat: 5, ease: "sine.inOut", clearProps: "color" }
        );
        gsap.fromTo(
          el,
          { scale: 1 },
          { scale: 1.08, duration: 0.42, yoyo: true, repeat: 5, ease: "sine.inOut", transformOrigin: "left center", clearProps: "scale" }
        );
      }, 700);
    };
    window.addEventListener("contact:highlight", highlight);
    return () => window.removeEventListener("contact:highlight", highlight);
  }, []);

  useIsoLayoutEffect(() => {
    if (!infoRef.current) return;
    if (prefersReducedMotion()) return;
    const els = infoRef.current.querySelectorAll("[data-reveal]");
    gsap.set(els, { opacity: 0, y: 28 });
    gsap.to(els, {
      opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1,
      scrollTrigger: { trigger: sectionRef.current, start: "top 60%", toggleActions: "play none none none" },
    });
  }, []);

  return (
    <section className="section contact" id="contato" ref={sectionRef} data-screen-label="06 Contato">
      <div className="contact__title-strip">
        <h2 className="contact__title" ref={titleRef}>
          <span className="word"><span>Bora</span></span>{" "}
          <span className="word"><span>construir</span></span>{" "}
          <span className="word"><span>juntos!</span></span>
        </h2>
      </div>

      <div className="container-x contact__info" ref={infoRef}>
        <div data-reveal>
          <span className="contact__field-label">E-mail</span>
          <a className="contact__email" href="mailto:sanntos.creator@gmail.com">
            sanntos.creator@gmail.com
          </a>
        </div>
        <div data-reveal>
          <span className="contact__field-label">Redes</span>
          <div className="contact__social">
            <a href="#" aria-label="LinkedIn">
              <span>LinkedIn</span>
              <span className="arrow" aria-hidden="true">↗</span>
            </a>
            <a href="#" aria-label="Instagram">
              <span>Instagram</span>
              <span className="arrow" aria-hidden="true">↗</span>
            </a>
            <a href="https://wa.me/5533984246770" aria-label="WhatsApp" ref={waRef}>
              <span>WhatsApp</span>
              <span className="arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>

      <footer className="footer container-x">
        <span>© 2026 Victor Cardoso - Todos os direitos reservados.</span>
        <span>Construa o caminho.</span>
      </footer>

      <a
        className="footer__back-top"
        href="#"
        aria-label="Voltar ao topo"
        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      >
        ↑
      </a>
    </section>
  );
}

export default Contact;
