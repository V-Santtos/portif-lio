import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Flip, ScrollTrigger, currentScrollY, gsap, prefersReducedMotion, scrollPageTo, useIsoLayoutEffect, useTitleReveal } from "./lib.jsx";
import CasePreviewFrame from "./CasePreviewFrame.jsx";
import LandingPreview from "./LandingPreview.jsx";

const LP_ITEMS = [
  {
    preview: "eco",
    capsuleSrc: "/previews/ecoscape/index.html",
    tag: "Jardinagem",
    title: "EcoScape",
  },
  {
    preview: "nexous",
    capsuleSrc: "/previews/nexous/index.html",
    tag: "Agência",
    title: "Nexous",
  },
  { preview: "roofora", tag: "Serviços", title: "Roofora" },
  {
    preview: "dinevo",
    capsuleSrc: "/previews/fervor/index.html",
    tag: "Restaurante",
    title: "Fervor",
  },
  { preview: "minta", tag: "Fintech", title: "Minta" },
];

// Cases reais entram na linha principal SÓ no desktop. No mobile eles não vão
// pra linha principal — aparecem nas faixas satélites (ver STRIP_TOP/BOTTOM),
// que estão deixando de ser placeholders pra virar sites reais mapeados.
const LP_ITEMS_DESKTOP_EXTRA = [
  {
    preview: "minas",
    capsuleSrc: "/previews/minas/index.html",
    tag: "Loja de tintas",
    title: "Minas Tintas",
  },
];

// Substituições exclusivamente do desktop. O item original continua em
// LP_ITEMS (e seu componente/CSS/ativos seguem preservados), então reativar o
// Roofora exige apenas retirar esta entrada do mapa.
const LP_ITEMS_DESKTOP_REPLACEMENTS = {
  roofora: {
    preview: "aurea",
    capsuleSrc: "/previews/aurea/index.html",
    tag: "Imobiliária",
    title: "Áurea",
  },
};

// No desktop, o case aprovado do Fervor vem logo depois do Minas Tintas.
// A lista base continua intacta para preservar a ordem do carrossel mobile.
const LP_ITEMS_DESKTOP = [
  LP_ITEMS[0],
  ...LP_ITEMS_DESKTOP_EXTRA,
  ...LP_ITEMS.filter((item) => item.preview === "dinevo"),
  ...LP_ITEMS.slice(1)
    .filter((item) => item.preview !== "dinevo")
    .map((item) => LP_ITEMS_DESKTOP_REPLACEMENTS[item.preview] ?? item),
];

// Placeholders das faixas satélites (mobile) — cards leves, só CSS,
// espelhando o tamanho/gap do carrossel central. Trocar pelos reais depois.
const STRIP_TOP = [
  // Minas Tintas: site real. No desktop ele vive no carrossel central; no mobile
  // migra pra cá exibindo o MESMO preview (não é placeholder de texto).
  { preview: "minas", tag: "Loja de tintas", title: "Minas Tintas" },
  { tag: "Clínica", title: "Vitalis", theme: "light" },
  { tag: "Imobiliária", title: "Alta Vista", theme: "dark" },
  { tag: "Advocacia", title: "Priori", theme: "light" },
];
const STRIP_BOTTOM = [
  { tag: "Restaurante", title: "Braseiro", theme: "light" },
  { tag: "Academia", title: "Forja", theme: "dark" },
  { tag: "Petshop", title: "Aumigo", theme: "light" },
  { tag: "Estética", title: "Lume", theme: "dark" },
];

