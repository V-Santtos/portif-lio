import { useEffect, useRef, useState } from "react";
import { Flip, ScrollTrigger, gsap, prefersReducedMotion, useIsoLayoutEffect, useTitleReveal } from "./lib.jsx";
import LandingPreview from "./LandingPreview.jsx";

const LP_ITEMS = [
  { preview: "eco", tag: "Jardinagem", title: "EcoScape" },
  { preview: "nexous", tag: "Agência", title: "Nexous" },
  { preview: "roofora", tag: "Serviços", title: "Roofora" },
  { preview: "dinevo", tag: "Restaurante", title: "Dinevo" },
  { preview: "minta", tag: "Fintech", title: "Minta" },
];

// Cases reais entram na linha principal SÓ no desktop. No mobile eles não vão
// pra linha principal — aparecem nas faixas satélites (ver STRIP_TOP/BOTTOM),
// que estão deixando de ser placeholders pra virar sites reais mapeados.
const LP_ITEMS_DESKTOP_EXTRA = [
  { preview: "minas", tag: "Loja de tintas", title: "Minas Tintas" },
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
        <div className="lp__preview-overlay">
          <div>
            <span>{item.tag}</span>
            <strong>{item.title}</strong>
          </div>
        </div>
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

function PreviewCard({ item }) {
  return (
    <article className="lp__preview-card">
      {item.preview ? (
        <LandingPreview variant={item.preview} />
      ) : (
        <img src={item.img} className="lp__thumb-img" alt={item.title} />
      )}
      <div className="lp__preview-overlay">
        <div>
          <span>{item.tag}</span>
          <strong>{item.title}</strong>
        </div>
      </div>
    </article>
  );
}

function LandingPages() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const startWrapperRef = useRef(null);
  const endWrapperRef = useRef(null);
  const targetRef = useRef(null);
  const noteRef = useRef(null);
  const carouselViewportRef = useRef(null);
  const carouselTrackRef = useRef(null);
  const backTopRef = useRef(null);
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
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e) => setIsMobileView(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const carouselItems = isMobileView ? LP_ITEMS : [...LP_ITEMS, ...LP_ITEMS_DESKTOP_EXTRA];

  // Mobile: gatilho mais tarde (70% da tela) — em 85% o título de 8 linhas
  // termina de animar antes do usuário chegar nele e o efeito passa batido.
  const revealLater =
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  useTitleReveal(titleRef, {
    trigger: titleRef,
    start: revealLater ? "top 70%" : "top 85%",
    stagger: revealLater ? 0.05 : 0.04,
  });

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const section = sectionRef.current;
    const target = targetRef.current;
    const startWrapper = startWrapperRef.current;
    const endWrapper = endWrapperRef.current;
    const carouselViewport = carouselViewportRef.current;
    const carouselTrack = carouselTrackRef.current;

    if (!section || !target || !startWrapper || !endWrapper || !carouselViewport || !carouselTrack) return;

    let scrollTl;
    let carouselTl;
    let resizeTimer;
    let stripMarquees = [];

    function build() {
      if (scrollTl) { scrollTl.scrollTrigger?.kill(); scrollTl.kill(); }
      if (carouselTl) { carouselTl.scrollTrigger?.kill(); carouselTl.kill(); }

      gsap.set(target, { clearProps: "all" });
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
      scrollTl.add(Flip.fit(target, endWrapper, { duration: 1, ease: "none", scale: true }));

      const cards = carouselTrack.children;
      const cardCount = cards.length;

      const vpW = carouselViewport.offsetWidth;
      const cardW = cards[0]?.offsetWidth || 0;
      const gapPx = parseFloat(getComputedStyle(carouselTrack).gap) || 32;
      const initialX = (vpW - cardW) / 2;
      const totalMove = (cardCount - 1) * (cardW + gapPx);
      const scrollDist = totalMove * (isMobile ? 2.4 : 1.5);

      // Pista de desaceleração na SAÍDA (só mobile): um trecho de scroll no fim
      // do pin onde tudo já terminou e está parado. Num flick forte o momentum
      // QUEIMA aqui — o scroll nativo desacelera ao longo da distância — em vez
      // de despejar velocidade na Bridge e o usuário passar batido. Sem lock,
      // sem brigar com o momentum do iOS. Calibrar pela fração da viewport:
      // maior = freia mais (mais dedo pra sair); menor = freia menos.
      const EXIT_RUNWAY_VH = 0.7;
      const runway = isMobile ? Math.round(window.innerHeight * EXIT_RUNWAY_VH) : 0;
      const endDist = scrollDist + runway;
      // Fração do pin em que cards/faixas realmente animam; o resto é a pista.
      const activeFrac = endDist > 0 ? scrollDist / endDist : 1;

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
          // progresso da TIMELINE = valor amortecido pelo scrub (não o cru da
          // ScrollTrigger) — é o que segura o flick sem pop. Reescalado pela
          // fração ativa: as faixas completam a saída junto com os cards e ficam
          // paradas (p=1) durante a pista de desaceleração.
          const pRaw = carouselTl.progress();
          const p = activeFrac < 1 ? Math.min(1, pRaw / activeFrac) : pRaw;
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
          // Snap por card no touch: o flick "aterrissa" no card mais próximo.
          // Pontos reescalados pela fração ativa (a pista de saída empurrou os
          // cards pra [0, activeFrac]); o ponto final (1) faz a pista "assentar"
          // na borda da Bridge se o usuário parar nela.
          snap: isMobile
            ? {
                snapTo: [
                  ...Array.from({ length: cardCount }, (_, i) => (i / (cardCount - 1)) * activeFrac),
                  1,
                ],
                duration: { min: 0.25, max: 0.6 },
                ease: "power2.out",
                // Assenta só no SENTIDO do movimento: descendo, a pista flui pro
                // fim (Bridge) — nunca puxa de volta pro último card (yank).
                directional: true,
              }
            : undefined,
          pin: section,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter() {
            gsap.set(target, { opacity: 0 });
            gsap.set(carouselViewport, { opacity: 1, pointerEvents: "auto" });
          },
          onLeave() {
            // passou do último template descendo → some
            backTopRef.current?.classList.remove("is-visible");
          },
          onLeaveBack() {
            gsap.set(carouselViewport, { opacity: 0, pointerEvents: "none" });
            gsap.set(target, { opacity: 1 });
            // saiu pelo topo do carrossel → some
            backTopRef.current?.classList.remove("is-visible");
          },
          onUpdate(self) {
            // dentro do carrossel: aparece só ao rolar de volta (direção -1)
            backTopRef.current?.classList.toggle("is-visible", self.direction === -1);
            // (faixas satélites são atualizadas pelo ticker, via progresso
            // amortecido do scrub — não pelo progresso cru daqui)
          },
        },
      });

      carouselTl.to(carouselTrack, { x: initialX - totalMove, ease: "none", duration: scrollDist });
      // Cauda parada = a pista de desaceleração. Com scrub, o que importa é a
      // razão das durações (scrollDist : runway), então o momentum de um flick
      // forte tem onde morrer antes do pin soltar pra Bridge.
      if (runway > 0) carouselTl.to({}, { duration: runway });
    }

    const delayedBuild = gsap.delayedCall(0.2, () => {
      build();
      ScrollTrigger.refresh();
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

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      delayedBuild.kill();
      if (scrollTl) { scrollTl.scrollTrigger?.kill(); scrollTl.kill(); }
      if (carouselTl) { carouselTl.scrollTrigger?.kill(); carouselTl.kill(); }
      stripMarquees.forEach((s) => s.destroy());
      gsap.set(target, { clearProps: "all" });
      backTopRef.current?.classList.remove("is-visible");
    };
  }, []);

  const titleHtml = `
    <span class="lp__line">
      <span class="word"><span>Sua</span></span>
      <span class="word"><span>primeira</span></span>
      <span class="word"><span>impressão</span></span>
      <span class="word"><span>no</span></span>
    </span>
    <span class="lp__line">
      <span class="word"><span>digital</span></span>
      <span class="word"><span>define</span></span>
      <span class="word"><span>se</span></span>
      <span class="word"><span>seu</span></span>
      <span class="word"><span>cliente</span></span>
    </span>
    <span class="lp__line">
      <span class="word"><span>confia</span></span>
      <span class="word"><span>na</span></span>
      <span class="word accent"><span>sua</span></span>
      <span class="word accent"><span>solução</span></span>
    </span>
    <span class="lp__line">
      <span class="word"><span>ou</span></span>
      <span class="word"><span>procura</span></span>
      <span class="word"><span>outra.</span></span>
    </span>
  `;

  return (
    <section className="section lp" id="lp" data-screen-label="02 Páginas" ref={sectionRef}>
      <div className="container-x">
        <p className="eyebrow lp__eyebrow">Presença Digital</p>
        <h2
          className="section-title lp__title--main"
          ref={titleRef}
          dangerouslySetInnerHTML={{ __html: titleHtml }}
        />
      </div>

      <div className="lp__scaling-header">
        <div className="lp__note" ref={noteRef}>
          <span>Veja como uma página<br />pode mudar a percepção</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 64 36" fill="none" className="lp__note-arrow">
            <path d="M1 0.999889C7.40028 7.00632 22.5182 20.1881 27.8462 22.5774C29.1888 23.0085 30.4352 23.282 34.8153 24.8632C39.1954 26.4443 53.5563 24.8704 62.8187 26.9744M62.8187 26.9744C62.7852 27.7219 61.915 28.5968 60.2964 29.5075C52.8642 33.6892 47.1995 34.7166 46.2324 34.7258M62.8187 26.9744C61.937 25.4952 59.4141 24.7413 56.4519 22.746C55.0697 20.7506 53.9329 16.7598 52.7617 12.6481" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="lp__thumb-box lp__thumb-box--small">
          <div className="lp__ratio"></div>
          <div className="lp__thumb-wrapper" ref={startWrapperRef}>
            <article className="lp__thumb-target" ref={targetRef}>
              <LandingPreview variant="eco" />
              <span className="lp__thumb-pill">Preview</span>
            </article>
          </div>
        </div>
      </div>

      <div className="lp__scaling-video">
        <div className="lp__thumb-box lp__thumb-box--large">
          <div className="lp__ratio"></div>
          <div className="lp__thumb-wrapper" ref={endWrapperRef}></div>
        </div>

        <div className="lp__carousel-viewport" ref={carouselViewportRef}>
          <div className="lp__carousel-track" ref={carouselTrackRef}>
            {carouselItems.map((item, i) => (
              <PreviewCard key={item.preview} item={item} />
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

      <button
        type="button"
        className="lp__back-top"
        aria-label="Voltar ao topo"
        ref={backTopRef}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </section>
  );
}

export default LandingPages;
