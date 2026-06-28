import { useRef } from "react";
import { gsap, ScrollTrigger, useIsoLayoutEffect, prefersReducedMotion } from "./lib.jsx";

function LetterSwapLine({ children, accent = false, sentence }) {
  const chars = Array.from(children);
  return (
    <span
      className={`bridge__line${accent ? " bridge__line--accent" : ""}`}
      data-sentence={sentence}
    >
      {chars.map((char, index) => {
        if (char === " ") {
          return <span key={`space-${index}`} className="bridge__letter-space" />;
        }
        return (
          <span className="bridge__letter-wrap" key={`${char}-${index}`}>
            <span className="bridge__letter">
              <span className="bridge__letter-face">{char}</span>
              <span className="bridge__letter-face bridge__letter-face--next">{char}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

function Bridge() {
  const stageRef = useRef(null);
  const phraseRef = useRef(null);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const stage = stageRef.current;
    const phrase = phraseRef.current;
    if (!stage || !phrase) return;

    let locked = false;
    let hasPlayed = false;
    let lockY = 0;
    let automationTop = 0;
    const savedStyles = {};

    const firstLetters = phrase.querySelectorAll('[data-sentence="1"] .bridge__letter');
    const secondLetters = phrase.querySelectorAll('[data-sentence="2"] .bridge__letter');

    function preventScroll(e) {
      if (locked) e.preventDefault();
    }

    function preventScrollKeys(e) {
      if (!locked) return;
      const blocked = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
      if (blocked.includes(e.key)) e.preventDefault();
    }

    function holdScroll() {
      if (locked && Math.abs(window.scrollY - lockY) > 1) {
        window.scrollTo(0, lockY);
      }
    }

    const lockScroll = () => {
      locked = true;
      lockY = window.scrollY;
      document.documentElement.classList.add("is-scroll-locked");
      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
      window.addEventListener("keydown", preventScrollKeys);
      window.addEventListener("scroll", holdScroll, { passive: true });
    };

    const unlockScroll = (targetY = lockY) => {
      if (!locked) return;
      locked = false;
      document.documentElement.classList.remove("is-scroll-locked");
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScrollKeys);
      window.removeEventListener("scroll", holdScroll);
      window.scrollTo(0, targetY);
    };

    const setAutomationLayer = (automation) => {
      savedStyles.position = automation.style.position;
      savedStyles.inset = automation.style.inset;
      savedStyles.width = automation.style.width;
      savedStyles.height = automation.style.height;
      savedStyles.zIndex = automation.style.zIndex;
      automation.classList.add("automation--handoff");
      gsap.set(automation, {
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100vh",
        zIndex: 20,
        yPercent: 100,
      });
    };

    const restoreAutomationLayer = (automation) => {
      if (!automation.classList.contains("automation--handoff")) return;
      automation.classList.remove("automation--handoff");
      automation.style.position = savedStyles.position || "";
      automation.style.inset = savedStyles.inset || "";
      automation.style.width = savedStyles.width || "";
      automation.style.height = savedStyles.height || "";
      automation.style.zIndex = savedStyles.zIndex || "";
      gsap.set(automation, { clearProps: "transform" });
    };

    let tl = null;

    const checkTrigger = () => {
      if (hasPlayed || locked) return;
      const rect = stage.getBoundingClientRect();
      // "bottom bottom": bottom of stage reaches bottom of viewport
      // Uses live rect so it's immune to ScrollTrigger spacer timing issues
      if (rect.bottom > window.innerHeight + 2) return;

      hasPlayed = true;
      window.removeEventListener("scroll", checkTrigger);

      const automation = document.querySelector(".automation");
      if (automation) {
        automationTop = automation.getBoundingClientRect().top + window.scrollY;
      }

      lockScroll();

      tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          if (!automation) {
            unlockScroll();
            return;
          }
          setAutomationLayer(automation);
          gsap.to(automation, {
            yPercent: 0,
            duration: 1,
            ease: "power3.inOut",
            onComplete: () => {
              restoreAutomationLayer(automation);
              unlockScroll(automationTop);
              ScrollTrigger.refresh();
              window.dispatchEvent(new CustomEvent("automation:word-swap"));
            },
          });
        },
      })
        .to(firstLetters, { yPercent: -50, duration: 0.9, stagger: 0.028 })
        .to({}, { duration: 0.5 })
        .to(secondLetters, { yPercent: -50, duration: 0.9, stagger: 0.028 });
    };

    window.addEventListener("scroll", checkTrigger, { passive: true });
    checkTrigger();

    return () => {
      window.removeEventListener("scroll", checkTrigger);
      if (tl) { tl.kill(); tl = null; }
      unlockScroll();
      const automation = document.querySelector(".automation");
      if (automation) restoreAutomationLayer(automation);
    };
  }, []);

  return (
    <section className="bridge-shell">
      <div className="bridge__approach" aria-hidden="true" />

      <div className="section bridge-stage" ref={stageRef}>
        <div className="bridge__kicker">
          <span className="eyebrow">A escada</span>
          <img className="bridge__stair" src="/escada.png" alt="" aria-hidden="true" />
        </div>

        <h2 className="bridge__phrase" ref={phraseRef}>
          <LetterSwapLine sentence="1">O site</LetterSwapLine>
          <LetterSwapLine sentence="1" accent>captura.</LetterSwapLine>
          <LetterSwapLine sentence="2">O sistema</LetterSwapLine>
          <LetterSwapLine sentence="2" accent>otimiza</LetterSwapLine>
        </h2>

        <span className="bridge__dash" aria-hidden="true" />
      </div>
    </section>
  );
}

export default Bridge;
