import { useCallback, useRef, useState } from "react";
import { ScrollTrigger, prefersReducedMotion, useIsoLayoutEffect } from "./lib.jsx";
import InitialLoader, { INITIAL_LOADER_KEY } from "./InitialLoader.jsx";
import PreHero from "./PreHero.jsx";
import Hero from "./Hero.jsx";
import LandingPages from "./LandingPages.jsx";
import Bridge from "./Bridge.jsx";
import Automation from "./Automation.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";

const SHOW_ABOUT_SECTION = false;

function shouldShowInitialLoader() {
  if (typeof window === "undefined") return true;
  return window.sessionStorage.getItem(INITIAL_LOADER_KEY) !== "1";
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
  const progressRef = useRef(null);
  const openingActive = loaderState.showInitialLoader || preHeroVisible;
  const handleInitialLoaderDone = useCallback(() => {
    setLoaderState({
      showInitialLoader: false,
      introUnlocked: true,
    });
  }, []);

  const handlePreHeroDone = useCallback(() => {
    setHeroReady(true);
  }, []);

  const handlePreHeroHidden = useCallback(() => {
    setPreHeroVisible(false);
  }, []);

  useIsoLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    document.documentElement.removeAttribute("data-booting");
  }, []);

  useIsoLayoutEffect(() => {
    document.documentElement.classList.toggle("is-opening-screen", openingActive);

    return () => {
      document.documentElement.classList.remove("is-opening-screen");
    };
  }, [openingActive]);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const triggers = [];
    let cleanupProgress = () => {};

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
      const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = Math.max(0, Math.min(1, window.scrollY / max));
        progress.style.width = `${(pct * 100).toFixed(2)}%`;
      };

      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      cleanupProgress = () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      };
    }

    ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      cleanupProgress();
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [heroReady]);

  return (
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
      <Hero ready={heroReady} />
      <LandingPages />
      <Bridge />
      <Automation />
      {SHOW_ABOUT_SECTION && <About />}
      <Contact />
    </>
  );
}

export default App;
