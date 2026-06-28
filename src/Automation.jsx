import { useRef } from "react";
import { gsap, useIsoLayoutEffect, prefersReducedMotion } from "./lib.jsx";

const CARDS = [
  {
    title: "Atendimento",
    desc: "Um atendente para você ou sua empresa que responde, tira dúvidas e qualifica seus leads. Disponível 24h por dia, sem depender de você.",
  },
  {
    title: "Processos",
    desc: "Um fluxo inteligente para cada parte da sua rotina. Resumos diários da sua caixa de e-mail, agenda com marcações e notificações em tempo real e muito mais.",
  },
  {
    title: "Comunicação",
    desc: "Mensagens automáticas via WhatsApp para sua base de leads. Follow-up, promoções e cobranças disparando no momento certo, para a pessoa certa. Sem mais dor de cabeça.",
  },
];

function Automation() {
  const sectionRef = useRef(null);
  const wordBoxRef = useRef(null);
  const wordOutRef = useRef(null);
  const wordInRef = useRef(null);

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
    let played = false;
    let setupCancelled = false;

    const playWordSwap = () => {
      if (played) return;
      played = true;
      widths = measureBoxWidths();
      const tl = gsap.timeline();
      tl.to(wordBox, { width: widths.end, duration: 0.45, ease: "power2.inOut" }, 0);
      tl.to(charsOut, { yPercent: -120, duration: 0.35, stagger: 0.025, ease: "power2.in" }, 0);
      tl.to(charsIn, { yPercent: 0, duration: 0.5, stagger: 0.025, ease: "power2.out" }, 0.08);
    };

    document.fonts?.ready.then(() => {
      if (!setupCancelled && !played) {
        widths = applyStartWidth();
      }
    });

    const onResize = () => {
      widths = measureBoxWidths();
      gsap.set(wordBox, { width: played ? widths.end : widths.start });
    };
    window.addEventListener("resize", onResize);

    // Triggered by Bridge after handoff completes.
    const onWordSwap = () => gsap.delayedCall(1.6, playWordSwap);
    window.addEventListener("automation:word-swap", onWordSwap, { once: true });

    return () => {
      setupCancelled = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("automation:word-swap", onWordSwap);
    };
  }, []);

  return (
    <section className="section automation" ref={sectionRef}>
      <div className="auto__hero">
        <h2 className="auto__title">
          Tudo o que segue<br />
          um padrão pode<br />
          ser{" "}
          <span className="word-box" ref={wordBoxRef}>
            <span className="word-out" ref={wordOutRef}>
              {"melhorado".split("").map((ch, i) => (
                <span key={i} className="auto-char-wrap"><span className="auto-char">{ch}</span></span>
              ))}
            </span>
            <span className="word-in" ref={wordInRef}>
              {"automatizado.".split("").map((ch, i) => (
                <span key={i} className="auto-char-wrap"><span className="auto-char">{ch}</span></span>
              ))}
            </span>
          </span>
        </h2>
        <p className="auto__intro">
          Processos, tarefas, ideias — se existe padrão, existe automação.
          <br />Eu monto o sistema. Você foca no que só você pode fazer.
        </p>
      </div>

      <div className="auto__body">
        <div className="auto__cards">
          {CARDS.map((c) => (
            <div className="auto__card" key={c.title}>
              <h3 className="auto__card-title">{c.title}</h3>
              <p className="auto__card-desc">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="auto__cta">
          <p className="auto__cta-heading">Tem uma ideia diferente?</p>
          <p className="auto__cta-copy">
            A verdade é que as possibilidades são infinitas.
            <br />Me conta o que você gostaria de automatizar.
          </p>
          <a href="#contact" className="auto__cta-btn">Falar no WhatsApp</a>
        </div>
      </div>
    </section>
  );
}

export default Automation;
