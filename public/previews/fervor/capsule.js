(() => {
  const gsap = window.gsap;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.documentElement.dataset.capsuleReady = "true";
  document.documentElement.dataset.animationEngine = gsap ? "gsap" : "unavailable";

  const stopNavigation = (event) => {
    const actionable = event.target.closest("a, button, form, [role='link']");
    if (!actionable) return;
    event.preventDefault();
  };

  document.addEventListener("click", stopNavigation, true);
  document.addEventListener("submit", stopNavigation, true);
  document.addEventListener("auxclick", stopNavigation, true);

  if (!gsap) return;

  const navItems = Array.from(document.querySelectorAll(".dinevo-nav__link"));
  const navHome = document.querySelector("[data-nav-home]");
  const navCta = document.querySelector(".dinevo-nav__cta");
  const primaryCta = document.querySelector(".dinevo-hero__primary");

  const navIndicators = navItems.map((item) => item.querySelector(".dinevo-nav__indicator"));
  const initialNavItem = navItems.find((item) => item.classList.contains("is-active")) || navItems[0];
  gsap.set(navIndicators, { opacity: 0, scaleX: 0, xPercent: -50 });
  if (initialNavItem) {
    gsap.set(initialNavItem.querySelector(".dinevo-nav__indicator"), {
      opacity: 1,
      scaleX: 1,
      xPercent: -50,
    });
  }

  const animate = (target, vars) => {
    if (!target) return;
    if (reducedMotion.matches) {
      const { duration, ease, overwrite, ...finalState } = vars;
      gsap.set(target, finalState);
      return;
    }
    gsap.to(target, { overwrite: "auto", ...vars });
  };

  const setIndicator = (item, visible, opacity = 1) => {
    const indicator = item?.querySelector(".dinevo-nav__indicator");
    animate(indicator, {
      opacity: visible ? opacity : 0,
      scaleX: visible ? 1 : 0,
      xPercent: -50,
      duration: 0.22,
      ease: "power2.out",
    });
  };

  const selectNavItem = (selectedItem) => {
    navItems.forEach((item) => {
      const isSelected = item === selectedItem;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
      setIndicator(item, isSelected);
    });
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => selectNavItem(item));
    item.addEventListener("pointerenter", () => {
      animate(item, { y: -1, color: "rgba(255, 255, 255, 0.72)", duration: 0.18, ease: "power2.out" });
      setIndicator(item, true, item.classList.contains("is-active") ? 1 : 0.45);
    });
    item.addEventListener("pointerleave", () => {
      animate(item, { y: 0, color: "#ffffff", duration: 0.18, ease: "power2.out" });
      setIndicator(item, item.classList.contains("is-active"));
    });
    item.addEventListener("focus", () => setIndicator(item, true, item.classList.contains("is-active") ? 1 : 0.45));
    item.addEventListener("blur", () => setIndicator(item, item.classList.contains("is-active")));
  });

  navHome?.addEventListener("click", () => {
    if (navItems[0]) selectNavItem(navItems[0]);
  });
  navHome?.addEventListener("pointerenter", () => animate(navHome, { y: -1, color: "#e94222", duration: 0.18, ease: "power2.out" }));
  navHome?.addEventListener("pointerleave", () => animate(navHome, { y: 0, color: "#ffffff", duration: 0.18, ease: "power2.out" }));

  const wireCta = (button, arrow) => {
    if (!button) return;
    button.addEventListener("pointerenter", () => {
      animate(button, {
        y: -2,
        backgroundColor: "#ff4b2b",
        boxShadow: "0 10px 24px rgba(233, 66, 34, 0.32)",
        duration: 0.18,
        ease: "power2.out",
      });
      animate(arrow, { x: 2, y: -2, duration: 0.18, ease: "power2.out" });
    });
    button.addEventListener("pointerleave", () => {
      animate(button, {
        y: 0,
        scale: 1,
        backgroundColor: "#e94222",
        boxShadow: "0 0 0 rgba(233, 66, 34, 0)",
        duration: 0.18,
        ease: "power2.out",
      });
      animate(arrow, { x: 0, y: 0, duration: 0.18, ease: "power2.out" });
    });
    button.addEventListener("pointerdown", () => animate(button, { scale: 0.97, duration: 0.1, ease: "power2.out" }));
    button.addEventListener("pointerup", () => animate(button, { scale: 1, duration: 0.12, ease: "power2.out" }));
    button.addEventListener("pointercancel", () => animate(button, { scale: 1, duration: 0.12, ease: "power2.out" }));
  };

  wireCta(navCta, navCta?.querySelector(".dinevo-nav__arrow"));
  wireCta(primaryCta, primaryCta?.querySelector(".dinevo-hero__primary-arrow"));

  const card = document.querySelector(".dinevo-signature-card");
  const dishes = Array.from(document.querySelectorAll(".dinevo-signature-card__dish"));
  let activeIndex = 0;
  let isCardHovered = false;
  const zoomScale = 1.1;

  const setInitialDishes = () => {
    gsap.set(dishes, { autoAlpha: 0, xPercent: 0, scale: 1, zIndex: 1 });
    if (dishes[0]) gsap.set(dishes[0], { autoAlpha: 1, zIndex: 2 });
  };

  const syncDishZoom = (duration = 0.35) => {
    const scale = isCardHovered && !reducedMotion.matches ? zoomScale : 1;
    animate([dishes[activeIndex]], { scale, duration, ease: "power2.out" });
  };

  // O prato permanece estável. A troca automática a cada três segundos não
  // era interação do usuário e mantinha trabalho em segundo plano no carrossel.
  setInitialDishes();

  card?.addEventListener("pointerenter", () => {
    isCardHovered = true;
    syncDishZoom(0.45);
  });
  card?.addEventListener("pointerleave", () => {
    isCardHovered = false;
    syncDishZoom(0.3);
  });

  reducedMotion.addEventListener("change", (event) => {
    activeIndex = 0;
    gsap.killTweensOf(dishes);
    setInitialDishes();
    if (!event.matches) {
      syncDishZoom(0);
    }
  });

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
