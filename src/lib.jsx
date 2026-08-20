import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Flip, SplitText, DrawSVGPlugin, Physics2DPlugin);

export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Confete via Physics2DPlugin — sem lib externa. Cria pecinhas DOM (círculos +
// retângulos) numa camada fixed e dá a cada uma velocidade/ângulo/gravidade
// aleatórios: elas EXPLODEM pra cima e caem como confete real. Paleta quente
// casada com a referência (Bogdan). Silenciado em reduced-motion.
const CONFETTI_COLORS = ["#E8500E", "#F2A007", "#F5D06B", "#EDE7DC", "#B9B5AD", "#8C2A16"];

export function fireConfetti(opts = {}) {
  if (prefersReducedMotion()) return;
  const {
    x = window.innerWidth / 2,
    y = window.innerHeight / 2,
    count = 90,
    spread = 180, // leque angular (graus) centrado pra cima
    power = 620, // velocidade máx (px/s)
    colors = CONFETTI_COLORS,
  } = opts;

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:120;overflow:hidden;";
  document.body.appendChild(layer);

  const pieces = [];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("i");
    const size = gsap.utils.random(6, 12);
    const rect = Math.random() > 0.5;
    p.style.cssText =
      "position:absolute;top:0;left:0;will-change:transform;" +
      `width:${size}px;height:${rect ? size * 0.5 : size}px;` +
      `background:${gsap.utils.random(colors)};` +
      `border-radius:${rect ? "1px" : "50%"};`;
    layer.appendChild(p);
    pieces.push(p);
  }

  // Posiciona todas na origem (centro do burst) com rotação aleatória.
  gsap.set(pieces, { x, y, rotation: () => gsap.utils.random(0, 360) });
  // Física: velocidade+ângulo+gravidade por peça (270° = pra cima na tela).
  gsap.to(pieces, {
    duration: () => gsap.utils.random(1.1, 2.0),
    physics2D: {
      velocity: () => gsap.utils.random(power * 0.35, power),
      angle: () => gsap.utils.random(270 - spread / 2, 270 + spread / 2),
      gravity: 900,
    },
    rotation: "+=random(-540, 540)",
    ease: "none",
  });
  // Fade-out escalonado no fim do voo.
  gsap.to(pieces, {
    duration: 0.45,
    delay: () => gsap.utils.random(1.0, 1.7),
    opacity: 0,
    ease: "power1.in",
  });
  // Limpa a camada quando o último cair.
  gsap.delayedCall(2.7, () => layer.remove());
}

// Posição de scroll VISUAL — a que o usuário enxerga. Com o ScrollSmoother,
// `window.scrollY` é o alvo nativo e o conteúdo chega nele depois; pior, ao
// pausar o smoother ele sincroniza o nativo com o visual, o que faz o
// `window.scrollY` SALTAR PRA TRÁS sem o usuário ter rolado pra cima. Quem
// decide algo por direção de scroll tem que ler daqui, não do window.
export function currentScrollY() {
  return ScrollSmoother.get()?.scrollTop() ?? window.scrollY;
}

// Rolagem programática (botões "voltar ao topo", âncoras de seção). Passa pelo
// ScrollSmoother quando ele existe — window.scrollTo mexeria só no scroll
// nativo e o conteúdo, movido por transform, chegaria depois, com dois easings
// somados. `target` aceita px ou elemento/seletor.
export function scrollPageTo(target, { smooth = true } = {}) {
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(target, smooth && !prefersReducedMotion());
    return;
  }
  const behavior = smooth && !prefersReducedMotion() ? "smooth" : "auto";
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior });
}

