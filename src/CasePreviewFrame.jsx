import { useEffect, useLayoutEffect, useRef, useState } from "react";

const CAPSULE_CANVAS = {
  width: 1440,
  height: 810,
};

// Mesmo limiar que já zera pointer-events no iframe via CSS
// (.case-preview-frame, @media (max-width: 767px), (hover: none) em
// src/styles/09-previews.css) — quem cai aqui já não conseguia tocar no
// case, então nunca teve motivo pra pagar o carregamento dele.
const STATIC_QUERY = "(max-width: 767px), (hover: none)";

/**
 * Nesses dispositivos o card nunca foi interativo (ver STATIC_QUERY acima).
 * Carregar um documento completo — GSAP, fontes, imagens, e no caso da
 * Áurea um vídeo de 1,7 MB — pra ele ficar parado embaixo do poster é
 * desperdício puro: medido em 2026-08-21, os 6 iframes do carrossel somavam
 * 6,63 MB contra 201 KB só de posters. Aqui é só a arte final, sem iframe,
 * sem GSAP, sem ponte de wheel.
 */
function StaticCasePreview({ posterSrc, title }) {
  return (
    <div className="case-preview-frame is-ready">
      {posterSrc && (
        <img
          className="case-preview-frame__poster"
          src={posterSrc}
          alt={title ?? ""}
          loading="lazy"
          decoding="async"
          draggable="false"
        />
      )}
    </div>
  );
}

/**
 * Moldura reutilizavel para cases reais isolados em /public/previews.
 * O iframe preserva o CSS do case sem contaminar o portfolio; a ponte de
 * wheel devolve o scroll ao documento principal para o carrossel continuar.
 * Uso exclusivo de telas com hover real (ver STATIC_QUERY) — quem não tem
 * cai em StaticCasePreview antes de qualquer hook aqui rodar.
 */
function InteractiveCasePreview({ src, posterSrc, title, loadAllowed = true }) {
  const rootRef = useRef(null);
  const iframeRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, x: 0, y: 0 });
  const [shouldLoad, setShouldLoad] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [frameReady, setFrameReady] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const update = () => {
      const rect = root.getBoundingClientRect();
      const scale = Math.min(
        rect.width / CAPSULE_CANVAS.width,
        rect.height / CAPSULE_CANVAS.height
      );
      setFit({
        scale,
        x: (rect.width - CAPSULE_CANVAS.width * scale) / 2,
        y: (rect.height - CAPSULE_CANVAS.height * scale) / 2,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Todos os cases só começam depois da cascata do título. A partir daí eles
  // montam JUNTOS, ainda fora da área do carrossel. A política anterior de
  // acordar apenas o próximo card deixava um iframe nascer enquanto ele já
  // entrava na tela durante uma rolagem rápida, causando o reposicionamento
  // perceptível que este fallback existe justamente para evitar.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (loadAllowed) {
      setShouldLoad(true);
      return undefined;
    }

    return undefined;
  }, [loadAllowed]);

  // Nenhum frame troca o poster enquanto o card esta na viewport. Se a pessoa
  // atravessar o carrossel em alta velocidade, ela ve a arte estatica (ja
  // posicionada) durante toda a passagem; o iframe termina em segundo plano e
  // so assume fora da tela, pronto para a proxima aproximacao e para os hovers.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !contentReady || frameReady) return undefined;

    if (!("IntersectionObserver" in window)) {
      setFrameReady(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) return;
        setFrameReady(true);
        observer.disconnect();
      },
      { threshold: 0 }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [contentReady, frameReady]);

  useEffect(() => {
    let pendingWheelDelta = 0;
    let wheelFrame = 0;

    const flushWheel = () => {
      wheelFrame = 0;
      if (pendingWheelDelta === 0) return;

      // O ScrollSmoother suaviza a diferenca entre o scroll nativo (alvo) e a
      // posicao visual. Alimentar window.scrollY preserva esse mecanismo; usar
      // smoother.scrollTo(..., false) aqui tornava cada wheel um salto seco.
      window.scrollTo({
        top: Math.max(0, window.scrollY + pendingWheelDelta),
        behavior: "auto",
      });
      pendingWheelDelta = 0;
    };

    const onMessage = (event) => {
      const frameWindow = iframeRef.current?.contentWindow;
      if (
        event.source !== frameWindow ||
        event.origin !== window.location.origin
      ) {
        return;
      }

      // O poster e o frame foram produzidos para a mesma composicao. Mesmo
      // assim, so revelamos o iframe quando ele confirma que imagens, fontes e
      // dois frames de pintura ja fecharam. Isso impede qualquer reposicionamento
      // perceptivel durante a passagem veloz pelo carrossel.
      if (event.data?.type === "case-preview:ready") {
        setContentReady(true);
        return;
      }

      if (event.data?.type !== "case-preview:wheel") return;

      const deltaY = Number(event.data.deltaY);
      if (!Number.isFinite(deltaY) || deltaY === 0) return;
      pendingWheelDelta += deltaY;
      if (!wheelFrame) wheelFrame = requestAnimationFrame(flushWheel);
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      if (wheelFrame) cancelAnimationFrame(wheelFrame);
    };
  }, []);

  const handleFrameLoad = () => {
    if (!shouldLoad) return;
    try {
      const expected = new URL(src, window.location.href);
      const location = iframeRef.current?.contentWindow?.location;
      if (location?.origin !== expected.origin || location?.pathname !== expected.pathname) return;
      // A revelacao fica por conta de preview-ready.js dentro do iframe. O
      // evento load sozinho nao espera a decodificacao visual das imagens.
    } catch {
      // O poster continua visível se o documento real não puder ser validado.
    }
  };

  return (
    <div className={`case-preview-frame${frameReady ? " is-ready" : ""}`} ref={rootRef}>
      {posterSrc && (
        <img
          className="case-preview-frame__poster"
          src={posterSrc}
          alt=""
          loading="lazy"
          decoding="async"
          draggable="false"
        />
      )}
      <iframe
        ref={iframeRef}
        className="case-preview-frame__document"
        src={shouldLoad ? src : undefined}
        title={title}
        loading="lazy"
        onLoad={handleFrameLoad}
        sandbox="allow-scripts allow-same-origin"
        style={{
          transform: `translate3d(${fit.x}px, ${fit.y}px, 0) scale(${fit.scale})`,
        }}
      />
    </div>
  );
}

/**
 * Decide a variante uma única vez por montagem e reage a mudanças reais de
 * dispositivo (girar a tela, redimensionar a janela) — não a cada render.
 */
function CasePreviewFrame(props) {
  const [isStatic, setIsStatic] = useState(
    () => typeof window !== "undefined" && window.matchMedia(STATIC_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(STATIC_QUERY);
    const onChange = (event) => setIsStatic(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isStatic ? (
    <StaticCasePreview posterSrc={props.posterSrc} title={props.title} />
  ) : (
    <InteractiveCasePreview {...props} />
  );
}

export default CasePreviewFrame;
