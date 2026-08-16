import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, scrollPageTo, SplitText, useIsoLayoutEffect } from "./lib.jsx";
import { usePageTransition } from "./PageTransition.jsx";

const FAQS = [
  {
    question: "Para quem é este trabalho?",
    answers: [
      "Trabalho tanto com pessoas quanto com empresas e pequenos negócios. Posso desenvolver desde uma ferramenta pensada para facilitar uma necessidade específica do dia a dia até soluções para quem deseja otimizar processos ou construir uma presença digital mais forte. O ponto de partida é sempre entender o que precisa ser resolvido e criar algo que faça sentido para sua realidade.",
    ],
  },
  {
    question: "Para quem este trabalho não é indicado?",
    answers: [
      "Para quem espera uma entrega de alto nível sem um orçamento compatível com o que o projeto exige. Consigo adaptar escopo, prioridades e caminhos para diferentes investimentos, mas acredito que expectativa e orçamento precisam caminhar juntos. A ideia é encontrar a melhor solução possível dentro de uma realidade que faça sentido para os dois lados.",
    ],
  },
  {
    question: "Por que trabalhar com uma pessoa em vez de uma agência?",
    answers: [
      "Porque você fala diretamente com quem vai pensar e construir o seu projeto. Desde o início, eu entendo suas prioridades, acompanho cada etapa e mantenho você por dentro das decisões ao longo do processo. E essa proximidade não termina na entrega. Continuo disponível depois do projeto para ajustes, dúvidas e para o que precisar evoluir.",
    ],
  },
  {
    question: "Quanto tempo leva para desenvolver um projeto?",
    answers: [
      "Depende do que precisa ser construído. Um site institucional, um e-commerce ou uma ferramenta personalizada têm escopos e níveis de complexidade diferentes. Por isso, o prazo só é definido depois que eu entendo a necessidade, as funcionalidades e a dimensão do projeto. A partir daí, você recebe uma estimativa clara de tempo antes de começarmos.",
    ],
  },
  {
    question: "Você garante mais vendas ou resultados?",
    answers: [
      "Não existe como garantir um resultado isoladamente. Um site ou uma ferramenta bem construídos podem melhorar a experiência, tornar caminhos mais claros, comunicar melhor o valor do negócio e facilitar decisões. Tudo isso pode contribuir diretamente para melhores resultados.",
      "Mas o resultado final também depende do que acontece ao redor do projeto, como a oferta, o marketing, os processos internos e a própria entrega do negócio. Meu trabalho é construir uma parte forte desse conjunto, não prometer que ela sozinha vai resolver tudo.",
    ],
  },
  {
    question: "Como começamos?",
    answers: [
      "Você pode me chamar ou preencher o formulário contando um pouco sobre a sua ideia, mesmo que ela ainda não esteja totalmente definida. A partir daí, conversamos para entender o que você precisa, o que faz sentido construir e quais caminhos são possíveis. Com isso mais claro, preparo uma proposta com escopo, prazo e investimento.",
    ],
  },
];

