import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "./lib.jsx";

export const INITIAL_LOADER_KEY = "victor-initial-loader-seen-v1";

// Teto do gate de assets: se fonte ou logo travarem, a abertura nao fica refem
// deles.
const MAX_WAIT_MS = 3600;

// Fade do overlay depois que os numerais saem. Precisa bater com a transition
// do .initial-loader.is-exiting em 03-loader.css.
const EXIT_MS = 520;

// Duracao de cada parada e da saida. A referencia (bogdankolomiyets.com) usa
// 1.2s por parada, o que soma ~6,3s de abertura com o slide final dela.
// Encurtado com o Victor em 2026-08-22: mesma mecanica, menos tempo.
const STOP_DUR = 0.85;
const OUT_DUR = 0.7;

// Ordem da pilha de digitos: 1..9 e o ZERO POR ULTIMO. Nao e escolha de
// estilo — as contas de rowOf/yFor dependem dela, e a virada final (9 -> 0,
// pra formar o "100") so rola pra FRENTE porque o zero fecha a pilha em vez
// de abrir. Com a pilha em 0..9 o ultimo passo volta pro topo e o 100 entra
// dando um pulo pra tras.
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const ROW = 100 / DIGITS.length;

// Digito -> linha da pilha -> deslocamento em % da PROPRIA pilha. yPercent (e
// nao em) de proposito: sendo relativo a altura do proprio elemento, a mesma
// conta serve pra pilha de 10 linhas e pra da centena, que tem so uma.
const rowOf = (d) => (d === 0 ? DIGITS.length - 1 : d - 1);
const yFor = (d) => -rowOf(d) * ROW;

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function waitForImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = src;
  });
}

// document.fonts.ready espera TODA fonte da pagina, inclusive a do carrossel
// (Anton Preview, Geist Eco Preview) la embaixo, fora da tela nesse momento —
// media 1,6s no caminho critico e prendia a abertura por causa de algo que o
// loader/PreHero nem usam. Aqui so as duas fontes que aparecem antes do reveal
// (Bebas Neue no contador, Inter no PreHero).
function waitForEssentialFonts() {
  if (!document.fonts?.load) return Promise.resolve();
  return Promise.all([
    document.fonts.load('400 1em "Bebas Neue"'),
    document.fonts.load('400 1em "Inter"'),
  ]).catch(() => {});
}

