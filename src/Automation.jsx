import { useRef } from "react";
import { gsap, useIsoLayoutEffect, prefersReducedMotion } from "./lib.jsx";
import { usePageTransition } from "./PageTransition.jsx";

const CARDS = [
  {
    title: "Rotina",
    desc: "Uma atendente qualifica cada cliente e faz o pré-atendimento. Seu time recebe as informações certas pra continuar de forma inteligente. Se o volume crescer, construo o CRM capaz de organizar tudo.",
  },
  {
    title: "Processos",
    desc: "Processos travados, tarefas manuais e rotinas desorganizadas não precisam fazer parte do seu dia. Eu construo soluções pensadas para tornar tudo mais simples e eficiente .",
  },
  {
    title: "Sua ideia",
    desc: "Tem uma ideia diferente dessas? Podemos construir juntos algo sob medida. Você me conta a ideia e tiramos ela do papel.",
  },
];

function Automation() {
  const { transitionTo } = usePageTransition();
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const wordBoxRef = useRef(null);
  const wordOutRef = useRef(null);
  const wordInRef = useRef(null);
  const ctaBtnRef = useRef(null);
  const ctaIconRef = useRef(null);
  const ctaLabelRef = useRef(null);
  const ctaCircleRef = useRef(null);
  const ctaArrowRef = useRef(null);
  const ctaLine1Ref = useRef(null);
  const ctaLine2Ref = useRef(null);
  const ctaLineLeftRef = useRef(null);
  const ctaLineRightRef = useRef(null);

  // Hover na área toda (título + botão circular), fiel à referência: título
  // desliza 8% mascarado (linha 2 com 75ms de atraso), círculo enche e
  // escala, seta desliza na diagonal, linhas laterais esticam e acendem.
  // Estado contínuo — desfaz tudo ao sair (mesmo comportamento do original).
  const handleCtaEnter = () => {
    if (prefersReducedMotion()) return;
    const ease = "power3.out";
    gsap.to(ctaLine1Ref.current, { yPercent: -8, duration: 0.5, ease });
    gsap.to(ctaLine2Ref.current, { yPercent: -8, duration: 0.5, ease, delay: 0.075 });
    gsap.to(ctaCircleRef.current, {
      scale: 1.1,
      backgroundColor: "#FEF8E8",
      borderColor: "#FEF8E8",
      color: "#161616",
      duration: 0.5,
      ease,
    });
    gsap.to(ctaArrowRef.current, { x: 2, y: -2, duration: 0.5, ease });
    gsap.to([ctaLineLeftRef.current, ctaLineRightRef.current], { scaleX: 1.5, opacity: 1, duration: 0.5, ease });
  };

  const handleCtaLeave = () => {
    if (prefersReducedMotion()) return;
    const ease = "power3.out";
    gsap.to(ctaLine1Ref.current, { yPercent: 0, duration: 0.5, ease });
    gsap.to(ctaLine2Ref.current, { yPercent: 0, duration: 0.5, ease });
    gsap.to(ctaCircleRef.current, {
      scale: 1,
      backgroundColor: "transparent",
      borderColor: "rgba(254, 248, 232, 0.35)",
      color: "#FEF8E8",
      duration: 0.5,
      ease,
    });
    gsap.to(ctaArrowRef.current, { x: 0, y: 0, duration: 0.5, ease });
    gsap.to([ctaLineLeftRef.current, ctaLineRightRef.current], { scaleX: 1, opacity: 0.5, duration: 0.5, ease });
  };

  // Sequência de chegada no "Falar no WhatsApp" quando o link Contato da
  // navbar leva até aqui (mesmo evento do glow do rodapé). Ordem: 1) o ícone
  // balança (sino, 0.5s) — dispara junto do clique; 2) quase no fim do sino
  // (80% dele, 0.4s), as letras da label ondulam em stagger; 3) por baixo dos
  // dois, o halo+escala do botão pulsa 2,5 vezes (termina no pico, não no
  // repouso — combinado assim) e some.
  useIsoLayoutEffect(() => {
    // Atraso antes do pacote inteiro começar — clicar não deve disparar a
    // animação "no mesmo instante" (fica mecânico); um respiro pequeno antes
    // do sino é o que lê como natural.
    const START_DELAY = 0.12;

    const highlight = () => {
      const btn = ctaBtnRef.current;
      const icon = ctaIconRef.current;
      const label = ctaLabelRef.current;
      if (!btn || prefersReducedMotion()) return;

      // 1) sino — balanço rápido
      if (icon) {
        gsap.timeline({ delay: START_DELAY })
          .to(icon, { rotate: -14, duration: 0.1, ease: "sine.inOut" })
          .to(icon, { rotate: 11, duration: 0.1, ease: "sine.inOut" })
          .to(icon, { rotate: -8, duration: 0.1, ease: "sine.inOut" })
          .to(icon, { rotate: 4, duration: 0.1, ease: "sine.inOut" })
          .to(icon, { rotate: 0, duration: 0.1, ease: "sine.inOut", clearProps: "rotate" });
      }

      // 2) letras — sobe e assenta numa ÚNICA passada por letra (keyframes,
      // sem yoyo/repeat). yoyo+repeat com stagger em vários alvos faz o GSAP
      // tratar a sequência toda como um bloco: a "ida" roda staggered numa
      // ordem e o "yoyo" reroda o BLOCO INTEIRO na ordem invertida — vira uma
      // segunda onda visível (o "vai e volta"/tremor que via). Com keyframes
      // cada letra sobe e desce sozinha, uma vez só, sem essa réplica.
      if (label) {
        const letters = label.querySelectorAll(".auto__cta-letter");
        gsap.delayedCall(START_DELAY + 0.4, () => {
          gsap.fromTo(
            letters,
            { y: 0 },
            {
              keyframes: { "0%": { y: 0 }, "50%": { y: -7 }, "100%": { y: 0 } },
              duration: 0.5,
              stagger: 0.035,
              ease: "sine.inOut",
              clearProps: "y",
            }
          );
        });
      }

      // 3) halo difuso (blur alto, spread baixo) + escala — 2,5 ciclos de 1.1s
      // terminando no pico, mais uma descida final no MESMO ritmo das pernas.
      //
      // 🔴 `transition` do CSS tem que sair enquanto o GSAP roda. O botão tem
      // `transition: transform .22s, box-shadow .22s` (existe pro :hover). O
      // GSAP reescreve o transform a cada frame e cada escrita REINICIA uma
      // interpolação de .22s por cima: o valor renderizado nunca alcança o
      // alvo (medido: GSAP em 1.080 / tela em 1.054), chega ~200ms atrasado e
      // treme — e no fim o clearProps devolve o controle pro transition, que
      // faz a volta com o easing DELE. Era a causa do tremor no texto e do
      // retorno robótico. Restaurado no fim pro :hover continuar valendo.
      const restShadow = "0 2px 10px rgba(0, 0, 0, 0.18)";
      btn.style.transition = "none";

      const pulseTl = gsap.timeline({
        delay: START_DELAY,
        onComplete: () => { btn.style.transition = ""; },
      });
      pulseTl.fromTo(
        btn,
        { boxShadow: "0 0 0px 0px rgba(244,74,34,0)" },
        { boxShadow: "0 0 40px 9px rgba(244,74,34,0.5)", duration: 1.1, yoyo: true, repeat: 4, ease: "sine.inOut" },
        0
      );
      pulseTl.fromTo(btn, { scale: 1 }, { scale: 1.08, duration: 1.1, yoyo: true, repeat: 4, ease: "sine.inOut" }, 0);
      // descida final com a MESMA duração/ease das pernas do pulso: o olho já
      // aprendeu esse ritmo, então cortar em 0.5s power2.out (como estava) lê
      // como freada mecânica. Aqui ela é só a última meia-onda, assentando.
      pulseTl.to(btn, { boxShadow: restShadow, scale: 1, duration: 1.1, ease: "sine.inOut", clearProps: "boxShadow,scale" });
    };
    window.addEventListener("contact:highlight", highlight);
    return () => window.removeEventListener("contact:highlight", highlight);
  }, []);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const wordBox = wordBoxRef.current;
    const wordOut = wordOutRef.current;
    const wordIn = wordInRef.current;
    if (!wordBox || !wordOut || !wordIn) return;

    const charsOut = wordOut.querySelectorAll(".auto-char");
    const charsIn = wordIn.querySelectorAll(".auto-char");

    gsap.set(charsIn, { yPercent: 100 });

    const measureBoxWidths = () => {
      const styles = window.getComputedStyle(wordBox);
      const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const outWidth = wordOut.getBoundingClientRect().width;
      const inWidth = wordIn.getBoundingClientRect().width;

      return {
        start: Math.ceil(outWidth + paddingX),
        end: Math.ceil(inWidth + paddingX),
      };
    };

    const applyStartWidth = () => {
      const widths = measureBoxWidths();
      gsap.set(wordBox, { width: widths.start });
      return widths;
    };

    let widths = applyStartWidth();
    let setupCancelled = false;

    // Timeline REVERSÍVEL do swap MAPEADO→AUTOMATIZADO, montada uma vez e
    // pausada no início. A entrada automática dá play() (comportamento atual,
    // intacto). O clique na tarja alterna play() ↔ reverse() — o reverse é o
    // inverso exato da animação (mesmos caminhos), sem 2ª animação.
    let swapTl = null;
    let atEnd = false; // false = "mapeado" visível · true = "automatizado."

    const buildSwap = () => {
      widths = measureBoxWidths();
      gsap.set(wordBox, { width: widths.start });
      gsap.set(charsOut, { yPercent: 0 });
      gsap.set(charsIn, { yPercent: 100 });
      const tl = gsap.timeline({ paused: true });
      tl.to(wordBox, { width: widths.end, duration: 0.45, ease: "power2.inOut" }, 0);
      tl.to(charsOut, { yPercent: -120, duration: 0.35, stagger: 0.025, ease: "power2.in" }, 0);
      tl.to(charsIn, { yPercent: 0, duration: 0.5, stagger: 0.025, ease: "power2.out" }, 0.08);
      return tl;
    };

    // Entrada automática (chamada pela sequência, one-shot pela própria seq).
    const playWordSwap = () => {
      if (!swapTl) swapTl = buildSwap();
      swapTl.play();
      atEnd = true;
    };

    // Clique: alterna a palavra. SEM indicar que é clicável — só pra quem
    // clicar (perdeu a 1ª palavra ou curiosidade). Trava de 1s por interação:
    // a anim dura ~0.5s, o lock cobre + dá um respiro, sem spam.
    let clickLocked = false;
    let unlockTimer = null;
    const onWordClick = () => {
      if (clickLocked) return;
      if (!swapTl) swapTl = buildSwap();
      clickLocked = true;
      if (atEnd) { swapTl.reverse(); atEnd = false; }
      else { swapTl.play(); atEnd = true; }
      unlockTimer = setTimeout(() => { clickLocked = false; }, 1000);
    };
    wordBox.addEventListener("click", onWordClick);

    document.fonts?.ready.then(() => {
      if (!setupCancelled && !swapTl) {
        widths = applyStartWidth();
      }
    });

    const onResize = () => {
      widths = measureBoxWidths();
      if (swapTl) {
        // rebuild preservando o estado atual (largura da caixa muda com a fonte)
        swapTl.kill();
        swapTl = buildSwap();
        if (atEnd) swapTl.progress(1);
      } else {
        gsap.set(wordBox, { width: widths.start });
      }
    };
    window.addEventListener("resize", onResize);

    // Sequência da seção: entrada do título (reveal por máscara, palavra a
    // palavra — assinatura do site) → subtítulo sobe em fade → beat → swap
    // da tarja. Dispara quando o TÍTULO está visível de verdade: rect medido
    // ao vivo a cada scroll (imune ao spacer do pin do carrossel, mesma
    // técnica da Bridge). Vale pros dois ambientes — no desktop o scroll
    // pós-handoff da Bridge aciona o check.
    const title = titleRef.current;
    const intro = sectionRef.current?.querySelector(".auto__intro");
    const cards = sectionRef.current?.querySelectorAll(".auto__card") ?? [];
    const automationSection = sectionRef.current;
    const wordSpans = title ? title.querySelectorAll(".word > span") : [];

    // 135% (e não 110%): o til do Ã de PADRÃO sobe além do corpo da letra
    // e com 110% a pontinha vazava pra dentro da máscara no estado escondido.
    gsap.set(wordSpans, { yPercent: 135 });
    if (intro) gsap.set(intro, { opacity: 0, y: 18 });

    // Os cards ficam logo abaixo da dobra quando o hero da Automation ocupa a
    // tela. Eles sobem dela na mesma linguagem de entrada vertical do site,
    // revelando primeiro Rotina, depois Processos e, por último, Sua ideia.
    // A geometria é medida ao vivo: depois do pin da Escada, uma posição de
    // ScrollTrigger capturada antes do handoff pode ficar stale.
    gsap.set(cards, { autoAlpha: 0, y: 96, willChange: "transform, opacity" });

    let cardsSequenceStarted = false;
    let cardsSequenceTl = null;
    const stopCardsVisibilityCheck = () => {
      window.removeEventListener("scroll", checkCardsVisible);
      gsap.ticker.remove(checkCardsVisible);
    };
    const playCardsSequence = () => {
      if (cardsSequenceStarted || !cards.length) return;
      cardsSequenceStarted = true;
      stopCardsVisibilityCheck();
      cardsSequenceTl = gsap.timeline();
      cardsSequenceTl.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.24,
        clearProps: "transform,opacity,visibility,willChange",
      });
    };

    const checkCardsVisible = () => {
      if (cardsSequenceStarted || !cards.length) return;
      // Durante a transição da Escada a seção vira uma camada fixed; nessa
      // janela a geometria dos cards não representa o que está na viewport.
      if (automationSection?.classList.contains("automation--handoff")) return;
      // Dispara quando a ponta da fileira chega à base da viewport. Como os
      // cards começam 96px abaixo, a entrada revela as pontas um de cada vez.
      if (cards[0].getBoundingClientRect().top > window.innerHeight * 0.9) return;
      playCardsSequence();
    };

    // No desktop, a Bridge emite este evento exatamente quando termina de
    // entregar a Automation e a tela fica parada no enquadramento do hero.
    // A cascata acontece AQUI: só as pontas dos cards estão dentro da viewport.
    // O observador por geometria abaixo continua apenas como fallback para
    // mobile, salto direto pelo menu ou restauração de scroll do navegador.
    const playCardsAtAutomationHandoff = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        playCardsSequence();
      }
    };
    window.addEventListener("automation:word-swap", playCardsAtAutomationHandoff);

    window.addEventListener("scroll", checkCardsVisible, { passive: true });
    // O ScrollSmoother continua movendo o conteúdo entre eventos de scroll.
    // O ticker garante que a entrada não perca a hora exata depois do handoff.
    gsap.ticker.add(checkCardsVisible);
    checkCardsVisible();

    let sequenceStarted = false;
    let sequenceTl = null;
    const playSequence = () => {
      if (sequenceStarted) return;
      sequenceStarted = true;
      sequenceTl = gsap.timeline();
      sequenceTl.to(wordSpans, {
        yPercent: 0,
        duration: 0.95,
        ease: "power3.out",
        stagger: 0.07,
      });
      if (intro) {
        sequenceTl.to(intro, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, "-=0.45");
      }
      sequenceTl.add(playWordSwap, "+=0.4");
    };

    const checkTitleVisible = () => {
      if (sequenceStarted || !title) return;
      const rect = title.getBoundingClientRect();
      // título "chegando": topo cruzou 75% da tela
      if (rect.top > window.innerHeight * 0.75) return;
      window.removeEventListener("scroll", checkTitleVisible);
      playSequence();
    };

    window.addEventListener("scroll", checkTitleVisible, { passive: true });
    checkTitleVisible();

    return () => {
      setupCancelled = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", checkTitleVisible);
      window.removeEventListener("scroll", checkCardsVisible);
      window.removeEventListener("automation:word-swap", playCardsAtAutomationHandoff);
      gsap.ticker.remove(checkCardsVisible);
      wordBox.removeEventListener("click", onWordClick);
      if (unlockTimer) clearTimeout(unlockTimer);
      if (sequenceTl) sequenceTl.kill();
      if (swapTl) swapTl.kill();
      if (cardsSequenceTl) cardsSequenceTl.kill();
    };
  }, []);

  return (
    <section className="section automation" id="auto" ref={sectionRef}>
      <div className="auto__hero">
        {/* Quebras controladas por breakpoint: desktop = "um padrão pode / ser [caixa]";
            mobile = "um padrão pode ser / [caixa]" — a caixa mora SOZINHA na última
            linha pra o swap MAPEADO→AUTOMATIZADO. nunca re-quebrar o parágrafo. */}
        {/* Palavras em máscara pro reveal de entrada (assinatura dos títulos
            do site). A tarja também entra mascarada e o swap roda DEPOIS da
            entrada, em sequência. */}
        <h2 className="auto__title" ref={titleRef}>
          <span className="word"><span>Tudo</span></span>{" "}
          <span className="word"><span>o</span></span>{" "}
          <span className="word"><span>que</span></span>{" "}
          <span className="word"><span>segue</span></span>
          <br />
          <span className="word"><span>um</span></span>{" "}
          <span className="word"><span>padrão</span></span>{" "}
          <span className="word"><span>pode</span></span>
          <br className="auto__br--desktop" />{" "}
          <span className="word"><span>ser</span></span>{" "}
          <br className="auto__br--mobile" />
          <span className="word word--box"><span>
          <span className="word-box" ref={wordBoxRef}>
            <span className="word-out" ref={wordOutRef}>
              {"mapeado".split("").map((ch, i) => (
                <span key={i} className="auto-char-wrap"><span className="auto-char">{ch}</span></span>
              ))}
            </span>
            <span className="word-in" ref={wordInRef}>
              {"automatizado.".split("").map((ch, i) => (
                <span key={i} className="auto-char-wrap"><span className="auto-char">{ch}</span></span>
              ))}
            </span>
          </span>
          </span></span>
        </h2>
        {/* Quebras mobile controladas: sem viúvas ("pode fazer." solto no fim de linha) */}
        <p className="auto__intro">
          Construo a ferramenta certa para dar vida às suas ideias, melhorar seus processos e otimizar seu negócio.
        </p>
      </div>

      <div className="auto__body">
        <div className="auto__cards">
          {CARDS.map((c, i) => {
            const isLast = i === CARDS.length - 1;
            return (
              <div
                className={`auto__card${isLast ? " auto__card--highlight" : ""}`}
                key={c.title}
              >
                <h3 className="auto__card-title">
                  <span>{c.title}</span>
                  {isLast && (
                    <svg
                      className="auto__idea-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 18h6" />
                      <path d="M10 22h4" />
                      <path d="M15.09 14c.18-.58.57-1.15 1.07-1.66A6 6 0 1 0 7.84 12.34c.48.49.89 1.08 1.07 1.66" />
                    </svg>
                  )}
                </h3>
                <p className="auto__card-desc">{c.desc}</p>
                {isLast && (
                  <a
                    href="https://wa.me/5533984246770"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="auto__cta-btn"
                    ref={ctaBtnRef}
                  >
                    <svg className="auto__cta-icon" ref={ctaIconRef} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                    </svg>
                    <span ref={ctaLabelRef}>
                      {"Falar no WhatsApp".split("").map((ch, i) =>
                        ch === " " ? " " : <span key={i} className="auto__cta-letter">{ch}</span>
                      )}
                    </span>
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <div className="auto__cta" onMouseEnter={handleCtaEnter} onMouseLeave={handleCtaLeave}>
          <p className="auto__cta-heading auto__cta-heading--split">
            <span className="auto__cta-heading-mask">
              <span className="auto__cta-heading-strong" ref={ctaLine1Ref}>Veja</span>
            </span>
            <span className="auto__cta-heading-muted-row">
              <span className="auto__cta-heading-line" ref={ctaLineLeftRef} aria-hidden="true" />
              <span className="auto__cta-heading-mask">
                <span className="auto__cta-heading-muted" ref={ctaLine2Ref}>de perto</span>
              </span>
              <span className="auto__cta-heading-line" ref={ctaLineRightRef} aria-hidden="true" />
            </span>
          </p>
          <button
            type="button"
            className="auto__cta-circle"
            aria-label="Ver projetos"
            onClick={() => transitionTo("/projetos")}
            ref={ctaCircleRef}
          >
            <svg ref={ctaArrowRef} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default Automation;
