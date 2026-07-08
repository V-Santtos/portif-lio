import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useIsoLayoutEffect, prefersReducedMotion } from "./lib.jsx";

// Comparador antes/depois com divisória arrastável. Reutilizável em qualquer
// case de redesign — recebe duas imagens de MESMA proporção e recorta a de
// cima (antes) revelando a de baixo (depois). Ponteiro nativo (mouse + toque)
// + teclado. Sem dependência externa; a posição vive numa var CSS --pos.
function CaseCompare({
  before,
  after,
  beforeAlt = "",
  afterAlt = "",
  beforeLabel = "ANTES",
  afterLabel = "DEPOIS",
  ratio = "3 / 2",
  url,
  start = 50,
  // Molduras de mockup (ex: notebook): a comparação vive encaixada no recorte
  // da tela da imagem `mockup`, medido em % (top/left/right/bottom) a partir
  // do canvas inteiro do mockup. Quando presente, a barra de navegador falsa
  // some — o próprio mockup já faz o papel de moldura.
  mockup,
  mockupRatio = "2391 / 1426",
  screenInset = { top: 7.85, left: 13.47, right: 13.13, bottom: 14.38 },
}) {
  const frameRef = useRef(null);
  const draggingRef = useRef(false);
  const introRef = useRef(null);
  const [pos, setPos] = useState(start);

  const clamp = (n) => Math.max(0, Math.min(100, n));

  // Empurrãozinho de entrada: quando a seção entra na tela, a divisória dá uma
  // mexida fluida pros dois lados e volta ao meio — dica de que dá pra arrastar.
  // Anima a var CSS direto (fora do state do React) e cancela se o usuário
  // interagir antes. Respeita prefers-reduced-motion.
  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame || prefersReducedMotion()) return;

    const proxy = { v: start };
    const apply = () => frame.style.setProperty("--pos", proxy.v + "%");

    const tl = gsap.timeline({ paused: true, defaults: { ease: "sine.inOut" } });
    tl.to(proxy, { v: start + 13, duration: 0.7, onUpdate: apply })
      .to(proxy, { v: start - 11, duration: 0.85, onUpdate: apply })
      .to(proxy, { v: start, duration: 0.6, onUpdate: apply });
    introRef.current = tl;

    const st = ScrollTrigger.create({
      trigger: frame,
      start: "top 75%",
      once: true,
      onEnter: () => gsap.delayedCall(0.35, () => tl.play()),
    });

    return () => { st.kill(); tl.kill(); introRef.current = null; };
  }, []);

  const setFromClientX = (clientX) => {
    const frame = frameRef.current;
    if (!frame) return;
    const r = frame.getBoundingClientRect();
    setPos(clamp(((clientX - r.left) / r.width) * 100));
  };

  const onPointerDown = (e) => {
    introRef.current?.kill(); // usuário assumiu o controle
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    if (draggingRef.current) setFromClientX(e.clientX);
  };
  const endDrag = (e) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const onKeyDown = (e) => {
    introRef.current?.kill();
    let next = pos;
    if (e.key === "ArrowLeft") next = pos - 2;
    else if (e.key === "ArrowRight") next = pos + 2;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 100;
    else return;
    e.preventDefault();
    setPos(clamp(next));
  };

  const frame = (
    <div
      className="case-compare__frame"
      ref={frameRef}
      style={
        mockup
          ? {
              "--pos": pos + "%",
              top: screenInset.top + "%",
              left: screenInset.left + "%",
              right: screenInset.right + "%",
              bottom: screenInset.bottom + "%",
            }
          : { aspectRatio: ratio, "--pos": pos + "%" }
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* base = depois (novo) */}
      <img className="case-compare__img" src={after} alt={afterAlt} draggable="false" loading="lazy" />

      {/* camada de cima recortada = antes (antigo) */}
      <div className="case-compare__before">
        <img className="case-compare__img" src={before} alt={beforeAlt} draggable="false" loading="lazy" />
        {beforeLabel && (
          <span className="case-compare__label case-compare__label--before">{beforeLabel}</span>
        )}
      </div>

      {afterLabel && (
        <span className="case-compare__label case-compare__label--after">{afterLabel}</span>
      )}

      <div
        className="case-compare__handle"
        role="slider"
        tabIndex={0}
        aria-label="Comparar antes e depois"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={onKeyDown}
      >
        <span className="case-compare__knob" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 3 12 9 18" />
            <polyline points="15 6 21 12 15 18" />
          </svg>
        </span>
      </div>
    </div>
  );

  if (mockup) {
    return (
      <div className="case-compare case-compare--mockup">
        <div className="case-compare__mockup" style={{ aspectRatio: mockupRatio }}>
          {frame}
          <img className="case-compare__mockup-img" src={mockup} alt="" aria-hidden="true" draggable="false" />
        </div>
      </div>
    );
  }

  return (
    <div className="case-compare">
      {url && (
        <div className="case-compare__bar" aria-hidden="true">
          <span className="case-compare__dots"><i /><i /><i /></span>
          <span className="case-compare__url">{url}</span>
        </div>
      )}
      {frame}
    </div>
  );
}

export default CaseCompare;
