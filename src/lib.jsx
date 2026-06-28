import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, Flip, SplitText);

export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

export function useTitleReveal(ref, { trigger, start = "top 80%", delay = 0, stagger = 0.08 } = {}) {
  useIsoLayoutEffect(() => {
    if (!ref.current) return;

    const spans = ref.current.querySelectorAll(".word > span");
    if (!spans.length) return;

    if (prefersReducedMotion()) {
      gsap.set(spans, { y: 0, yPercent: 0, clearProps: "transform" });
      return;
    }

    gsap.set(spans, { y: 0, yPercent: 110 });

    const opts = {
      y: 0,
      yPercent: 0,
      duration: 0.95,
      ease: "power3.out",
      stagger,
      delay,
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

export { gsap, ScrollTrigger, Flip, SplitText };
