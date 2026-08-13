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
function CasePreviewFrame({ src, title }) {
  const rootRef = useRef(null);
  const iframeRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, x: 0, y: 0 });

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

  return (
    <div className="case-preview-frame" ref={rootRef}>
      <iframe
        ref={iframeRef}
        className="case-preview-frame__document"
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        style={{
          transform: `translate3d(${fit.x}px, ${fit.y}px, 0) scale(${fit.scale})`,
        }}
      />
    </div>
  );
}

export default CasePreviewFrame;