// Destino do link CONTATO: o card SUA IDEIA da Automation, onde mora o botão
// do WhatsApp — não a seção #contato do rodapé. Medido AO VIVO (regra da
// região abaixo do carrossel: nada de posição capturada antes).
// A âncora é o card SUA IDEIA, não a fileira `.auto__cards`: no desktop os
// três dividem o mesmo topo e o enquadramento é o mesmo (cards no alto,
// "Veja de perto" fechando embaixo), mas no mobile eles empilham e mirar na
// fileira jogaria o botão do WhatsApp 60px ABAIXO da tela — justo o que o
// link existe pra mostrar. Os 6% são a folga do topo.
export function goToContactCta() {
  const card = document.querySelector(".auto__card--highlight") || document.querySelector(".auto__cards");
  if (!card) return false;
  const target = card.getBoundingClientRect().top + currentScrollY() - window.innerHeight * 0.06;
  // A Escada fica no caminho: o check ao vivo dela dispararia no frame
  // seguinte ao salto, travaria o scroll por ~3,3s e roubaria o pouso.
  window.dispatchEvent(new CustomEvent("bridge:skip"));
  scrollPageTo(Math.max(0, target), { smooth: false });
  window.dispatchEvent(new CustomEvent("contact:highlight"));
  return true;
}

// Salto de página suavizado: um fade rápido cobre a tela, o jump acontece
// instantâneo por trás (sem atravessar o scrub do carrossel) e revela no
// destino. Peça simples — só opacity num div fixo, sem scroll-lock.
export function fadeJump(doJump) {
  if (prefersReducedMotion()) { doJump(); return; }
  const overlay = document.createElement("div");
  overlay.className = "scroll-fade";
  document.body.appendChild(overlay);
  gsap.fromTo(
    overlay,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.24,
      ease: "power2.inOut",
      onComplete: () => {
        doJump();
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.34,
          ease: "power2.inOut",
          delay: 0.05,
          onComplete: () => overlay.remove(),
        });
      },
    }
  );
}

export function splitWordsHTML(text) {
  return text
    .split(/(\s+)/)
    .map((seg) => {
      if (/^\s+$/.test(seg)) return seg;
      return `<span class="word"><span>${seg}</span></span>`;
    })
    .join("");
}

export function Button({ children, variant = "accent", href, onClick, className = "" }) {
  const cls = `btn btn--${variant} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function SplitHeading({ as: Tag = "h1", text, className = "", accentMatch }) {
  const html = (() => {
    let out = "";
    const words = text.split(/(\s+)/);
    for (const seg of words) {
      if (/^\s+$/.test(seg)) {
        out += seg;
        continue;
      }
      const isAccent = accentMatch && seg.toLowerCase().includes(accentMatch.toLowerCase());
      out += `<span class="word${isAccent ? " accent" : ""}"><span>${seg}</span></span>`;
    }
    return out;
  })();

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function useTitleReveal(
  ref,
  { trigger, start = "top 80%", delay = 0, stagger = 0.08, onComplete } = {}
) {
  useIsoLayoutEffect(() => {
    if (!ref.current) return;

    const spans = ref.current.querySelectorAll(".word > span");
    if (!spans.length) return;

    if (prefersReducedMotion()) {
      gsap.set(spans, { y: 0, yPercent: 0, clearProps: "transform" });
      onComplete?.();
      return;
    }

    // 160 (não 110): o til de "impressão"/"Ã" vaza pela máscara — e a folga
    // de baixo do cedilha (padding-bottom 0.15em na .word) estende a janela
    // visível, então precisa afundar além dos 135 usados na Automation.
    gsap.set(spans, { y: 0, yPercent: 160 });

    const opts = {
      y: 0,
      yPercent: 0,
      duration: 0.95,
      ease: "power3.out",
      stagger,
      delay,
      onComplete,
    };

    const triggerEl = trigger && "current" in trigger ? trigger.current : trigger;

    if (trigger && !triggerEl) return;

    if (triggerEl) {
      opts.scrollTrigger = {
        trigger: triggerEl,
        start,
        toggleActions: "play none none none",
      };
    }

    const tw = gsap.to(spans, opts);
    return () => {
      if (tw.scrollTrigger) tw.scrollTrigger.kill();
      tw.kill();
    };
  }, []);
}

export { gsap, ScrollTrigger, ScrollSmoother, Flip, SplitText, DrawSVGPlugin, Physics2DPlugin };