function StripCard({ item }) {
  // Tap certeiro: o navegador só dispara click se o dedo NÃO deslizou —
  // scroll passa reto pelas faixas. Destino real entra depois; por ora
  // o clique dá um feedback de "pressionado".
  const onTap = (e) => {
    gsap.fromTo(
      e.currentTarget,
      { scale: 1 },
      { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.inOut" }
    );
  };
  // Card real: mesmo visual do carrossel central do desktop (preview + overlay).
  // No mobile o site real sai da linha central e aparece aqui na faixa satélite.
  if (item.preview) {
    return (
      <article className="lp__strip-card lp__strip-card--preview" onClick={onTap}>
        <LandingPreview variant={item.preview} />
      </article>
    );
  }
  return (
    <article className={`lp__strip-card lp__strip-card--${item.theme}`} onClick={onTap}>
      <span className="lp__strip-tag">{item.tag}</span>
      <strong className="lp__strip-title">{item.title}</strong>
    </article>
  );
}

function PreviewCard({ item, loadAllowed }) {
  return (
    <article className={`lp__preview-card${item.capsuleSrc ? " lp__preview-card--interactive" : ""}`}>
      {item.capsuleSrc ? (
        <CasePreviewFrame
          src={item.capsuleSrc}
          posterSrc={`/previews/posters/${item.preview}.webp`}
          title={`Preview interativo do hero ${item.title}`}
          loadAllowed={loadAllowed}
        />
      ) : item.preview ? (
        <LandingPreview variant={item.preview} />
      ) : (
        <img src={item.img} className="lp__thumb-img" alt={item.title} />
      )}
    </article>
  );
}

function LandingPages({ onGeometryReady }) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const mobileTitleRef = useRef(null);
  const startWrapperRef = useRef(null);
  const endWrapperRef = useRef(null);
  const settleAnchorRef = useRef(null);
  const targetRef = useRef(null);
  const settleTargetRef = useRef(null);
  const noteRef = useRef(null);
  const carouselViewportRef = useRef(null);
  const carouselTrackRef = useRef(null);
  const carouselSkipRef = useRef(null);
  const carouselSkipActionRef = useRef(null);
  const stripTopRef = useRef(null);
  const stripBottomRef = useRef(null);
  const stripTopTrackRef = useRef(null);
  const stripBottomTrackRef = useRef(null);

  // Linha principal: no desktop inclui os cases reais (Minas etc.); no mobile
  // fica só com os 5 demos — os reais migram pras faixas satélites. Estado
  // reativo pra trocar a lista ao cruzar o breakpoint (o pin GSAP se refaz
  // sozinho no resize, lendo os children ao vivo).
  const [isMobileView, setIsMobileView] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );
  const [caseLoadingAllowed, setCaseLoadingAllowed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e) => setIsMobileView(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  // Slot 1 é fixo: o EcoScape é a origem da transição Flip de entrada da seção.
  // Do slot 2 pra frente a ordem é livre — os cases reais entram logo depois
  // dele, na frente dos demos, pra serem validados um a um.
  const carouselItems = isMobileView
    ? LP_ITEMS
    : LP_ITEMS_DESKTOP;

  // Mobile: gatilho mais tarde (70% da tela) — em 85% o título de 8 linhas
  // termina de animar antes do usuário chegar nele e o efeito passa batido.
  const revealLater =
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  useTitleReveal(titleRef, {
    trigger: titleRef,
    start: revealLater ? "top 70%" : "top 85%",
    stagger: revealLater ? 0.05 : 0.04,
    onComplete: !isMobileView ? () => setCaseLoadingAllowed(true) : undefined,
  });
  useTitleReveal(mobileTitleRef, {
    trigger: mobileTitleRef,
    start: "top 70%",
    stagger: 0.05,
    onComplete: isMobileView ? () => setCaseLoadingAllowed(true) : undefined,
  });

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) {
      onGeometryReady?.();
      return;
    }

    const section = sectionRef.current;
    const target = targetRef.current;
    const settleTarget = settleTargetRef.current;
    const startWrapper = startWrapperRef.current;
    const endWrapper = endWrapperRef.current;
    const settleAnchor = settleAnchorRef.current;
    const carouselViewport = carouselViewportRef.current;
    const carouselTrack = carouselTrackRef.current;

    if (!section || !target || !settleTarget || !startWrapper || !endWrapper || !settleAnchor || !carouselViewport || !carouselTrack) {
      onGeometryReady?.();
      return;
    }

    let scrollTl;
    let carouselTl;
    let skipTween;
    let resizeTimer;
    let stripMarquees = [];

    const setSkipButton = (direction, visible) => {
      const button = carouselSkipRef.current;
      if (!button) return;
      const pointsLeft = direction === "left";
      button.dataset.direction = direction;
      button.setAttribute(
        "aria-label",
        pointsLeft ? "Voltar ao início" : "Ir ao último projeto"
      );
      button.classList.toggle("is-left", pointsLeft);
      button.classList.toggle("is-visible", visible);
    };

    const stopSkipTween = () => {
      if (!skipTween) return;
      skipTween.kill();
      skipTween = null;
      carouselSkipRef.current?.classList.remove("is-skipping");
    };

    const animateScrollTo = (destination) => {
      stopSkipTween();
      const state = { y: currentScrollY() };
      const distance = Math.abs(destination - state.y);
      skipTween = gsap.to(state, {
        y: destination,
        duration: gsap.utils.clamp(0.9, 1.45, 0.72 + distance / 3600),
        ease: "power3.inOut",
        onStart: () => carouselSkipRef.current?.classList.add("is-skipping"),
        onUpdate: () => scrollPageTo(state.y, { smooth: false }),
        onComplete: () => {
          scrollPageTo(destination, { smooth: false });
          carouselSkipRef.current?.classList.remove("is-skipping");
          setSkipButton("right", false);
          skipTween = null;
        },
        onInterrupt: () => carouselSkipRef.current?.classList.remove("is-skipping"),
      });
    };

    function build() {
      if (scrollTl) { scrollTl.scrollTrigger?.kill(); scrollTl.kill(); }
      if (carouselTl) { carouselTl.scrollTrigger?.kill(); carouselTl.kill(); }

      gsap.set(target, { clearProps: "all" });
      gsap.set(settleTarget, { clearProps: "transform,borderRadius" });
      gsap.set(carouselViewport, { opacity: 0, pointerEvents: "none" });

      // Mobile: gesto de touch percorre muito mais pixels que a roda do mouse
      // — sem ajuste, um flick engole 3-4 cards de uma vez. Mais distância
      // por card + snap + scrub amortecido deixam a arrastada proporcional.
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: startWrapper,
          start: "center center",
          endTrigger: endWrapper,
          end: "center center",
          scrub: isMobile ? 0.8 : 0.45,
          invalidateOnRefresh: true,
        },
      });
      // Stop just short of the final card geometry. The pinned landing then
      // completes the remaining 2% in the same direction, with no recoil.
      const LANDING_START_SCALE = 0.98;
      scrollTl.add(Flip.fit(target, settleAnchor, { duration: 1, ease: "none", scale: true }));

      // Keep the original scale-based motion while compensating only the CSS
      // radius, so its apparent 8px value does not grow with the transform.
      const baseRadius = parseFloat(getComputedStyle(settleTarget).borderTopLeftRadius) || 0;
      const setRadius = gsap.quickSetter(settleTarget, "borderRadius", "px");
      const syncVisualState = () => {
        const carrierScale = Number(gsap.getProperty(target, "scaleX")) || 1;
        const settleScale = Number(gsap.getProperty(settleTarget, "scaleX")) || 1;
        setRadius(baseRadius / (carrierScale * settleScale));
      };
      scrollTl.eventCallback("onUpdate", syncVisualState);

      const cards = carouselTrack.children;
      const cardCount = cards.length;

      const vpW = carouselViewport.offsetWidth;
      const cardW = cards[0]?.offsetWidth || 0;
      const gapPx = parseFloat(getComputedStyle(carouselTrack).gap) || 32;
      const initialX = (vpW - cardW) / 2;
      const totalMove = (cardCount - 1) * (cardW + gapPx);
      const scrollDist = totalMove * (isMobile ? 2.4 : 1.5);
      // Complete the final 2% while pinned. Numeric scrub gives this short
      // monotonic movement enough time to remain visible even on a fast wheel.
      const SETTLE_VH = isMobile ? 0.24 : 0.18;
      const settleDist = Math.round(window.innerHeight * SETTLE_VH);

      // Pista de desaceleração na SAÍDA: um trecho de scroll no fim do pin
      // onde tudo já terminou e está parado. Num flick forte o momentum QUEIMA
      // aqui — o scroll nativo desacelera ao longo da distância — em vez de
      // despejar velocidade na Bridge e o usuário passar batido. Sem lock,
      // sem brigar com o momentum do iOS. Calibrar pela fração da viewport:
      // maior = freia mais (mais dedo pra sair); menor = freia menos.
      //
      // No desktop o mesmo trecho também é atravessado ao VOLTAR da Escada —
      // o pin é simétrico, então a mesma distância que seguia o flick de
      // saída vira um respiro parado antes do carrossel reagir na entrada de
      // volta (2026-08-18: tentativa de pular isso reativamente via
      // onEnterBack + scroll forçado deu flick, por reentrância com o scrub
      // ativo — revertida). Encolher o valor em vez de zerá-lo mantém a
      // desaceleração da saída, só bem mais curta nos dois sentidos.
      const EXIT_RUNWAY_VH = isMobile ? 0.7 : 0.08;
      const runway = Math.round(window.innerHeight * EXIT_RUNWAY_VH);
      const endDist = settleDist + scrollDist + runway;

      gsap.set(carouselTrack, { x: initialX });

      const hasStrips =
        isMobile && stripTopTrackRef.current && stripBottomTrackRef.current;

      // Faixas satélites — posição 100% derivada do PROGRESSO do scroll
      // (imune a jank/throttle de rAF durante a rolagem: não tem como "pular").
      // Rampas: entrada 0.16→0.34, cruzeiro, saída 0.62→0.78. Só o cruzeiro
      // (marquee) acumula por tempo; se o ticker congelar num frame, a faixa
      // apenas desliza mais devagar — nunca salta.
      const easeOutQ = (t) => 1 - (1 - t) * (1 - t);
      const easeInQ = (t) => t * t;
      const P_IN_A = 0.16, P_IN_B = 0.34, P_OUT_A = 0.62, P_OUT_B = 0.78;
      const CRUISE_SPEED = 55; // px/s

      const makeStrip = (trackEl, movesLeft) => {
        const halfW = trackEl.scrollWidth / 2;
        const vw = window.innerWidth;
        const startX = movesLeft ? vw : -2 * halfW; // trem fora da tela
        // cruzeiro a UMA TELA do início nos dois lados — viagem de entrada
        // idêntica (antes o de baixo percorria meio trem na mesma rampa e
        // entrava ~3.7× mais rápido). O +40 é folga anti-fresta no wrap.
        const cruiseX = movesLeft ? 0 : -2 * halfW + vw + 40;
        const state = { offset: 0, exitFromX: null, enterToX: null, lastX: null };

        const update = (p, dt) => {
          // marquee acumula só no cruzeiro (wrap na meia-volta duplicada)
          if (p > P_IN_B && p < P_OUT_A) {
            state.offset += (movesLeft ? -1 : 1) * CRUISE_SPEED * dt;
            if (movesLeft && state.offset <= -halfW) state.offset += halfW;
            if (!movesLeft && state.offset >= halfW) state.offset -= halfW;
          }
          let x;
          if (p <= P_IN_A) {
            x = startX;
            state.offset = 0;
            state.exitFromX = null;
            state.enterToX = null;
          } else if (p < P_IN_B) {
            // entrada: rampa da borda até a posição de cruzeiro ATUAL
            // (cruiseX + offset), espelhando a saída (que captura exitFromX).
            // Sem isso, descer do cruzeiro pra entrada pulava ~offset px porque
            // o cruzeiro carrega +offset e a entrada largava em +0. Capturar o
            // offset aqui casa os dois lados no mesmo ponto — contínuo indo e
            // voltando, em qualquer velocidade — mantendo o marquee vivo.
            if (state.enterToX === null) state.enterToX = cruiseX + state.offset;
            const t = easeOutQ((p - P_IN_A) / (P_IN_B - P_IN_A));
            x = startX + (state.enterToX - startX) * t;
            state.exitFromX = null;
          } else if (p < P_OUT_A) {
            x = cruiseX + state.offset;
            state.exitFromX = null;
            state.enterToX = null;
          } else if (p < P_OUT_B) {
            // saída: retrocede pra borda de origem, proporcional ao progresso
            if (state.exitFromX === null) state.exitFromX = cruiseX + state.offset;
            const t = easeInQ((p - P_OUT_A) / (P_OUT_B - P_OUT_A));
            x = state.exitFromX + (startX - state.exitFromX) * t;
            state.enterToX = null;
          } else {
            x = startX;
            state.enterToX = null;
          }
          // Pula o set quando nada mudou (parado fora da rampa/cruzeiro): evita
          // reescrever o transform todo frame à toa.
          if (state.lastX === null || Math.abs(x - state.lastX) > 0.01) {
            gsap.set(trackEl, { x });
            state.lastX = x;
          }
        };

        update(0, 0);
        return { update };
      };

      stripMarquees.forEach((s) => s.destroy());
      stripMarquees = [];
      if (hasStrips) {
        const strips = [
          makeStrip(stripTopTrackRef.current, true),
          makeStrip(stripBottomTrackRef.current, false),
        ];
        // Fonte de verdade: o progresso AMORTECIDO do scrub (o mesmo que move
        // os cards centrais). Num flick violento o scrub suaviza o salto —
        // faixas e carrossel percorrem o caminho juntos, sem pop.
        const onTick = (time, deltaTime) => {
          // Só trabalha enquanto o carrossel está engatado (pin ativo). Fora
          // dele as faixas estão paradas na borda (startX, fora da tela) — não
          // há motivo pra rodar o cálculo/set todo frame. Corta o custo do
          // ticker pra ~zero quando a seção não está em tela.
          const st = carouselTl && carouselTl.scrollTrigger;
          if (!st || !st.isActive) return;
          const dt = Math.min(deltaTime, 100) / 1000;
          // Ignore the landing and exit runways: strips only move with cards.
          const motionTime = Math.max(0, carouselTl.time() - settleDist);
          const p = scrollDist > 0 ? Math.min(1, motionTime / scrollDist) : 1;
          strips.forEach((s) => s.update(p, dt));
        };
        gsap.ticker.add(onTick);
        stripMarquees = [{ destroy: () => gsap.ticker.remove(onTick) }];
      }

      carouselTl = gsap.timeline({
        scrollTrigger: {
          trigger: endWrapper,
          start: "center center",
          end: `+=${endDist}`,
          scrub: isMobile ? 1 : 0.6,
          // 🔴 SEM `snap` no mobile — removido em 2026-08-16 depois de medido.
          //
          // O snap por card existia aqui e era INCOMPATIVEL com o ScrollSmoother
          // (adotado em 2026-08-08). Sintoma: parar o dedo no meio do carrossel
          // e, ~500ms depois, o scroll voltar sozinho pro topo da pagina.
          //
          // O calculo do snap estava certo — ele criava o tween mirando o card
          // seguinte. O que quebrava era a EXECUCAO: o tween move o scroll pelo
          // proxy do ScrollSmoother e depois rele essa posicao pra detectar se o
          // usuario interveio (_interruptionTracker no ScrollTrigger). No touch o
          // smoother roda em passthrough (`smoothTouch:false`), entao a escrita
          // (window.scrollTo nativo) e a leitura (-currentY do smoother) andam em
          // ticks diferentes, discordam, e o GSAP resolve a discordancia
          // escrevendo 0 — pro topo. Medido: uma unica chamada scrollTo(0, 0).
          //
          // Mesma familia do bug de pin resolvido com `pinType:"fixed"` logo
          // abaixo: o proxy e a verdade pro ScrollTrigger, mas no touch o scroll
          // real passa por fora dele. Pro snap nao existe escape hatch — a saida
          // e nao usar snap. Quem cobria o motivo original (nao passar batido
          // pela Bridge num flick) e a EXIT_RUNWAY_VH, que continua no lugar.
          //
          // Nao reintroduzir sem antes conferir que o snap pousa certo com o
          // ScrollSmoother ativo.
          pin: section,
          // Mesma razão do pin do Hero (ver App.jsx): no touch o pin por
          // transform é atualizado na main thread enquanto o scroll roda no
          // compositor — durante o momentum o carrossel pinado treme.
          ...(isMobile && { pinType: "fixed" }),
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter() {
            gsap.set(target, { opacity: 1 });
            gsap.set(carouselViewport, { opacity: 0, pointerEvents: "none" });
            setSkipButton("right", false);
          },
          onLeave() {
            // passou do último template descendo → some
            carouselSkipRef.current?.classList.remove("is-visible");
          },
          onLeaveBack() {
            gsap.set(carouselViewport, { opacity: 0, pointerEvents: "none" });
            gsap.set(target, { opacity: 1 });
            // saiu pelo topo do carrossel → some
            carouselSkipRef.current?.classList.remove("is-visible");
          },
          onUpdate(self) {
            const time = carouselTl.time();
            const movingBack = self.direction === -1;
            const carouselIsVisible = time >= settleDist;
            const reachedLastCard = time >= settleDist + scrollDist - 8;
            setSkipButton(
              movingBack ? "left" : "right",
              movingBack || (carouselIsVisible && !reachedLastCard)
            );
            // (faixas satélites são atualizadas pelo ticker, via progresso
            // amortecido do scrub — não pelo progresso cru daqui)
          },
        },
      });

      carouselTl.fromTo(
        settleTarget,
        { scale: 1 },
        {
          scale: 1 / LANDING_START_SCALE,
          duration: settleDist,
          ease: "power3.out",
          immediateRender: false,
        }
      );
      carouselTl.set(target, { opacity: 0 });
      carouselTl.set(carouselViewport, { opacity: 1, pointerEvents: "auto" }, "<");
      carouselTl.to(carouselTrack, { x: initialX - totalMove, ease: "none", duration: scrollDist });
      carouselTl.eventCallback("onUpdate", syncVisualState);
      // Cauda parada = a pista de desaceleração. Com scrub, o que importa é a
      // razão das durações (scrollDist : runway), então o momentum de um flick
      // forte tem onde morrer antes do pin soltar pra Bridge.
      if (runway > 0) carouselTl.to({}, { duration: runway });

      carouselSkipActionRef.current = () => {
        const button = carouselSkipRef.current;
        if (!button) return;
        if (button.dataset.direction === "left") {
          stopSkipTween();
          scrollPageTo(0);
          return;
        }

        const trigger = carouselTl?.scrollTrigger;
        if (!trigger) return;
        // Mira o FIM do runway (endDist), não só o pouso do último card: um
        // clique já solta pra Escada num deslize só, sem exigir mais um
        // empurrão manual de scroll depois. A trava/desaceleração continua
        // existindo — o tween só a atravessa de uma vez, em vez de parar
        // bem antes dela.
        animateScrollTo(trigger.start + endDist);
      };
    }

    // Fecha o pin no primeiro frame em que o ScrollSmoother do pai já existe.
    // O boot continua cobrindo a tela até este refresh terminar; portanto a
    // altura da página e a scrollbar já estão definitivas quando o Hero surge.
    const buildFrame = window.requestAnimationFrame(() => {
      build();
      ScrollTrigger.refresh();
      onGeometryReady?.();
    });

    let lastW = window.innerWidth;
    function onResize() {
      // No mobile a barra de URL dispara resize de altura durante o scroll;
      // rebuildar o pin nesse momento causa salto. Só a largura importa aqui.
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { build(); ScrollTrigger.refresh(); }, 150);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("wheel", stopSkipTween, { passive: true });
    window.addEventListener("touchstart", stopSkipTween, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", stopSkipTween);
      window.removeEventListener("touchstart", stopSkipTween);
      clearTimeout(resizeTimer);
      stopSkipTween();
      window.cancelAnimationFrame(buildFrame);
      if (scrollTl) { scrollTl.scrollTrigger?.kill(); scrollTl.kill(); }
      if (carouselTl) { carouselTl.scrollTrigger?.kill(); carouselTl.kill(); }
      stripMarquees.forEach((s) => s.destroy());
      gsap.set(target, { clearProps: "all" });
      gsap.set(settleTarget, { clearProps: "transform,borderRadius" });
      gsap.set(carouselViewport, { clearProps: "opacity,visibility,pointerEvents" });
      carouselSkipActionRef.current = null;
      carouselSkipRef.current?.classList.remove("is-visible", "is-left", "is-skipping");
    };
  }, [onGeometryReady]);

  const titleHtml = `
    <span class="lp__line">
      <span class="word"><span>Antes</span></span>
      <span class="word"><span>de</span></span>
      <span class="word"><span>falar</span></span>
      <span class="word"><span>com</span></span>
      <span class="word"><span>você,</span></span>
    </span>
    <span class="lp__line">
      <span class="word"><span>seu</span></span>
      <span class="word"><span>cliente</span></span>
      <span class="word"><span>já</span></span>
      <span class="word"><span>criou</span></span>
      <span class="word"><span>uma</span></span>
    </span>
    <span class="lp__line">
      <span class="word accent"><span>primeira</span></span>
      <span class="word accent"><span>impressão.</span></span>
      <span class="word"><span>E</span></span>
      <span class="word"><span>ela</span></span>
    </span>
    <span class="lp__line">
      <span class="word"><span>pode</span></span>
      <span class="word"><span>fazer</span></span>
      <span class="word"><span>a</span></span>
      <span class="word"><span>diferença</span></span>
    </span>
    <span class="lp__line">
      <span class="word"><span>entre</span></span>
      <span class="word"><span>escolher</span></span>
      <span class="word"><span>o</span></span>
      <span class="word accent"><span>seu</span></span>
    </span>
    <span class="lp__line">
      <span class="word accent"><span>negócio</span></span>
      <span class="word"><span>e</span></span>
      <span class="word"><span>o</span></span>
      <span class="word"><span>do</span></span>
      <span class="word"><span>concorrente.</span></span>
    </span>
  `;

  const mobileTitleHtml = `
    <span class="lp__line"><span class="word"><span>Antes</span></span> <span class="word"><span>de</span></span> <span class="word"><span>falar</span></span></span>
    <span class="lp__line"><span class="word"><span>com</span></span> <span class="word"><span>voc\u00ea,</span></span> <span class="word"><span>seu</span></span></span>
    <span class="lp__line"><span class="word"><span>cliente</span></span> <span class="word"><span>j\u00e1</span></span></span>
    <span class="lp__line"><span class="word"><span>criou</span></span> <span class="word"><span>uma</span></span></span>
    <span class="lp__line"><span class="word accent"><span>primeira</span></span> <span class="word accent"><span>impress\u00e3o.</span></span></span>
    <span class="lp__line"><span class="word"><span>E</span></span> <span class="word"><span>ela</span></span> <span class="word"><span>pode</span></span> <span class="word"><span>fazer</span></span></span>
    <span class="lp__line"><span class="word"><span>a</span></span> <span class="word"><span>diferen\u00e7a</span></span></span>
    <span class="lp__line"><span class="word"><span>entre</span></span> <span class="word"><span>escolher</span></span></span>
    <span class="lp__line"><span class="word"><span>o</span></span> <span class="word accent"><span>seu</span></span> <span class="word accent"><span>neg\u00f3cio</span></span></span>
    <span class="lp__line"><span class="word"><span>ou</span></span> <span class="word"><span>o</span></span> <span class="word"><span>do</span></span> <span class="word"><span>seu</span></span></span>
    <span class="lp__line"><span class="word"><span>concorrente.</span></span></span>
  `;

  return (
    <section className="section lp" id="lp" data-screen-label="02 Páginas" ref={sectionRef}>
      <div className="container-x">
        <p className="eyebrow lp__eyebrow">Presença Digital</p>
        <h2
          className="section-title lp__title--main lp__title--desktop"
          ref={titleRef}
          dangerouslySetInnerHTML={{ __html: titleHtml }}
        />
        <h2
          className="section-title lp__title--main lp__title--mobile"
          ref={mobileTitleRef}
          dangerouslySetInnerHTML={{ __html: mobileTitleHtml }}
        />
      </div>

      <div className="lp__scaling-header">
        <div className="lp__note" ref={noteRef}>
          <span>É isso que eu construo:<br />sites que comunicam o valor<br />do seu negócio.</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 64 36" fill="none" className="lp__note-arrow">
            <path d="M1 0.999889C7.40028 7.00632 22.5182 20.1881 27.8462 22.5774C29.1888 23.0085 30.4352 23.282 34.8153 24.8632C39.1954 26.4443 53.5563 24.8704 62.8187 26.9744M62.8187 26.9744C62.7852 27.7219 61.915 28.5968 60.2964 29.5075C52.8642 33.6892 47.1995 34.7166 46.2324 34.7258M62.8187 26.9744C61.937 25.4952 59.4141 24.7413 56.4519 22.746C55.0697 20.7506 53.9329 16.7598 52.7617 12.6481" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="lp__thumb-box lp__thumb-box--small">
          <div className="lp__ratio"></div>
          <div className="lp__thumb-wrapper" ref={startWrapperRef}>
            <div className="lp__thumb-carrier" ref={targetRef}>
              <div className="lp__thumb-approach">
                <article className="lp__thumb-target" ref={settleTargetRef}>
                  <LandingPreview variant="eco" />
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lp__scaling-video">
        <div className="lp__thumb-box lp__thumb-box--large">
          <div className="lp__ratio"></div>
          <div className="lp__thumb-wrapper" ref={endWrapperRef}>
            <div className="lp__settle-anchor" ref={settleAnchorRef}></div>
          </div>
        </div>

        <div className="lp__carousel-viewport" ref={carouselViewportRef}>
          <div className="lp__carousel-track" ref={carouselTrackRef}>
            {carouselItems.map((item, i) => (
              <PreviewCard
                key={item.preview}
                item={item}
                loadAllowed={caseLoadingAllowed}
              />
            ))}
          </div>
        </div>

        {/* Faixas satélites (só mobile): entram das bordas na altura do 2º
            card e saem na metade do penúltimo (coreografia no build()) */}
        <div className="lp__strip lp__strip--top" aria-hidden="true" ref={stripTopRef}>
          <div className="lp__strip-track" ref={stripTopTrackRef}>
            {[...STRIP_TOP, ...STRIP_TOP].map((item, i) => (
              <StripCard key={i} item={item} />
            ))}
          </div>
        </div>
        <div className="lp__strip lp__strip--bottom" aria-hidden="true" ref={stripBottomRef}>
          <div className="lp__strip-track" ref={stripBottomTrackRef}>
            {[...STRIP_BOTTOM, ...STRIP_BOTTOM].map((item, i) => (
              <StripCard key={i} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* position:fixed → vai pro body: dentro do #smooth-content (que tem
          transform) ele ficaria fixo ao conteúdo, não à viewport. */}
      {createPortal(
        <button
          type="button"
          className="lp__carousel-skip"
          aria-label="Ir ao último projeto"
          data-direction="right"
          ref={carouselSkipRef}
          onClick={() => carouselSkipActionRef.current?.()}
        >
          <span className="lp__carousel-skip-icon" aria-hidden="true">↑</span>
        </button>,
        document.body
      )}
    </section>
  );
}

export default LandingPages;
