import { useEffect, useRef, useState } from "react";

export const INITIAL_LOADER_KEY = "victor-initial-loader-seen-v1";

const MIN_VISIBLE_MS = 2500;
const MAX_WAIT_MS = 3600;
const EXIT_MS = 520;

// Tempo minimo que CADA numero fica na tela. O contador continua seguindo o
// progresso eased do getStagedProgress (com as pausas em 33 e 65) — o que
// muda e que, quando o progresso corre rapido, ele PULA valores em vez de
// trocar a cada frame. Ler "12, 19, 26" e melhor que ver os 100 numeros
// borrados a 60fps; contar 1 a 1 num ritmo fixo tambem nao serve, vira
// metralhadora e mata as pausas do staging.
const MIN_STEP_MS = 90;

// Teto do salto por passo. Sem isso a rampa final (lerp rapido) faz o numero
// pular 66 -> 87 de uma vez, que le como erro e nao como progresso. Com o
// teto ele desfia 66, 74, 82, 90... — rapido, mas ainda contando.
const MAX_STEP = 8;

// Saida coreografada: o 100 fica um instante parado, depois cada numeral sai
// um de cada vez (stagger no CSS), e so entao o overlay apaga.
const HOLD_100_MS = 340;
const LEAVE_MS = 700;

// Pilhas estaticas do "rolo" de digito: cada linha i mostra i%10. Precisam
// cobrir a faixa inteira (0-100 unidades, 0-10 dezenas) sem repetir o ciclo
// 0-9 uma unica vez — senao o wrap (9 -> 0) da um pulo seco no meio da
// animacao em vez de rolar liso.
const UNITS_ROWS = Array.from({ length: 101 }, (_, i) => i % 10);
const TENS_ROWS = Array.from({ length: 11 }, (_, i) => i % 10);

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
  const [displayValue, setDisplayValue] = useState(1);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef(1);
  const displayValueRef = useRef(1);
  const lastTickAtRef = useRef(0);
  const calledDoneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    let exitTimer = 0;
    let holdTimer = 0;
    let leaveTimer = 0;
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

    // Chegou em 100: segura um instante, manda os numerais saírem um a um
    // (o stagger e do CSS) e so depois apaga o overlay.
    const startLeave = () => {
      if (cancelled || calledDoneRef.current) return;
      setIsLeaving(true);
      leaveTimer = window.setTimeout(finish, LEAVE_MS);
    };

    const tick = (now) => {
      if (cancelled) return;

      const elapsed = now - startedAt;
      const canFinish = essentialsDone && elapsed >= MIN_VISIBLE_MS;
      const target = getStagedProgress(elapsed, canFinish);

      progressRef.current += (target - progressRef.current) * (canFinish ? 0.045 : 0.075);
      // Sem Math.floor aqui de proposito: a barra usa o valor cru
      // (fracionado) pra ficar suave a cada frame.
      const nextProgress = Math.min(100, Math.max(1, progressRef.current));
      setProgress(nextProgress);

      // O numero acompanha o mesmo progresso eased da barra (por isso mantem
      // as pausas do staging), so que quantizado e com tempo minimo de tela:
      // se o progresso correu, ele PULA direto pro valor atual em vez de
      // desfiar todos os intermediarios. Trava em 99 ate canFinish pra nao
      // bater 100% antes da hora.
      const stepTarget = canFinish
        ? Math.min(100, Math.floor(progressRef.current))
        : Math.min(99, Math.floor(progressRef.current));
      if (stepTarget > displayValueRef.current && now - lastTickAtRef.current >= MIN_STEP_MS) {
        displayValueRef.current = Math.min(stepTarget, displayValueRef.current + MAX_STEP);
        lastTickAtRef.current = now;
        setDisplayValue(displayValueRef.current);
      }

      // O lerp chega em 100 por aproximacao (nunca exato) — fecha a barra na
      // mao. O numero NAO e forcado junto: ele continua subindo pelo passo
      // normal ate cravar 100, senao o teto do MAX_STEP faria um 90 -> 100
      // seco bem no fim, que e justamente o que a saida quer evitar.
      if (canFinish && progressRef.current >= 99.35) {
        progressRef.current = 100;
        setProgress(100);
      }

      if (displayValueRef.current >= 100) {
        holdTimer = window.setTimeout(startLeave, HOLD_100_MS);
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(exitTimer);
      window.clearTimeout(holdTimer);
      window.clearTimeout(leaveTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onDone]);

  // O rolo dos digitos precisa parar EXATAMENTE em cada linha (offset em em
  // inteiro) — com offset fracionado a janela de 1em (overflow:hidden) sempre
  // mostra um recorte de duas linhas empilhadas ao mesmo tempo, em vez de um
  // digito limpo. displayValue já é o inteiro quantizado do loop, entao cada
  // parada e um digito limpo; a barra e que segue no valor cru, suave.
  const tensPos = Math.floor(displayValue / 10);
  const hundredsReveal = Math.max(0, Math.min(1, (displayValue - 97) / 3));

  return (
    <div
      className={`initial-loader${isLeaving ? " is-leaving" : ""}${isExiting ? " is-exiting" : ""}`}
      aria-label={`Carregando ${displayValue}%`}
      role="status"
      style={{ "--loader-progress": progress / 100 }}
    >
      <div className="initial-loader__bar" aria-hidden="true">
        <div className="initial-loader__bar-fill"></div>
      </div>

      <div className="initial-loader__counter" aria-hidden="true">
        <span className="initial-loader__number">
          <span className="initial-loader__digit initial-loader__digit--hundreds">
            <span
              className="initial-loader__digit-row"
              style={{
                transform: `translateY(${(1 - hundredsReveal) * 100}%)`,
                opacity: hundredsReveal,
              }}
            >
              1
            </span>
          </span>
          <span className="initial-loader__digit initial-loader__digit--tens">
            <span
              className="initial-loader__digit-track"
              style={{ transform: `translateY(-${tensPos}em)` }}
            >
              {TENS_ROWS.map((d, i) => (
                <span className="initial-loader__digit-row" key={i}>{d}</span>
              ))}
            </span>
          </span>
          <span className="initial-loader__digit initial-loader__digit--units">
            <span
              className="initial-loader__digit-track"
              style={{ transform: `translateY(-${displayValue}em)` }}
            >
              {UNITS_ROWS.map((d, i) => (
                <span className="initial-loader__digit-row" key={i}>{d}</span>
              ))}
            </span>
          </span>
        </span>
        <span className="initial-loader__percent">%</span>
      </div>
    </div>
  );
}

export default InitialLoader;
