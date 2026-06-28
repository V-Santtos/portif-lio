import { useRef } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "./lib.jsx";
import AboutCard from "./AboutCard.jsx";
import aboutCardImage from "../asset/about-card.jpg";

function About() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const els = sectionRef.current?.querySelectorAll("[data-reveal]");
    if (!els?.length) return;
    gsap.set(els, { opacity: 0, y: 28 });
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        toggleActions: "play none none none",
      },
    });
  }, []);

  return (
    <section className="section about" id="sobre" ref={sectionRef} data-screen-label="05 Sobre">
      <div className="container-x about__inner">
        <h2 className="section-title about__title" ref={titleRef}>
          <span className="word"><span>Sobre</span></span>
        </h2>

        <div className="about__columns">
          <div className="about__col-left">
            <p data-reveal>
              Opa! Meu nome é Victor. Eu crio sites que posicionam o seu negócio
              como a escolha óbvia — sem enrolação, sem promessas vazias.
            </p>
          </div>

          <AboutCard
            imageUrl={aboutCardImage}
            imageAlt="Victor Cardoso"
          />

          <div className="about__col-right">
            <p data-reveal>
              A maioria dos sites de pequenas empresas parecem feitos às pressas.
              Confusos, genéricos, que não convencem ninguém. Eu crio sites que
              comunicam com clareza, transmitem confiança e fazem o "sim" parecer
              natural.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
