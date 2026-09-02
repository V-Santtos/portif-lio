/* ──────────────────────────────────────────────────────────────────
   PreHero.jsx — tela de intro "Seu próximo nível."
   - Frase entra word-by-word (SplitText style)
   - Depois desliza para cima revelando o Hero (y: 0 → -100vh)
   ────────────────────────────────────────────────────────────────── */

import { useRef } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "./lib.jsx";

const MAX_PREHERO_LIFETIME_MS = 6000;

function PreHero({ active = true, onDone, onHidden }) {
  const rootRef = useRef(null);
  const phraseRef = useRef(null);

  useIsoLayoutEffect(() => {
    if (!active) return;

    const reduce = prefersReducedMotion();

    const phrase = phraseRef.current;
    if (!phrase) return;

    const spans = phrase.querySelectorAll(".word > span");
    const dot = phrase.querySelector(".pre-hero__dot");
    const previousOverflow = document.body.style.overflow;
    let finishCalled = false;
    let hiddenCalled = false;
    let fallbackTimer = 0;

    const finish = () => {
      if (finishCalled) return;
      finishCalled = true;
      // Permite scroll quando pré-hero terminar
      document.body.style.overflow = previousOverflow;
      if (onDone) onDone();
    };

    const hide = () => {
      if (hiddenCalled) return;
      hiddenCalled = true;
      finish();
      gsap.set(rootRef.current, { yPercent: -100 });
      if (onHidden) onHidden();
    };

    if (reduce) {
      gsap.set(rootRef.current, { yPercent: -100 });
      finish();
      hide();
      return;
    }

    // Body lock durante a intro
    document.body.style.overflow = "hidden";

    // Estado inicial explícito (y:0 anula o componente pixel do translateY(110%) da CSS)
    gsap.set(spans, { y: 0, yPercent: 110 });
    gsap.set(dot, { scale: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    tl.to(spans, {
      y: 0,
      yPercent: 0,
      duration: 0.9,
      stagger: 0.09,
    }, 0.15);
    tl.to(
      dot,
      { scale: 1, duration: 0.4, ease: "back.out(2.2)" },
      "-=0.15"
    );
    tl.to({}, { duration: 0.55 }); // hold curto
    tl.to(rootRef.current, {
      yPercent: -100,
      duration: 1.0,
      ease: "power3.inOut",
      onStart: finish, // dispara a Hero ao COMEÇAR o slide-up → entradas em paralelo
      onComplete: hide,
    });

    fallbackTimer = window.setTimeout(hide, MAX_PREHERO_LIFETIME_MS);

    return () => {
      window.clearTimeout(fallbackTimer);
      tl.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, [active, onDone, onHidden]);

  return (
    <div className="pre-hero" ref={rootRef} aria-hidden="false">
      <div className="pre-hero__phrase" ref={phraseRef}>
        <span className="word"><span>Seu</span></span>{" "}
        <span className="word"><span>próximo</span></span>{" "}
        <span className="word"><span>nível</span></span>
        <span className="pre-hero__dot" aria-hidden="true"></span>
      </div>
    </div>
  );
}

export default PreHero;
