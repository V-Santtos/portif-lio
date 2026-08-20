(() => {
  if (window.parent === window) return;

  const waitForVisibleImages = () =>
    Promise.all(
      [...document.images]
        .filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
        })
        .map((image) => {
          if (!image.complete) {
            return new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            });
          }
          return image.decode ? image.decode().catch(() => {}) : Promise.resolve();
        })
    );

  const notifyParent = () => {
    const fontsReady = document.fonts?.ready?.catch(() => {}) ?? Promise.resolve();

    Promise.all([fontsReady, waitForVisibleImages()]).then(() => {
      // O primeiro frame aplica os estilos finais do case; o segundo garante
      // que eles ja foram pintados antes de o poster externo sair de cena.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.parent.postMessage({ type: "case-preview:ready" }, window.location.origin);
        });
      });
    });
  };

  if (document.readyState === "complete") {
    notifyParent();
  } else {
    window.addEventListener("load", notifyParent, { once: true });
  }
})();
