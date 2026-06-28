import { useRef } from "react";
import { Flip, ScrollTrigger, gsap, prefersReducedMotion, useIsoLayoutEffect, useTitleReveal } from "./lib.jsx";
import LandingPreview from "./LandingPreview.jsx";

const LP_ITEMS = [
  { preview: "eco", tag: "Jardinagem", title: "EcoScape" },
  { preview: "nexous", tag: "Agencia", title: "Nexous" },
  { preview: "roofora", tag: "Servicos", title: "Roofora" },
  { preview: "dinevo", tag: "Restaurante", title: "Dinevo" },
  { preview: "minta", tag: "Fintech", title: "Minta" },
];

function PreviewCard({ item }) {
  return (
    <article className="lp__preview-card">
      {item.preview ? (
        <LandingPreview variant={item.preview} />
      ) : (
        <img src={item.img} className="lp__thumb-img" alt={item.title} />
      )}
      <div className="lp__preview-overlay">
        <div>
          <span>{item.tag}</span>
          <strong>{item.title}</strong>
        </div>
      </div>
    </article>
  );
}

function LandingPages() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const startWrapperRef = useRef(null);
  const endWrapperRef = useRef(null);
  const targetRef = useRef(null);
  const noteRef = useRef(null);
  const carouselViewportRef = useRef(null);
  const carouselTrackRef = useRef(null);
  const backTopRef = useRef(null);

  useTitleReveal(titleRef, { trigger: titleRef, start: "top 85%", stagger: 0.04 });

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const section = sectionRef.current;
    const target = targetRef.current;
    const startWrapper = startWrapperRef.current;
    const endWrapper = endWrapperRef.current;
    const carouselViewport = carouselViewportRef.current;
    const carouselTrack = carouselTrackRef.current;

    if (!section || !target || !startWrapper || !endWrapper || !carouselViewport || !carouselTrack) return;

    let scrollTl;
    let carouselTl;
    let resizeTimer;

    function build() {
      if (scrollTl) { scrollTl.scrollTrigger?.kill(); scrollTl.kill(); }
      if (carouselTl) { carouselTl.scrollTrigger?.kill(); carouselTl.kill(); }

      gsap.set(target, { clearProps: "all" });
      gsap.set(carouselViewport, { opacity: 0, pointerEvents: "none" });

      scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: startWrapper,
          start: "center center",
          endTrigger: endWrapper,
          end: "center center",
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      });
      scrollTl.add(Flip.fit(target, endWrapper, { duration: 1, ease: "none", scale: true }));

      const cards = carouselTrack.children;
      const cardCount = cards.length;

      const vpW = carouselViewport.offsetWidth;
      const cardW = cards[0]?.offsetWidth || 0;
      const gapPx = parseFloat(getComputedStyle(carouselTrack).gap) || 32;
      const initialX = (vpW - cardW) / 2;
      const totalMove = (cardCount - 1) * (cardW + gapPx);
      const scrollDist = totalMove * 1.5;

      gsap.set(carouselTrack, { x: initialX });

      carouselTl = gsap.timeline({
        scrollTrigger: {
          trigger: endWrapper,
          start: "center center",
          end: `+=${scrollDist}`,
          scrub: 0.6,
          pin: section,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter() {
            gsap.set(target, { opacity: 0 });
            gsap.set(carouselViewport, { opacity: 1, pointerEvents: "auto" });
          },
          onLeave() {
            // passou do último template descendo → some
            backTopRef.current?.classList.remove("is-visible");
          },
          onLeaveBack() {
            gsap.set(carouselViewport, { opacity: 0, pointerEvents: "none" });
            gsap.set(target, { opacity: 1 });
            // saiu pelo topo do carrossel → some
            backTopRef.current?.classList.remove("is-visible");
          },
          onUpdate(self) {
            // dentro do carrossel: aparece só ao rolar de volta (direção -1)
            backTopRef.current?.classList.toggle("is-visible", self.direction === -1);
          },
        },
      });

      carouselTl.to(carouselTrack, { x: initialX - totalMove, ease: "none" });
    }

    const delayedBuild = gsap.delayedCall(0.2, () => {
      build();
      ScrollTrigger.refresh();
    });

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { build(); ScrollTrigger.refresh(); }, 150);
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      delayedBuild.kill();
      if (scrollTl) { scrollTl.scrollTrigger?.kill(); scrollTl.kill(); }
      if (carouselTl) { carouselTl.scrollTrigger?.kill(); carouselTl.kill(); }
      gsap.set(target, { clearProps: "all" });
      backTopRef.current?.classList.remove("is-visible");
    };
  }, []);

  const titleHtml = `
    <span class="lp__line">
      <span class="word"><span>Sua</span></span>
      <span class="word"><span>primeira</span></span>
      <span class="word"><span>impressão</span></span>
      <span class="word"><span>no</span></span>
    </span>
    <span class="lp__line">
      <span class="word"><span>digital</span></span>
      <span class="word"><span>define</span></span>
      <span class="word"><span>se</span></span>
      <span class="word"><span>seu</span></span>
      <span class="word"><span>cliente</span></span>
    </span>
    <span class="lp__line">
      <span class="word"><span>confia</span></span>
      <span class="word"><span>na</span></span>
      <span class="word accent"><span>sua</span></span>
      <span class="word accent"><span>solução</span></span>
    </span>
    <span class="lp__line">
      <span class="word"><span>ou</span></span>
      <span class="word"><span>procura</span></span>
      <span class="word"><span>outra.</span></span>
    </span>
  `;

  return (
    <section className="section lp" id="lp" data-screen-label="02 Páginas" ref={sectionRef}>
      <div className="container-x">
        <p className="eyebrow lp__eyebrow">Presença Digital</p>
        <h2
          className="section-title lp__title--main"
          ref={titleRef}
          dangerouslySetInnerHTML={{ __html: titleHtml }}
        />
      </div>

      <div className="lp__scaling-header">
        <div className="lp__note" ref={noteRef}>
          <span>Veja como uma página<br />pode mudar a percepção</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 64 36" fill="none" className="lp__note-arrow">
            <path d="M1 0.999889C7.40028 7.00632 22.5182 20.1881 27.8462 22.5774C29.1888 23.0085 30.4352 23.282 34.8153 24.8632C39.1954 26.4443 53.5563 24.8704 62.8187 26.9744M62.8187 26.9744C62.7852 27.7219 61.915 28.5968 60.2964 29.5075C52.8642 33.6892 47.1995 34.7166 46.2324 34.7258M62.8187 26.9744C61.937 25.4952 59.4141 24.7413 56.4519 22.746C55.0697 20.7506 53.9329 16.7598 52.7617 12.6481" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="lp__thumb-box lp__thumb-box--small">
          <div className="lp__ratio"></div>
          <div className="lp__thumb-wrapper" ref={startWrapperRef}>
            <article className="lp__thumb-target" ref={targetRef}>
              <LandingPreview variant="eco" />
              <span className="lp__thumb-pill">Preview</span>
            </article>
          </div>
        </div>
      </div>

      <div className="lp__scaling-video">
        <div className="lp__thumb-box lp__thumb-box--large">
          <div className="lp__ratio"></div>
          <div className="lp__thumb-wrapper" ref={endWrapperRef}></div>
        </div>

        <div className="lp__carousel-viewport" ref={carouselViewportRef}>
          <div className="lp__carousel-track" ref={carouselTrackRef}>
            {LP_ITEMS.map((item, i) => (
              <PreviewCard key={i} item={item} />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="lp__back-top"
        aria-label="Voltar ao topo"
        ref={backTopRef}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </section>
  );
}

export default LandingPages;
