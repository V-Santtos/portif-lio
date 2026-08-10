import { useRef } from "react";
import { gsap, ScrollTrigger, ScrollSmoother, useIsoLayoutEffect, prefersReducedMotion } from "./lib.jsx";

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
    const savedStyles = {};

    const firstLetters = phrase.querySelectorAll('[data-sentence="1"] .bridge__letter');
    const secondLetters = phrase.querySelectorAll('[data-sentence="2"] .bridge__letter');

    // Com o ScrollSmoother ativo, a posição de scroll que importa é a DELE
    // (a visual). window.scrollY é o alvo nativo e o conteúdo chega nele
    // depois, então medir por ali erraria o handoff.
    const smoother = () => ScrollSmoother.get();
    const getScroll = () => smoother()?.scrollTop() ?? window.scrollY;

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
      lockY = getScroll();
      document.documentElement.classList.add("is-scroll-locked");
      // O smoother tem trava própria (bloqueia wheel/touch/scroll por dentro).
      // Duplicar com listeners crus faria os dois brigarem pelo mesmo evento.
      const s = smoother();
      if (s) {
        s.paused(true);
        return;
      }
      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
      window.addEventListener("keydown", preventScrollKeys);
      window.addEventListener("scroll", holdScroll, { passive: true });
    };

    const unlockScroll = (targetY = lockY) => {
      if (!locked) return;
      locked = false;
      document.documentElement.classList.remove("is-scroll-locked");
      const s = smoother();
      if (s) {
        s.paused(false);
        s.scrollTop(targetY);
        return;
      }
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScrollKeys);
      window.removeEventListener("scroll", holdScroll);
      window.scrollTo(0, targetY);
    };

    const setAutomationLayer = (automation) => {
      savedStyles.position = automation.style.position;
      savedStyles.top = automation.style.top;
      savedStyles.left = automation.style.left;
      savedStyles.right = automation.style.right;
      savedStyles.bottom = automation.style.bottom;
      savedStyles.width = automation.style.width;
      savedStyles.height = automation.style.height;
      savedStyles.zIndex = automation.style.zIndex;
      automation.classList.add("automation--handoff");
      // position:fixed se ancora no ancestral TRANSFORMADO mais próximo. Com o
      // ScrollSmoother esse ancestral é o #smooth-content, cujo topo fica em
      // -scroll na tela — então top:0 cairia fora da viewport. Compensar com o
      // scroll atual devolve o elemento ao topo da tela. Constante durante o
      // efeito, porque o scroll está travado aqui.
      // NÃO usar o atalho `inset`: o GSAP aplica as propriedades numa ordem
      // interna própria, e `inset:0` pisava por cima do `top` compensado —
      // o elemento renderizava a milhares de px da tela real. `top`/`left`
      // como longhands soltos não têm esse conflito.
      const offsetTop = smoother() ? getScroll() : 0;
      gsap.set(automation, {
        position: "fixed",
        top: offsetTop,
        left: 0,
        right: 0,
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
      automation.style.top = savedStyles.top || "";
      automation.style.left = savedStyles.left || "";
      automation.style.right = savedStyles.right || "";
      automation.style.bottom = savedStyles.bottom || "";
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
      gsap.ticker.remove(checkTrigger);

      // Mobile: sem scroll-lock nem handoff — touch briga com lock (momentum
      // do iOS). Só roda o letter-swap; a Automation entra rolando normal e
      // recebe o evento pra animar o word-swap dela.
      if (window.matchMedia("(max-width: 767px)").matches) {
        tl = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: () => {
            window.dispatchEvent(new CustomEvent("automation:word-swap"));
          },
        })
          .to(firstLetters, { yPercent: -50, duration: 0.9, stagger: 0.028 })
          .to({}, { duration: 0.5 })
          .to(secondLetters, { yPercent: -50, duration: 0.9, stagger: 0.028 });
        return;
      }

      const automation = document.querySelector(".automation");

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
              // A ORDEM aqui é o que evita o "pulo de volta". A posição de
              // pouso precisa ser medida DEPOIS de (1) a Automation voltar pro
              // fluxo normal e (2) o refresh recalcular os pins da página.
              // Medir antes — como era — entregava uma foto de ~3s atrás
              // (o letter-swap + o slide levam esse tempo): o scroll pousava
              // deslocado e a seção dark saltava pra "corrigir".
              restoreAutomationLayer(automation);
              ScrollTrigger.refresh();
              const alvo = automation.getBoundingClientRect().top + getScroll();
              unlockScroll(alvo);
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
    // O smoother move o conteúdo por transform DEPOIS que os eventos de scroll
    // já pararam: o evento silencia mas a frase continua subindo. Sem o ticker
    // o trigger dormiria até o próximo scroll — e o efeito nunca dispararia se
    // o usuário parasse exatamente aqui. Sempre adicionado (não dá pra checar o
    // smoother agora: efeito de filho roda antes do pai que o cria). Sai sozinho
    // no primeiro disparo.
    gsap.ticker.add(checkTrigger);
    checkTrigger();

    return () => {
      window.removeEventListener("scroll", checkTrigger);
      gsap.ticker.remove(checkTrigger);
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
          <LetterSwapLine sentence="1" accent>comunica.</LetterSwapLine>
          <LetterSwapLine sentence="2">O sistema</LetterSwapLine>
          <LetterSwapLine sentence="2" accent>otimiza.</LetterSwapLine>
        </h2>

        <span className="bridge__dash" aria-hidden="true" />
      </div>
    </section>
  );
}

export default Bridge;
