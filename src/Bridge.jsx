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
  const curtainRef = useRef(null);

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

    // ────────────────────────────────────────────────────────────────
    // MOBILE — cortina escrubada. Caminho totalmente separado do desktop.
    //
    // Por que não é o efeito do desktop: o desktop TRAVA o scroll (smoother
    // pausado) e roda a timeline sozinho. No touch essa briga é perdida — o
    // scroll roda no compositor e qualquer tentativa de segurá-lo pela main
    // thread trava/treme quando o usuário força.
    //
    // Aqui nada disputa o scroll. O progresso é função pura da geometria ao
    // vivo, e o ÚNICO elemento que a main thread transforma é a cortina — que
    // por definição precisa se mover em relação à página, então um frame de
    // atraso nela não tem referência visual pra denunciar. A frase segue
    // rolando pelo compositor, como texto normal. Forçar o scroll só atravessa
    // o efeito mais rápido; não há nada pra quebrar nem pra dessincronizar.
    // ────────────────────────────────────────────────────────────────
    if (window.matchMedia("(max-width: 767px)").matches) {
      const curtain = curtainRef.current;
      if (!curtain) return;

      // Linhas laranja NÃO entram: o accent é legível no creme e no dark, então
      // atravessar a borda não pede troca de cor. Só as escuras invertem.
      const lines = phrase.querySelectorAll(".bridge__line:not(.bridge__line--accent)");
      const kicker = stage.querySelector(".bridge__kicker");

      // 🔴 A cortina é função do TOPO DO STAGE, não da frase. Os critérios que
      // o Victor validou ao vivo são todos sobre a seção contra a tela ("nada
      // do carrossel em cima, nada da Automation embaixo, cortina já 75–80%"),
      // então medir a frase era medir a coisa errada — foi o que fez as três
      // calibragens anteriores lerem como atrasadas.
      //
      // Ambos em fração da altura da tela, com o topo do stage como régua:
      //   0.5  → topo do stage a meia tela (carrossel ainda aparecendo)
      //  -0.105 → topo do stage já 10,5% acima da viewport
      // Nessa janela, no instante em que o carrossel acaba de sair
      // (topo do stage = 0), a cortina está ~78% preenchida — o alvo pedido.
      // Depende do stage ter ~130svh (ver 10-bridge.css): os dois são um par.
      const FILL_START = 0.5;
      const FILL_END = -0.105;

      let lastWidth = window.innerWidth;
      let tl = null;
      let swapTl = null;
      let swapped = false;

      // Flip por par-de-faces empilhadas (mesma técnica do desktop) é um efeito
      // de DOIS ESTADOS — bonito em 0% ou 100%, fantasma em qualquer ponto no
      // meio (a moldura mostra metade da face velha + metade da nova ao mesmo
      // tempo). Amarrar isso ao progresso do scroll — como a cortina — deixa
      // esse meio-do-caminho refém da velocidade do dedo: num scroll normal o
      // usuário praticamente sempre pega o flip pausado ali, borrado. A saída
      // não é a cortina (ela É posição, faz sentido escrubar); é rodar o flip
      // no RELÓGIO da timeline, sempre a 0,9s+0,5s+0,9s, disparado uma vez só —
      // em qualquer velocidade de dedo, ele conclui do mesmo jeito, sem parar
      // no meio nunca.
      const playSwap = (instant) => {
        if (swapped) return;
        swapped = true;
        if (instant) {
          // Entrou já com a cortina adiantada (salto de link, restauração de
          // scroll) — nada foi visto rodando, então só assume o estado final.
          gsap.set([...firstLetters, ...secondLetters], { yPercent: -50 });
          return;
        }
        swapTl = gsap
          .timeline({ defaults: { ease: "power3.inOut" } })
          .to(firstLetters, { yPercent: -50, duration: 0.9, stagger: 0.028 })
          .to({}, { duration: 0.5 })
          .to(secondLetters, { yPercent: -50, duration: 0.9, stagger: 0.028 });
      };

      // Medido ao vivo, sem cache — nada aqui precisa ser recalculado quando a
      // fonte assenta, a barra de URL recolhe ou o aparelho gira. (Cachear foi
      // um bug real antes: o valor congelava pré-fonte e a conta saía errada.)
      const readFill = () => {
        const top = stage.getBoundingClientRect().top;
        const vh = window.innerHeight;
        return gsap.utils.clamp(0, 1, (FILL_START * vh - top) / ((FILL_START - FILL_END) * vh));
      };

      const build = () => {
        if (tl) tl.kill();

        // `y: 0` explícito: o `translateY(100%)` do CSS (estado parado, que
        // segura o efeito sem JS) é lido pelo GSAP como `y` em px e SOMARIA
        // com o yPercent — a cortina nascia uma altura inteira abaixo do lugar.
        gsap.set(curtain, { y: 0, yPercent: 100 });

        // A cortina é a ÚNICA coisa nessa timeline: ela é POSIÇÃO pura, então
        // seguir o dedo faz sentido. O letter-swap roda à parte, no relógio
        // dele (ver `playSwap`) — a janela [FILL_START, FILL_END] já cuida de
        // "quando", então aqui a timeline é só o trajeto, 0 a 1.
        tl = gsap.timeline({ paused: true });
        tl.fromTo(curtain, { y: 0, yPercent: 100 }, { yPercent: 0, duration: 1, ease: "none" });
      };

      const setCrossed = (el, crossed) => el.classList.toggle("is-crossed", crossed);

      const render = () => {
        if (!tl) return;
        if (phrase.getBoundingClientRect().top > window.innerHeight) return; // ainda não chegou

        const fill = readFill();
        if (!swapped) {
          // Dispara assim que a frase começa a aparecer — bem antes da cortina,
          // pra ela ter o máximo de pista possível. `fill` já adiantado na
          // PRIMEIRA leitura = chegou por salto (link do menu, restauração de
          // scroll) e não por rolagem: aí assume o estado final em vez de
          // tocar a animação fora de hora.
          playSwap(fill > 0.15);
        }

        // Um salto que pousa depois da Escada (link do menu) não precisa de
        // tratamento especial pra cortina: o preenchimento é função pura da
        // geometria, dá 1 sozinho, e a timeline já renderiza o estado final. É
        // o que dispensa o `bridge:skip` que o desktop precisa.
        tl.progress(fill);

        // Inversão de cor por comparação de rect, não por tempo: a linha vira
        // creme quando a borda da cortina passa da metade dela. Auto-corrige a
        // qualquer mudança de layout e não tem constante pra calibrar.
        const edge = curtain.getBoundingClientRect().top;
        lines.forEach((line) => {
          const r = line.getBoundingClientRect();
          setCrossed(line, edge <= r.top + r.height * 0.5);
        });
        if (kicker) setCrossed(kicker, edge <= kicker.getBoundingClientRect().bottom);
      };

      const onResize = () => {
        // A barra de URL do mobile dispara resize de altura durante o scroll —
        // remontar ali daria salto. Só a largura conta como mudança real.
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;

        if (!window.matchMedia("(max-width: 767px)").matches) {
          // Girou pra landscape/desktop: estaciona a cortina e para. Não tenta
          // subir o caminho do desktop no meio da sessão.
          if (tl) { tl.kill(); tl = null; }
          gsap.set(curtain, { y: 0, yPercent: 100 });
          lines.forEach((line) => setCrossed(line, false));
          if (kicker) setCrossed(kicker, false);
          return;
        }
        build();
      };

      build();
      render();
      gsap.ticker.add(render);
      window.addEventListener("resize", onResize);

      let fontsCancelled = false;
      document.fonts?.ready.then(() => {
        if (fontsCancelled) return;
        build();
        render();
      });

      return () => {
        fontsCancelled = true;
        gsap.ticker.remove(render);
        window.removeEventListener("resize", onResize);
        if (tl) tl.kill();
        if (swapTl) swapTl.kill();
        lines.forEach((line) => setCrossed(line, false));
        if (kicker) setCrossed(kicker, false);
      };
    }

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

    // Salto programático que pousa DEPOIS da Escada (link CONTATO). Sem isso o
    // checkTrigger dispararia no frame seguinte ao salto — a Escada está fora
    // da tela, mas a geometria diz que ela já passou —, travaria o scroll por
    // ~3,3s de animação que ninguém está vendo e pousaria no topo da Automation,
    // roubando o destino. Aqui ela só se dá por tocada e deixa a frase no
    // estado FINAL: quem rolar de volta vê o mesmo que quem assistiu.
    const skipTrigger = () => {
      if (hasPlayed || locked) return;
      hasPlayed = true;
      window.removeEventListener("scroll", checkTrigger);
      gsap.ticker.remove(checkTrigger);
      gsap.set([...firstLetters, ...secondLetters], { yPercent: -50 });
    };
    window.addEventListener("bridge:skip", skipTrigger);

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
      window.removeEventListener("bridge:skip", skipTrigger);
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
        {/* Cortina dark — só existe no mobile (display:none no desktop) */}
        <div className="bridge__curtain" ref={curtainRef} aria-hidden="true" />

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
      </div>
    </section>
  );
}

export default Bridge;
