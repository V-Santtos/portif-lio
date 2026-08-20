(() => {
  const card = document.querySelector(".dinevo-signature-card");
  const dishes = Array.from(document.querySelectorAll(".dinevo-signature-card__dish"));
  const navItems = Array.from(document.querySelectorAll(".dinevo-nav__link"));
  const navHome = document.querySelector("[data-nav-home]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function selectNavItem(selectedItem) {
    navItems.forEach((item) => {
      const isSelected = item === selectedItem;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => selectNavItem(item));
  });

  navHome?.addEventListener("click", () => {
    if (navItems[0]) selectNavItem(navItems[0]);
  });

  if (!card || dishes.length < 2 || !window.gsap) return;

  let activeIndex = 0;
  let incomingIndex = null;
  let isCardHovered = false;
  let transition = null;
  let cycle = null;
  const zoomScale = 1.1;

  function setInitialState() {
    gsap.set(dishes, { autoAlpha: 0, xPercent: 0, scale: 1, zIndex: 1 });
    gsap.set(dishes[0], { autoAlpha: 1, zIndex: 2 });
  }

  function getVisibleDishes() {
    if (incomingIndex === null) return [dishes[activeIndex]];
    return [dishes[activeIndex], dishes[incomingIndex]];
  }

  function syncDishZoom(duration = 0.35) {
    const scale = isCardHovered && !reduceMotion.matches ? zoomScale : 1;
    const targets = isCardHovered ? getVisibleDishes() : dishes;

    gsap.to(targets, {
      scale,
      duration,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function waitForDish(image) {
    const decode = () => image.decode?.().catch(() => undefined) ?? Promise.resolve();

    if (image.complete) return decode();

    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    }).then(decode);
  }

  function showNextDish() {
    if (transition?.isActive()) return;

    const currentDish = dishes[activeIndex];
    const nextIndex = (activeIndex + 1) % dishes.length;
    const nextDish = dishes[nextIndex];
    incomingIndex = nextIndex;

    gsap.set(nextDish, {
      autoAlpha: 0,
      xPercent: 0,
      scale: isCardHovered ? zoomScale : 1,
      zIndex: 3,
    });
    transition = gsap.timeline({
      defaults: { duration: 0.48, ease: "power1.inOut" },
      onComplete: () => {
        gsap.set(currentDish, { autoAlpha: 0, zIndex: 1, scale: 1 });
        activeIndex = nextIndex;
        incomingIndex = null;
        gsap.set(nextDish, {
          autoAlpha: 1,
          zIndex: 2,
          scale: isCardHovered ? zoomScale : 1,
        });
      },
    });

    transition.to(nextDish, { autoAlpha: 1 }, 0);
  }

  function beginCycle() {
    if (reduceMotion.matches) return;
    cycle = gsap.delayedCall(3, function advance() {
      showNextDish();
      cycle.restart(true);
    });
  }

  setInitialState();
  Promise.all(dishes.map(waitForDish)).then(beginCycle);

  card.addEventListener("pointerenter", () => {
    isCardHovered = true;
    syncDishZoom(0.45);
  });

  card.addEventListener("pointerleave", () => {
    isCardHovered = false;
    syncDishZoom(0.3);
  });

  reduceMotion.addEventListener("change", (event) => {
    cycle?.kill();
    cycle = null;
    transition?.kill();
    transition = null;
    activeIndex = 0;
    incomingIndex = null;
    gsap.killTweensOf(dishes);
    setInitialState();
    if (!event.matches) {
      syncDishZoom(0);
      beginCycle();
    }
  });
})();
