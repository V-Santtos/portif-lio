import { useEffect, useLayoutEffect, useRef, useState } from "react";

const CAPSULE_CANVAS = {
  width: 1440,
  height: 810,
};

/**
 * Moldura reutilizavel para cases reais isolados em /public/previews.
 * O iframe preserva o CSS do case sem contaminar o portfolio; a ponte de
 * wheel devolve o scroll ao documento principal para o carrossel continuar.
 */
function CasePreviewFrame({ src, posterSrc, title, loadAllowed = true }) {
  const rootRef = useRef(null);
  const iframeRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, x: 0, y: 0 });
  const [shouldLoad, setShouldLoad] = useState(false);
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

  // `loading="lazy"` sozinho não segura as cápsulas. Além da proximidade, a
  // seção pai libera a carga só depois que a cascata do título terminou — dois
  // documentos completos montando durante os spans eram a travada da seção 2.
  // Se alguém atravessar a seção muito rápido, o card ainda pode se liberar ao
  // ficar realmente visível; assim não trocamos a travada por um quadro vazio.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      {
        // Depois do título, 45% de margem horizontal acorda exatamente o
        // próximo card ainda fora da tela. Ele termina de montar antes de sua
        // ponta aparecer, sem liberar dois ou três iframes distantes juntos.
        root: document.querySelector("#smooth-wrapper"),
        rootMargin: loadAllowed
          ? `${Math.round(window.innerHeight)}px 45%`
          : "0px -12%",
        threshold: loadAllowed ? 0 : 0.5,
      }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [loadAllowed]);

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
        event.origin !== window.location.origin ||
        event.data?.type !== "case-preview:wheel"
      ) {
        return;
      }

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
      setFrameReady(true);
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

export default CasePreviewFrame;
