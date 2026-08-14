import { useRef } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "./lib.jsx";
import aboutPhoto from "../asset/about-card.jpg";

function About() {
  const sectionRef = useRef(null);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const els = sectionRef.current?.querySelectorAll("[data-reveal]");
    if (!els?.length) return;

    gsap.set(els, { opacity: 0, y: 28 });

    // Timeline PAUSADA + IntersectionObserver. Esta seção mora ABAIXO do
    // carrossel: ScrollTrigger posicional guarda a posição do alvo na hora em
    // que é criado, e o spacer do pin do Hero deixa esse número stale — o
    // reveal simplesmente não dispara, sem erro no console (Regras/01).
    const tl = gsap.timeline({ paused: true });
    tl.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
    });

    let observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          tl.play();
          observer?.disconnect();
          observer = null;
        }
      },
      { rootMargin: "0px 0px -22% 0px" }
    );
    observer.observe(sectionRef.current);

    return () => {
      observer?.disconnect();
      tl.kill();
    };
  }, []);

  return (
    <section className="section about" id="sobre" ref={sectionRef} data-screen-label="05 Sobre">
      {/* Hairline única: desce alinhada ao botão circular da Automation
          ("Veja de perto") e pousa na letra "r" de "sobre". Fica pendurada na
          SEÇÃO, não no pôster: o pôster é alinhado à esquerda e o botão é
          centrado na página — dentro do pôster ela sairia do eixo. */}
      <span className="about__rule about__rule--top" aria-hidden="true" data-reveal />

      <div className="about__poster">
        <h2 className="about__title" data-reveal>
          <span className="about__title-line">
            <span className="about__word">sobre</span>
          </span>
          {/* A foto encaixa logo depois do ponto de "mim.", com a base na
              linha de base do texto — não é empurrada até a margem direita. */}
          <span className="about__title-line about__title-line--2">
            <span className="about__word">mim.</span>
            <span className="about__photo">
              <img src={aboutPhoto} alt="Victor Cardoso" />
            </span>
          </span>
        </h2>

        <div className="about__foot">
          <h3 className="about__intro" data-reveal>Prazer em te conhecer!</h3>
          <p className="about__body" data-reveal>
            Opa! Meu nome é Victor. Eu crio sites que posicionam o seu negócio
            como a escolha óbvia — sem enrolação, sem promessas vazias. A
            maioria dos sites de pequenas empresas parecem feitos às pressas.
            Confusos, genéricos, que não convencem ninguém. Eu crio sites que
            comunicam com clareza, transmitem confiança e fazem o "sim"
            parecer natural.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
