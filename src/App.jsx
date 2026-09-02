import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, ScrollTrigger, ScrollSmoother, prefersReducedMotion, useIsoLayoutEffect } from "./lib.jsx";
import InitialLoader, { INITIAL_LOADER_KEY } from "./InitialLoader.jsx";
import PreHero from "./PreHero.jsx";
import Hero from "./Hero.jsx";
import LandingPages from "./LandingPages.jsx";
import Bridge from "./Bridge.jsx";
import Automation from "./Automation.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import Seo from "./Seo.jsx";
import { getStaticSeo } from "./seo.js";

const SHOW_ABOUT_SECTION = true;
const HERO_CASCADE_SAFE_MS = 1900;

function shouldShowInitialLoader() {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(INITIAL_LOADER_KEY) !== "1";
  } catch {
    return true;
  }
}

function App() {
  const [loaderState, setLoaderState] = useState(() => {
    const showInitialLoader = shouldShowInitialLoader();
    return {
      showInitialLoader,
      introUnlocked: !showInitialLoader,
    };
  });
  // A abertura (loader + slide-up do PreHero) toca uma vez por aba. Ao voltar
  // de /projetos etc. o App remonta, mas o loader já foi visto (sessionStorage)
  // → pula a intro e entrega o Hero direto, sem o painel escuro reaparecer.
  const playOpening = loaderState.showInitialLoader;
  const [heroReady, setHeroReady] = useState(!playOpening);
  const [preHeroVisible, setPreHeroVisible] = useState(playOpening);
  const [pageGeometryReady, setPageGeometryReady] = useState(false);
  const progressRef = useRef(null);
  const openingActive = loaderState.showInitialLoader || preHeroVisible;
  // Espelha loaderState.showInitialLoader em tempo real pro effect do
  // ScrollTrigger (abaixo) ler sem depender dele no array de dependências —
  // ver o comentário junto do document.fonts.ready.then() mais abaixo.
  const loaderActiveRef = useRef(loaderState.showInitialLoader);
  const handleInitialLoaderDone = useCallback(() => {
    loaderActiveRef.current = false;
    setLoaderState({
      showInitialLoader: false,
      introUnlocked: true,
    });
    // O loader só chega aqui depois de essentialsDone (fonts + logo prontos),
    // entao o refresh de fonts.ready la embaixo ja foi pulado por estar
    // loaderActiveRef ainda true — este e quem fecha a conta.
    ScrollTrigger.refresh();
  }, []);

  const handlePreHeroDone = useCallback(() => {
    setHeroReady(true);
  }, []);

  const handlePreHeroHidden = useCallback(() => {
    setPreHeroVisible(false);
  }, []);

  const handlePageGeometryReady = useCallback(() => {
    setPageGeometryReady(true);
  }, []);

  useIsoLayoutEffect(() => {
    if (!pageGeometryReady) return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // O boot cobre o refresh com o mesmo degradê do Hero enquanto o pin do
    // carrossel fecha a altura real da página. Ao remover aqui, a scrollbar já
    // nasce no tamanho definitivo e a animação da nav ainda nem começou.
    document.documentElement.removeAttribute("data-booting");
  }, [pageGeometryReady]);

  useIsoLayoutEffect(() => {
    if (pageGeometryReady) return undefined;

    // A geometria costuma fechar no primeiro rAF. Se uma exceção rara durante
    // o build do carrossel impedir o callback, não manter a página inteira sem
    // scroll. O carrossel pode continuar denunciando o erro, mas a Home fica
    // navegável e a pessoa não precisa descobrir que Ctrl+Shift+R “cura”.
    const fallback = window.setTimeout(() => {
      document.documentElement.removeAttribute("data-booting");
      setPageGeometryReady(true);
      ScrollTrigger.refresh();
    }, 5000);

    return () => window.clearTimeout(fallback);
  }, [pageGeometryReady]);

  useIsoLayoutEffect(() => {
    document.documentElement.classList.toggle("is-opening-screen", openingActive);

    // O estado escuro do boot/status bar é decidido ANTES da primeira pintura
    // por um script inline no index.html (intro one-shot vai tocar → preto).
    // Aqui só desfazemos quando a intro acaba: fundo volta ao creme e a meta
    // recebe o valor final (o Safari pode aplicar só na próxima re-amostragem
    // — aceito; nunca setar a meta pra escuro via JS, ela gruda).
    if (!openingActive) {
      document.documentElement.removeAttribute("data-boot-dark");
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.setAttribute("content", "#FEF8E8");
    }

    return () => {
      document.documentElement.classList.remove("is-opening-screen");
    };
  }, [openingActive]);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const triggers = [];
    let cleanupProgress = () => {};
    let cancelled = false;
    let fontsRefreshTimer = 0;
    const effectStartedAt = performance.now();

    // 🔴 No touch o scroll é NATIVO (o ScrollSmoother se desliga sozinho quando
    // smoothTouch:false) e roda no compositor. Mas o ScrollSmoother deixa
    // registrado ScrollTrigger.defaults({scroller: #smooth-wrapper}) — e como o
    // scroller deixa de ser a viewport, o ScrollTrigger cai no pinType
    // "transform" (ScrollTrigger.js:619), que reposiciona o pin por JS na MAIN
    // THREAD. Resultado: durante o momentum o dedo solta, o compositor rola liso
    // e o contra-transform do pin chega atrasado → o Hero pinado TREME.
    // No mobile o #smooth-content não tem transform, então position:fixed ancora
    // na viewport de verdade e o pin passa a ser segurado pelo compositor.
    // Desktop continua em "transform": lá o smoother ESTÁ ativo e o conteúdo
    // também se move por transform — pin e conteúdo na mesma thread, sincronizados.
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const pinSelectors = [".hero"];
    pinSelectors.forEach((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        pin: true,
        pinSpacing: false,
        ...(isMobile && { pinType: "fixed" }),
      });
      triggers.push(trigger);
    });

    const stack = document.querySelectorAll(".section");
    stack.forEach((section, i) => {
      section.style.position = "relative";
      section.style.zIndex = String(10 + i);
    });

    const progress = progressRef.current;
    if (progress) {
      // Com o ScrollSmoother, window.scrollY é o scroll ALVO — o conteúdo
      // chega nele com atraso. Ler o progress do smoother mantém a barra
      // colada no que está na tela em vez de correr na frente. A busca é feita
      // a cada frame, não aqui: este efeito roda ANTES do pai que cria o
      // smoother (efeito de filho vem primeiro no React).
      // scaleX em vez de width: `width` invalida o layout, e como os outros
      // tickers leem getBoundingClientRect no mesmo frame, cada leitura virava
      // um reflow síncrono forçado (medido: ~123× mais caro que os mesmos reads
      // sem o write no meio). O `last` corta a escrita quando nada mudou.
      let last = -1;
      const update = () => {
        const smoother = ScrollSmoother.get();
        const pct = smoother
          ? smoother.progress
          : window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const v = Math.max(0, Math.min(1, pct));
        if (Math.abs(v - last) < 0.0005) return;
        last = v;
        progress.style.transform = `scaleX(${v.toFixed(4)})`;
      };

      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      // O smoother move o conteúdo por transform entre eventos de scroll;
      // o ticker cobre esses frames intermediários.
      gsap.ticker.add(update);
      cleanupProgress = () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        gsap.ticker.remove(update);
      };
    }

    ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (cancelled) return;
        // document.fonts.ready (TODA fonte, inclusive a do carrossel) ainda
        // pode disparar enquanto o loader esta na tela — ele libera cedo
        // agora (so espera Bebas Neue + Inter). Rodar o refresh aqui recalcula
        // posicao de TODOS os ScrollTriggers (pin do hero + pin do carrossel)
        // depois que a fonte tardia do carrossel muda metricas de texto. Se o
        // loader ainda estiver ativo nesse instante, so pulamos: handleInitialLoaderDone
        // chama o mesmo refresh() de novo assim que ele sai de cena, sem
        // disputa de main thread com o rAF do contador.
        if (loaderActiveRef.current) return;

        // No refresh sem loader, fonts.ready costuma resolver enquanto as
        // palavras do Hero ainda sobem. Um refresh global nesse intervalo
        // recalcula todos os pins e produz um frame brusco. Agenda para depois
        // do fim conhecido da cascata. A flag/cleanup também elimina o callback
        // órfão da primeira montagem de desenvolvimento (React StrictMode).
        const elapsed = performance.now() - effectStartedAt;
        const wait = Math.max(0, HERO_CASCADE_SAFE_MS - elapsed);
        fontsRefreshTimer = window.setTimeout(() => {
          if (cancelled) return;
          const smootherY = ScrollSmoother.get()?.scrollTop() ?? 0;
          // A geometria principal já foi fechada pelo build inicial do
          // carrossel. Se o usuário saiu do topo, um refresh global tardio só
          // disputa a main thread com a próxima cascata; nesse caso é mais
          // seguro manter os triggers atuais.
          if (Math.max(Math.abs(window.scrollY), Math.abs(smootherY)) > 2) return;
          ScrollTrigger.refresh();
        }, wait);
      });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(fontsRefreshTimer);
      cleanupProgress();
      triggers.forEach((trigger) => trigger.kill());
    };
    // Sem heroReady nas deps de propósito: geometria de `.hero`/`.section` não
    // muda com a cascata de abertura (só transform/opacity nos filhos).
    // Depender disso fazia o efeito re-rodar — e re-chamar ScrollTrigger.refresh()
    // — bem no instante em que a cascata começa a tocar (medido: ~22ms de atraso
    // no 1º frame). Refresh pós-fontes continua coberto pelo fonts.ready abaixo.
  }, []);

  return (
    <>
      <Seo {...getStaticSeo("home")} />
      {/* Estes três são position:fixed. O #smooth-content do ScrollSmoother
          tem transform, o que faria eles ficarem fixos ao conteúdo em vez da
          viewport — por isso vão pro body via portal. */}
      {createPortal(
        <>
          <div className="scroll-progress" ref={progressRef} aria-hidden="true"></div>
          {loaderState.showInitialLoader && (
            <InitialLoader
              onDone={handleInitialLoaderDone}
            />
          )}
          {preHeroVisible && (
            <PreHero
              active={loaderState.introUnlocked}
              onDone={handlePreHeroDone}
              onHidden={handlePreHeroHidden}
            />
          )}
        </>,
        document.body
      )}
      <Hero ready={heroReady && pageGeometryReady} />
      <LandingPages onGeometryReady={handlePageGeometryReady} />
      <Bridge />
      <Automation />
      {SHOW_ABOUT_SECTION && <About />}
      <Contact />
    </>
  );
}

export default App;