function Contact({ showFaq = true, showCta = true }) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const infoRef = useRef(null);
  const waRef = useRef(null);
  const faqSectionRef = useRef(null);
  const faqListRef = useRef(null);
  const faqAnimationContextRef = useRef(null);
  const ctaRef = useRef(null);
  const titleStripRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);
  const { transitionTo } = usePageTransition();

  // Nome do rodapé: mesmo efeito do .footer__heading da referência — cada
  // letra sobe de baixo, presa ao scroll (lá são <path> de SVG, aqui chars do
  // SplitText). Os números são os dela: yPercent 100→0, dur .8, power1.out,
  // stagger amount .5, no intervalo "top bottom" → "bottom bottom".
  // O scrub:1 dela vira lerp por frame porque aqui, abaixo do carrossel,
  // ScrollTrigger posicional fica stale atrás do spacer do pin (Regras/01).
  useIsoLayoutEffect(() => {
    const el = titleRef.current;
    if (!el || prefersReducedMotion()) return;

    let split = null;
    let tl = null;
    let tick = null;
    let cancelado = false;

    // SplitText mede o texto pra montar as máscaras; antes da Bebas carregar
    // ele mede o fallback e as janelas nascem com altura errada.
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelado) return;

      split = SplitText.create(el, { type: "chars", mask: "chars" });

      // line-height 0.88 deixa a janela da máscara mais baixa que a letra e
      // corta o topo. Folga em cima compensada por margem negativa; embaixo
      // fica rente de propósito — é dali que a letra nasce.
      split.chars.forEach((char) => {
        const janela = char.parentNode;
        if (!janela) return;
        janela.style.paddingTop = "0.2em";
        janela.style.marginTop = "-0.2em";
      });

      gsap.set(split.chars, { yPercent: 100 });

      tl = gsap.timeline({ paused: true });
      tl.fromTo(
        split.chars,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.8, ease: "power1.out", stagger: { amount: 0.5 } }
      );

      let atual = 0;
      tick = () => {
        const rect = el.getBoundingClientRect();
        const alvo = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (rect.height || 1)));
        atual += (alvo - atual) * 0.06;
        tl.progress(atual);
      };
      gsap.ticker.add(tick);
    });

    return () => {
      cancelado = true;
      if (tick) gsap.ticker.remove(tick);
      tl?.kill();
      split?.revert();
    };
  }, []);

  const goToFooterLink = (path) => transitionTo(path);

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

  // Entrada do FAQ: a posição é observada ao vivo porque esta seção fica
  // depois dos pins da página. O IntersectionObserver só dispara; toda a
  // coreografia visual continua sendo feita pelo GSAP.
  useIsoLayoutEffect(() => {
    const section = faqSectionRef.current;
    if (!section || prefersReducedMotion()) return;

    let revealTl = null;
    const ctx = gsap.context(() => {
      const titleWords = section.querySelectorAll(".faq__title-word > span");
      const items = section.querySelectorAll(".faq__item");

      gsap.set(titleWords, { yPercent: 135 });
      gsap.set(items, { autoAlpha: 0, y: 34 });

      revealTl = gsap.timeline({ paused: true });
      revealTl.to(titleWords, {
        yPercent: 0,
        duration: 0.95,
        ease: "power3.out",
        stagger: 0.09,
      });
      revealTl.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.68,
        ease: "power3.out",
        stagger: 0.075,
        clearProps: "transform,opacity,visibility",
      }, "-=0.42");
    }, section);

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      revealTl?.play();
      observer.disconnect();
    }, { threshold: 0.14 });

    observer.observe(section);
    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  // Mesma razão do FAQ acima: esta seção fica depois dos pins, então quem
  // dispara é o IntersectionObserver, não um ScrollTrigger posicional.
  useIsoLayoutEffect(() => {
    const section = ctaRef.current;
    if (!section || prefersReducedMotion()) return;

    const card = section.querySelector(".home-cta__card");
    if (!card) return;

    gsap.set(card, { autoAlpha: 0, y: 40 });

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      gsap.to(card, {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      });
      observer.disconnect();
    }, { threshold: 0.18 });

    observer.observe(section);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(card);
    };
  }, [showCta]);

  // Estado inicial e contexto persistente do acordeão. As animações criadas
  // nos cliques entram neste contexto e são revertidas juntas na desmontagem.
  useIsoLayoutEffect(() => {
    const list = faqListRef.current;
    if (!list) return;

    const ctx = gsap.context(() => {
      gsap.set(list.querySelectorAll(".faq__panel"), { height: 0 });
      gsap.set(list.querySelectorAll(".faq__answer-body"), { autoAlpha: 0, y: 14 });
      gsap.set(list.querySelectorAll(".faq__icon"), { rotation: 0, transformOrigin: "50% 50%" });
    }, list);

    faqAnimationContextRef.current = ctx;
    return () => {
      faqAnimationContextRef.current = null;
      ctx.revert();
    };
  }, []);

  const handleFaqToggle = (index) => {
    const nextOpen = openFaq === index ? null : index;
    setOpenFaq(nextOpen);

    const list = faqListRef.current;
    if (!list) return;

    const animate = () => {
      const items = Array.from(list.querySelectorAll(".faq__item"));

      items.forEach((item, itemIndex) => {
        const panel = item.querySelector(".faq__panel");
        const body = item.querySelector(".faq__answer-body");
        const icon = item.querySelector(".faq__icon");
        if (!panel || !body || !icon) return;

        const shouldOpen = itemIndex === nextOpen;
        gsap.killTweensOf([panel, body, icon]);

        if (prefersReducedMotion()) {
          gsap.set(panel, { height: shouldOpen ? "auto" : 0 });
          gsap.set(body, { autoAlpha: shouldOpen ? 1 : 0, y: shouldOpen ? 0 : 14 });
          gsap.set(icon, { rotation: shouldOpen ? 180 : 0 });
          return;
        }

        // Congelamos a medida visÃ­vel antes de cada tween para que abrir,
        // fechar ou trocar de resposta seja contÃ­nuo, inclusive durante uma
        // interrupÃ§Ã£o da animaÃ§Ã£o anterior.
        const currentHeight = panel.getBoundingClientRect().height;
        const targetHeight = shouldOpen ? panel.scrollHeight : 0;
        gsap.set(panel, { height: currentHeight });

        if (shouldOpen) {
          gsap.to(panel, {
            height: targetHeight,
            duration: 0.58,
            ease: "power3.inOut",
            overwrite: true,
          });
          gsap.to(body, {
            autoAlpha: 1,
            y: 0,
            duration: 0.44,
            delay: 0.08,
            ease: "power3.out",
            overwrite: true,
          });
          gsap.to(icon, { rotation: 180, duration: 0.48, ease: "power3.inOut", overwrite: true });
        } else {
          gsap.to(panel, { height: 0, duration: 0.46, ease: "power3.inOut", overwrite: true });
          gsap.to(body, { autoAlpha: 0, y: 10, duration: 0.28, ease: "power2.in", overwrite: true });
          gsap.to(icon, { rotation: 0, duration: 0.42, ease: "power3.inOut", overwrite: true });
        }
      });
    };

    const ctx = faqAnimationContextRef.current;
    if (ctx) ctx.add(animate);
    else animate();
  };

  return (
    <section className="section contact" id="contato" ref={sectionRef} data-screen-label="06 Contato">
      {showFaq && (
        <div className="contact__faq" ref={faqSectionRef} aria-labelledby="faq-title">
          <h2 className="faq__title" id="faq-title">
            <span className="faq__title-word"><span>Tem</span></span>{" "}
            <span className="faq__title-word"><span>dúvidas?</span></span>
          </h2>

          <ul className="faq__list" ref={faqListRef}>
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              const number = String(index + 1);
              const triggerId = `faq-trigger-${index + 1}`;
              const panelId = `faq-panel-${index + 1}`;

              return (
                <li className={`faq__item${isOpen ? " is-open" : ""}`} key={faq.question}>
                  <h3 className="faq__question-heading">
                    <button
                      className="faq__trigger"
                      type="button"
                      id={triggerId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => handleFaqToggle(index)}
                    >
                      <span className="faq__question">
                        <span className="faq__number">(D{number})</span>
                        <span>{faq.question}</span>
                      </span>
                      <span className="faq__icon" aria-hidden="true">
                        <svg viewBox="0 0 20 20" fill="none">
                          <path d="M4.5 7.5 10 13l5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                  </h3>

                  <div
                    className="faq__panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    aria-hidden={!isOpen}
                  >
                    <div className="faq__answer-body">
                      {faq.answers.map((answer) => <p key={answer}>{answer}</p>)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {showCta && (
        <section className="home-cta" ref={ctaRef} aria-labelledby="home-cta-title">
          <div className="home-cta__card">
            <p className="home-cta__eyebrow">Trabalhe comigo</p>
            <div className="home-cta__main">
              <h2 className="home-cta__title" id="home-cta-title">
                Pronto para<br />construirmos <span>JUNTOS</span>?
              </h2>
              <a
                className="home-cta__btn"
                href="https://wa.me/5533984246770"
                target="_blank"
                rel="noreferrer"
              >
                Com certeza!
              </a>
            </div>
          </div>
        </section>
      )}

      <div className="container-x contact__info" ref={infoRef}>
        <div className="contact__col contact__col--menu" data-reveal>
          <span className="contact__field-label">(Menu)</span>
          <div className="contact__group">
            <button type="button" onClick={() => goToFooterLink("/")}>Início</button>
            <button type="button" onClick={() => goToFooterLink("/projetos")}>Projetos</button>
            <button type="button" onClick={() => goToFooterLink("/meu-processo")}>Meu processo</button>
            <button type="button" onClick={() => goToFooterLink("/comecar")}>Começar</button>
          </div>
        </div>

        <div className="contact__col contact__col--redes" data-reveal>
          <span className="contact__field-label">(Redes)</span>
          <div className="contact__group">
            <a href="https://www.instagram.com/victorcard.s/" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://wa.me/5533984246770" ref={waRef}>WhatsApp</a>
          </div>
        </div>

        <div className="contact__col contact__col--email" data-reveal>
          <span className="contact__field-label">(E-mail)</span>
          <div className="contact__group">
            <a href="mailto:sanntos.creator@gmail.com">sanntos.creator@gmail.com</a>
          </div>
        </div>
      </div>

      <div className="contact__title-strip" ref={titleStripRef}>
        <a
          className="footer__back-top footer__back-top--title"
          href="#"
          aria-label="Voltar ao topo"
          onClick={(e) => { e.preventDefault(); scrollPageTo(0); }}
        >
          &uarr;
        </a>
        <h2 className="contact__title" ref={titleRef}>Victor Cardoso</h2>
      </div>

      <a
        className="footer__back-top footer__back-top--legacy"
        href="#"
        aria-label="Voltar ao topo"
        onClick={(e) => { e.preventDefault(); scrollPageTo(0); }}
      >
        ↑
      </a>
    </section>
  );
}

export default Contact;
