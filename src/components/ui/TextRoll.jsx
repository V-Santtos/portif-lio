import { useRef } from "react";
import { ScrollTrigger, gsap, prefersReducedMotion, useIsoLayoutEffect } from "../../lib.jsx";

export function TextRoll({
  children,
  duration = 0.5,
  getEnterDelay = (index) => index * 0.1,
  getExitDelay = (index) => index * 0.1 + 0.2,
  className = "",
  ease = "power1.in",
  play = true,
  triggerOn = "mount",
  hoverFadeDuration = 0.08,
  leaveDelay = 80,
  trigger,
  start = "top 75%",
  variants,
  onAnimationComplete,
}) {
  const rootRef = useRef(null);
  const text = String(children ?? "");
  const letters = text.split("");

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const base = root.querySelector(".text-roll__base");
    const animated = root.querySelector(".text-roll__animated");
    const enterFaces = root.querySelectorAll(".text-roll__face--enter");
    const exitFaces = root.querySelectorAll(".text-roll__face--exit");
    if (!enterFaces.length || !exitFaces.length) return;

    const enterInitial = variants?.enter?.initial ?? { rotateX: 0, opacity: 1 };
    const enterAnimate = variants?.enter?.animate ?? { rotateX: 90, opacity: 0 };
    const exitInitial = variants?.exit?.initial ?? { rotateX: -90, opacity: 0 };
    const exitAnimate = variants?.exit?.animate ?? { rotateX: 0, opacity: 1 };

    if (prefersReducedMotion() || !play) {
      gsap.set(base, { opacity: 1 });
      gsap.set(animated, { opacity: 0 });
      gsap.set(enterFaces, { rotateX: 0, opacity: 1 });
      gsap.set(exitFaces, { rotateX: -90, opacity: 0 });
      return;
    }

    const resolvedTrigger = trigger && "current" in trigger ? trigger.current : trigger;
    if (triggerOn === "scroll" && trigger && !resolvedTrigger) return;

    let cleanupInteraction = () => {};
    let leaveTimer;

    const ctx = gsap.context(() => {
      const showBase = () => {
        gsap.set(animated, { opacity: 0 });
        gsap.set(base, { opacity: 1 });
      };

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          showBase();
          if (onAnimationComplete) onAnimationComplete();
        },
      });

      gsap.set(animated, { opacity: triggerOn === "hover" ? 0 : 1 });
      gsap.set(base, { opacity: triggerOn === "hover" ? 1 : 0 });

      enterFaces.forEach((face, index) => {
        gsap.set(face, enterInitial);
        tl.to(face, { ...enterAnimate, duration, ease }, getEnterDelay(index));
      });

      exitFaces.forEach((face, index) => {
        gsap.set(face, exitInitial);
        tl.to(face, { ...exitAnimate, duration, ease }, getExitDelay(index));
      });

      if (triggerOn === "hover") {
        const playForward = () => {
          clearTimeout(leaveTimer);
          tl.pause(0);
          gsap.set(enterFaces, enterInitial);
          gsap.set(exitFaces, exitInitial);
          gsap.to(base, { opacity: 0, duration: hoverFadeDuration, ease: "power1.out" });
          gsap.to(animated, { opacity: 1, duration: hoverFadeDuration, ease: "power1.out" });
          tl.play(0);
        };
        const playBack = () => {
          clearTimeout(leaveTimer);
          leaveTimer = window.setTimeout(() => {
            tl.pause(0).progress(0);
            gsap.set(enterFaces, enterInitial);
            gsap.set(exitFaces, exitInitial);
            gsap.to(animated, { opacity: 0, duration: hoverFadeDuration, ease: "power1.out" });
            gsap.to(base, { opacity: 1, duration: hoverFadeDuration, ease: "power1.out" });
          }, leaveDelay);
        };

        root.addEventListener("mouseenter", playForward);
        root.addEventListener("mouseleave", playBack);

        cleanupInteraction = () => {
          clearTimeout(leaveTimer);
          root.removeEventListener("mouseenter", playForward);
          root.removeEventListener("mouseleave", playBack);
        };
        return;
      }

      if (triggerOn === "scroll" && resolvedTrigger) {
        tl.scrollTrigger = ScrollTrigger.create({
          trigger: resolvedTrigger,
          start,
          animation: tl,
          toggleActions: "play none none none",
        });
        return;
      }

      tl.play();
    }, root);

    return () => {
      cleanupInteraction();
      ctx.revert();
    };
  }, [text, duration, ease, play, triggerOn, hoverFadeDuration, leaveDelay, trigger, start, variants, getEnterDelay, getExitDelay, onAnimationComplete]);

  return (
    <span className={`text-roll ${className}`.trim()} aria-label={text} ref={rootRef}>
      <span className="text-roll__base">{text}</span>
      <span className="text-roll__animated" aria-hidden="true">
        {letters.map((letter, index) => {
          const glyph = letter === " " ? "\u00A0" : letter;

          return (
            <span key={`${letter}-${index}`} className="text-roll__letter">
              <span className="text-roll__face text-roll__face--enter">
                {glyph}
              </span>
              <span className="text-roll__face text-roll__face--exit">
                {glyph}
              </span>
              <span className="text-roll__spacer">{glyph}</span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
