import { useRef } from "react";
import { gsap, useIsoLayoutEffect, prefersReducedMotion } from "./lib.jsx";

const CARDS = [
  {
    title: "Atendimento",
    desc: "Um atendente para você ou sua empresa que responde, tira dúvidas e qualifica seus leads. Disponível 24h por dia, sem depender de você.",
  },
  {
    title: "Processos",
    desc: "Um fluxo inteligente para cada parte da sua rotina. Resumos diários da sua caixa de e-mail, agenda com marcações e notificações em tempo real.",
  },
  {
    title: "Comunicação",
    desc: "Mensagens automáticas via WhatsApp para sua base de leads. Follow-up, promoções e cobranças disparando no momento certo, para a pessoa certa. Sem mais dor de cabeça.",
  },
];

function Automation() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const wordBoxRef = useRef(null);
  const wordOutRef = useRef(null);
  const wordInRef = useRef(null);
  const ctaBtnRef = useRef(null);

  // Halo laranja leve + pulse no "Falar no WhatsApp" quando o link Contato
  // da navbar leva até o final da página (mesmo evento do glow do rodapé).
  useIsoLayoutEffect(() => {
    const highlight = () => {
      const btn = ctaBtnRef.current;
      if (!btn || prefersReducedMotion()) return;
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

    // Timeline REVERSÍVEL do swap MELHORADO→AUTOMATIZADO, montada uma vez e
    // pausada no início. A entrada automática dá play() (comportamento atual,
    // intacto). O clique na tarja alterna play() ↔ reverse() — o reverse é o
    // inverso exato da animação (mesmos caminhos), sem 2ª animação.
    let swapTl = null;
    let atEnd = false; // false = "melhorado" visível · true = "automatizado."

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
    const wordSpans = title ? title.querySelectorAll(".word > span") : [];

    // 135% (e não 110%): o til do Ã de PADRÃO sobe além do corpo da letra
    // e com 110% a pontinha vazava pra dentro da máscara no estado escondido.
    gsap.set(wordSpans, { yPercent: 135 });
    if (intro) gsap.set(intro, { opacity: 0, y: 18 });

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
      wordBox.removeEventListener("click", onWordClick);
      if (unlockTimer) clearTimeout(unlockTimer);
      if (sequenceTl) sequenceTl.kill();
      if (swapTl) swapTl.kill();
    };
  }, []);

  return (
    <section className="section automation" id="auto" ref={sectionRef}>
      <div className="auto__hero">
        {/* Quebras controladas por breakpoint: desktop = "um padrão pode / ser [caixa]";
            mobile = "um padrão pode ser / [caixa]" — a caixa mora SOZINHA na última
            linha pra o swap MELHORADO→AUTOMATIZADO. nunca re-quebrar o parágrafo. */}
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
          </span></span>
        </h2>
        {/* Quebras mobile controladas: sem viúvas ("existe automação." /
            "pode fazer." soltos no fim de linha) */}
        <p className="auto__intro">
          Processos, tarefas, ideias —{" "}
          <br className="auto__br--mobile" />
          se existe padrão, existe automação.
          <br />
          Eu monto o sistema.{" "}
          <br className="auto__br--mobile" />
          Você foca no que só você pode fazer.
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
          {/* Quebras mobile controladas — sem "infinitas." viúvo */}
          <p className="auto__cta-copy">
            A verdade é que{" "}
            <br className="auto__br--mobile" />
            as possibilidades são infinitas.
            <br />
            Me conta o que você{" "}
            <br className="auto__br--mobile" />
            gostaria de automatizar.
          </p>
          <a
            href="https://wa.me/5533984246770?text=Oi%20Victor!%20Quero%20automatizar%20algo%20no%20meu%20neg%C3%B3cio."
            target="_blank"
            rel="noopener noreferrer"
            className="auto__cta-btn"
            ref={ctaBtnRef}
          >
            <svg className="auto__cta-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
            </svg>
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Automation;
