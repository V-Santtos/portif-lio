(() => {
  const gsap = window.gsap;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const orange = "#f43c00";
  const white = "#ffffff";

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

  document.querySelectorAll(".title-copy").forEach((element) => {
    const text = element.textContent;
    element.textContent = "";

    [...text].forEach((character) => {
      const span = document.createElement("span");
      span.className = "title-char";
      span.textContent = character === " " ? "\u00a0" : character;
      span.setAttribute("aria-hidden", "true");
      element.appendChild(span);
    });
  });

  if (gsap) {
    const animateTo = (target, vars) => {
      if (!target) return;

      if (reducedMotion) {
        const { duration, ease, overwrite, ...finalState } = vars;
        gsap.set(target, finalState);
        return;
      }

      gsap.to(target, { overwrite: "auto", ...vars });
    };

    const background = document.querySelector(".capsule__background");
    const badge = document.querySelector(".capsule__badge");
    const titleCharacters = document.querySelectorAll(".title-char");
    const titleImages = document.querySelectorAll(".capsule__line img");
    const copy = document.querySelector(".capsule__copy");
    const cta = document.querySelector(".capsule__cta");

    if (reducedMotion) {
      gsap.set([background, badge, titleCharacters, titleImages, copy, cta], {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      });
    } else {
      gsap.set(background, { autoAlpha: 0.72, scale: 1.025, transformOrigin: "50% 50%" });
      gsap.set(badge, { autoAlpha: 0, y: 50 });
      gsap.set(titleCharacters, { autoAlpha: 0, y: 10, filter: "blur(10px)" });
      gsap.set(titleImages, { autoAlpha: 0, y: 50 });
      gsap.set([copy, cta], { autoAlpha: 0, y: 32 });

      gsap
        .timeline()
        .to(background, { autoAlpha: 1, scale: 1, duration: 1.45, ease: "power2.out" }, 0)
        .to(badge, { autoAlpha: 1, y: 0, duration: 0.72, ease: "power3.out" }, 0.06)
        .to(
          titleCharacters,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.72,
            stagger: 0.012,
            ease: "power3.out",
          },
          0.15
        )
        .to(
          titleImages,
          { autoAlpha: 1, y: 0, duration: 0.78, stagger: 0.06, ease: "power3.out" },
          0.28
        )
        .to(copy, { autoAlpha: 1, y: 0, duration: 0.72, ease: "power3.out" }, 0.56)
        .to(cta, { autoAlpha: 1, y: 0, duration: 0.72, ease: "power3.out" }, 0.66);
    }

    document.querySelectorAll(".nav-link:not(.nav-pages__trigger)").forEach((link) => {
      const activate = () =>
        animateTo(link, { color: orange, duration: 0.28, ease: "power2.out" });
      const deactivate = () =>
        animateTo(link, { color: white, duration: 0.28, ease: "power2.out" });

      link.addEventListener("pointerenter", activate);
      link.addEventListener("pointerleave", deactivate);
      link.addEventListener("focus", activate);
      link.addEventListener("blur", deactivate);
    });

    document.querySelectorAll(".capsule-action").forEach((action) => {
      const labelTrack = action.querySelector(".capsule-action__label-track");
      const iconTrack = action.querySelector(".capsule-action__icon-track");

      const activate = () => {
        animateTo(labelTrack, { y: -38, duration: 0.46, ease: "power3.inOut" });
        animateTo(iconTrack, { x: -47, duration: 0.46, ease: "power3.inOut" });
      };

      const deactivate = () => {
        animateTo(labelTrack, { y: 0, duration: 0.46, ease: "power3.inOut" });
        animateTo(iconTrack, { x: 0, duration: 0.46, ease: "power3.inOut" });
      };

      action.addEventListener("pointerenter", activate);
      action.addEventListener("pointerleave", deactivate);
      action.addEventListener("focus", activate);
      action.addEventListener("blur", deactivate);
    });

    const pages = document.querySelector(".nav-pages");
    const pagesTrigger = pages?.querySelector(".nav-pages__trigger");
    const pagesArrow = pagesTrigger?.querySelector("svg");
    const pagesMenu = pages?.querySelector(".nav-pages__menu");

    if (pages && pagesTrigger && pagesArrow && pagesMenu) {
      gsap.set(pagesMenu, { autoAlpha: 0, y: 8, scale: 0.98, pointerEvents: "none" });

      const openPages = () => {
        pagesTrigger.setAttribute("aria-expanded", "true");
        gsap.set(pagesMenu, { pointerEvents: "auto" });
        animateTo(pagesTrigger, { color: orange, duration: 0.28, ease: "power2.out" });
        animateTo(pagesArrow, { rotation: 180, duration: 0.38, ease: "power2.inOut" });
        animateTo(pagesMenu, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.32,
          ease: "power2.out",
        });
      };

      const closePages = () => {
        pagesTrigger.setAttribute("aria-expanded", "false");
        animateTo(pagesTrigger, { color: white, duration: 0.28, ease: "power2.out" });
        animateTo(pagesArrow, { rotation: 0, duration: 0.38, ease: "power2.inOut" });
        animateTo(pagesMenu, {
          autoAlpha: 0,
          y: 8,
          scale: 0.98,
          duration: 0.24,
          ease: "power2.in",
          onComplete: () => gsap.set(pagesMenu, { pointerEvents: "none" }),
        });
      };

      pages.addEventListener("pointerenter", openPages);
      pages.addEventListener("pointerleave", closePages);
      pagesTrigger.addEventListener("focus", openPages);
      pages.addEventListener("focusout", (event) => {
        if (!pages.contains(event.relatedTarget)) closePages();
      });

      pagesMenu.querySelectorAll("button").forEach((item) => {
        const activate = () =>
          animateTo(item, {
            color: white,
            backgroundColor: "rgba(244, 60, 0, 0.2)",
            duration: 0.24,
            ease: "power2.out",
          });
        const deactivate = () =>
          animateTo(item, {
            color: white,
            backgroundColor: "rgba(0, 0, 0, 0)",
            duration: 0.24,
            ease: "power2.out",
          });

        item.addEventListener("pointerenter", activate);
        item.addEventListener("pointerleave", deactivate);
        item.addEventListener("focus", activate);
        item.addEventListener("blur", deactivate);
      });
    }
  }

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
