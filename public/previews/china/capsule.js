(() => {
  document.documentElement.dataset.capsuleReady = "true";

  const stopNavigation = (event) => {
    if (!event.target.closest("a, button, form, [role='link']")) return;
    event.preventDefault();
  };

  document.addEventListener("click", stopNavigation, true);
  document.addEventListener("submit", stopNavigation, true);
  document.addEventListener("auxclick", stopNavigation, true);

  const heroVideo = document.querySelector(".capsule main video");
  heroVideo?.play().catch(() => {});

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.deltaY === 0) return;
      event.preventDefault();

      const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 810 : 1;
      const normalizedDelta = Math.max(-240, Math.min(240, event.deltaY * multiplier));

      window.parent.postMessage(
        { type: "case-preview:wheel", deltaY: normalizedDelta },
        window.location.origin
      );
    },
    { passive: false }
  );
})();
