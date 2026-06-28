import { useEffect, useRef, useState } from "react";

export const INITIAL_LOADER_KEY = "victor-initial-loader-seen-v1";

const MIN_VISIBLE_MS = 2500;
const MAX_WAIT_MS = 3600;
const EXIT_MS = 520;

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

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function getStagedProgress(elapsed, canFinish) {
  if (canFinish) return 100;

  if (elapsed < 650) {
    return 1 + easeOutCubic(elapsed / 650) * 32;
  }

  if (elapsed < 1150) {
    return 33;
  }

  if (elapsed < 1850) {
    return 33 + easeOutCubic((elapsed - 1150) / 700) * 32;
  }

  return 65;
}

function InitialLoader({ onDone }) {
  const [progress, setProgress] = useState(1);
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef(1);
  const calledDoneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    let exitTimer = 0;
    const startedAt = performance.now();
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const essentials = Promise.all([
      document.fonts?.ready || Promise.resolve(),
      waitForImage("/LOGO.svg"),
      waitForFrame(2),
    ]);

    let essentialsDone = false;
    Promise.race([essentials, delay(MAX_WAIT_MS)]).then(() => {
      essentialsDone = true;
    });

    const finish = () => {
      if (cancelled || calledDoneRef.current) return;
      calledDoneRef.current = true;
      window.sessionStorage.setItem(INITIAL_LOADER_KEY, "1");
      setIsExiting(true);
      exitTimer = window.setTimeout(() => {
        document.body.style.overflow = previousOverflow;
        onDone?.();
      }, EXIT_MS);
    };

    const tick = (now) => {
      if (cancelled) return;

      const elapsed = now - startedAt;
      const canFinish = essentialsDone && elapsed >= MIN_VISIBLE_MS;
      const target = getStagedProgress(elapsed, canFinish);

      progressRef.current += (target - progressRef.current) * (canFinish ? 0.045 : 0.075);
      const nextProgress = Math.min(100, Math.max(1, Math.floor(progressRef.current)));
      setProgress(nextProgress);

      if (canFinish && progressRef.current >= 99.35) {
        setProgress(100);
        window.setTimeout(finish, 320);
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(exitTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onDone]);

  const label = progress === 100 ? "100" : String(progress).padStart(2, "0");

  return (
    <div
      className={`initial-loader${isExiting ? " is-exiting" : ""}`}
      aria-label={`Carregando ${progress}%`}
      role="status"
      style={{ "--loader-progress": `${progress}%` }}
    >
      <div className="initial-loader__bar" aria-hidden="true">
        <div className="initial-loader__bar-fill"></div>
      </div>

      <div className="initial-loader__counter" aria-hidden="true">
        <span className="initial-loader__number">{label}</span>
        <span className="initial-loader__percent">%</span>
      </div>

      <div className="initial-loader__capsule" aria-hidden="true"></div>
    </div>
  );
}

export default InitialLoader;
