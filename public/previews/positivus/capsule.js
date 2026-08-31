(() => {
  document.documentElement.dataset.capsuleReady = "true";

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.deltaY === 0) return;
      event.preventDefault();

      const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 810 : 1;
      const deltaY = Math.max(-240, Math.min(240, event.deltaY * multiplier));
      window.parent.postMessage({ type: "case-preview:wheel", deltaY }, window.location.origin);
    },
    { passive: false }
  );
})();