function waitForFrame(count = 2) {
  return new Promise((resolve) => {
    let remaining = count;
    const step = () => {
      remaining -= 1;
      if (remaining <= 0) {
        resolve();
        return;
      }
      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  });
}

function InitialLoader({ onDone }) {
  const [isExiting, setIsExiting] = useState(false);
  const rootRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let cancelled = false;
    let exitTimer = 0;
    let tl = null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const finish = () => {
      if (cancelled || doneRef.current) return;
      doneRef.current = true;
      window.sessionStorage.setItem(INITIAL_LOADER_KEY, "1");
      setIsExiting(true);
      exitTimer = window.setTimeout(() => {
        document.body.style.overflow = previousOverflow;
        onDone?.();
      }, EXIT_MS);
    };

    // O unico "carregamento" real do loader. O resto e coreografia.
    const gate = Promise.race([
      Promise.all([waitForEssentialFonts(), waitForImage("/LOGO.svg"), waitForFrame(2)]),
      delay(MAX_WAIT_MS),
    ]);

    if (prefersReducedMotion()) {
      gate.then(finish);
    } else {
      const q = gsap.utils.selector(root);
      const barTrack = q(".initial-loader__bar");
      const barFill = q(".initial-loader__bar-fill");
      const hundreds = q(".initial-loader__digit--hundreds .initial-loader__digit-track");
      const tens = q(".initial-loader__digit--tens .initial-loader__digit-track");
      const units = q(".initial-loader__digit--units .initial-loader__digit-track");
      const tracks = q(".initial-loader__digit-track");
      const percent = q(".initial-loader__percent");
      const counter = q(".initial-loader__counter");

      // Os dois patamares sao sorteados, igual a referencia: o loader e
      // ficticio dos dois lados — nao existe progresso pra medir. O que vende
      // a leitura de "carregando" e a SILHUETA da subida (dois degraus antes
      // do 100), nao o valor. Contador frame a frame foi o que estava aqui
      // antes e era justamente o que travava: dois patamares mortos (33 e 65)
      // e uma rampa final lerpada em ~1,4s, com o digito trocando por corte
      // seco porque a pilha nao tinha animacao nenhuma.
      const tens1 = gsap.utils.random([2, 3, 4]);
      const units1 = gsap.utils.random([1, 5]);
      const tens2 = gsap.utils.random([5, 6]);
      const units2 = gsap.utils.random([7, 8, 9]);

      // defaults no TIMELINE, nao em gsap.defaults(): a referencia usa o
      // global e vaza ease/duration pra todo tween da pagina depois disso.
      tl = gsap.timeline({
        defaults: { ease: "expo.inOut", duration: STOP_DUR },
        onComplete: finish,
      });

      // Uma linha ABAIXO do primeiro digito = janela vazia. A pilha entra em
      // cena rolando, nunca aparece ja escrita.
      tl.set([tens, units], { yPercent: ROW });
      tl.set([hundreds, percent], { yPercent: 100 });
      tl.set(barFill, { scaleY: 0 });
      // So agora o contador acende. Ate aqui ele estava com visibility:hidden
      // no CSS — sem isso, o useEffect roda depois do paint e o primeiro tick
      // do GSAP so vem no rAF seguinte (medido em 145-270ms), intervalo em que
      // o loader aparecia escrito "111" (a primeira linha das tres pilhas).
      // Resolver isso com transform no CSS NAO funciona: ver o comentario em
      // .initial-loader__counter no 03-loader.css.
      tl.set(counter, { visibility: "visible" });

      // Parada 1
      tl.to(barFill, { scaleY: Number(`${tens1}${units1}`) / 100 })
        .to(tens, { yPercent: yFor(tens1) }, "<")
        .to(units, { yPercent: yFor(units1) }, "<")
        .to(percent, { yPercent: 0 }, "<");

      // Parada 2
      tl.to(barFill, { scaleY: Number(`${tens2}${units2}`) / 100 })
        .to(tens, { yPercent: yFor(tens2) }, "<")
        .to(units, { yPercent: yFor(units2) }, "<");

      // Gate: so fecha em 100 com fonte e logo prontos. Na pratica as duas
      // paradas acima (1,7s) ja cobrem a carga, entao isso quase nunca cobra
      // espera — e o que impede o 100 de mentir quando cobra.
      tl.addPause(">", () => {
        gate.then(() => {
          if (!cancelled) tl.play();
        });
      });

      // Parada 3 — 100
      tl.to(barFill, { scaleY: 1 })
        .to(tens, { yPercent: yFor(0) }, "<")
        .to(units, { yPercent: yFor(0) }, "<")
        .to(hundreds, { yPercent: 0 }, "<");

      // Saida: os numerais sobem um a um — centena, dezena, unidade, % — e a
      // barra recolhe pra CIMA (origem no topo) por ULTIMO. A referencia manda
      // barra e numeros juntos, mas ai a barra (sem stagger) termina bem antes
      // do ultimo numeral e a tela fica um tempo so com o "100" orfao.
      tl.to(tracks, { yPercent: -100, duration: OUT_DUR, stagger: 0.08 })
        .to(percent, { yPercent: -100, duration: OUT_DUR }, "<+=0.24")
        .to(barTrack, { scaleY: 0, transformOrigin: "top", duration: OUT_DUR }, "<+=0.06");
    }

    return () => {
      cancelled = true;
      window.clearTimeout(exitTimer);
      tl?.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      className={`initial-loader${isExiting ? " is-exiting" : ""}`}
      role="status"
      aria-label="Carregando"
    >
      <div className="initial-loader__bar" aria-hidden="true">
        <div className="initial-loader__bar-fill"></div>
      </div>

      <div className="initial-loader__counter" aria-hidden="true">
        <span className="initial-loader__number">
          <span className="initial-loader__digit initial-loader__digit--hundreds">
            <span className="initial-loader__digit-track">
              <span className="initial-loader__digit-row">1</span>
            </span>
          </span>
          <span className="initial-loader__digit initial-loader__digit--tens">
            <span className="initial-loader__digit-track">
              {DIGITS.map((d) => (
                <span className="initial-loader__digit-row" key={d}>{d}</span>
              ))}
            </span>
          </span>
          <span className="initial-loader__digit initial-loader__digit--units">
            <span className="initial-loader__digit-track">
              {DIGITS.map((d) => (
                <span className="initial-loader__digit-row" key={d}>{d}</span>
              ))}
            </span>
          </span>
        </span>
        <span className="initial-loader__percent-mask">
          <span className="initial-loader__percent">%</span>
        </span>
      </div>
    </div>
  );
}

export default InitialLoader;
