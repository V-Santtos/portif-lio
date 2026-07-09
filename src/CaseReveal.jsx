import { useRef } from "react";
import { gsap, ScrollTrigger, useIsoLayoutEffect, prefersReducedMotion } from "./lib.jsx";

// Bloco "reveal": uma imagem larga (a tela completa) que, ao entrar na viewport,
// é recortada por uma máscara pela esquerda até sobrar só a faixa da direita (o
// modal), ancorada à direita. O texto entra centralizado no espaço à esquerda.
// One-shot (once) — roda inteiro e trava no final; só refaz no reload. Sem pin,
// sem scrub. No mobile troca pela imagem retrato do modal (empilhada), e no
// reduced-motion mostra direto o estado final.
function CaseReveal({
  image,
  imageMobile,
  alt = "",
  ratio = "1665 / 947",
  mobileRatio = "813 / 947",
  title,
  body,
  revealInset = 57,
}) {
  const stageRef = useRef(null);
  const mediaRef = useRef(null);
  const textRef = useRef(null);

  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    const media = mediaRef.current;
    if (!stage || !media) return;

    // Mobile: sem máscara (imagem retrato empilhada). Em vez de nada, ganha o
    // MESMO assentamento do bloco `showcase` de baixo — a mídia assenta
    // (scale/shift) e o texto entra em seguida. O desktop segue com a máscara
    // (código abaixo), intocado.
    if (window.matchMedia("(max-width: 860px)").matches) {
      if (prefersReducedMotion()) return; // estado final estático
      const textEls = textRef.current ? Array.from(textRef.current.children) : [];
      gsap.set(media, { opacity: 0, scale: 1.08, xPercent: 6 });
      gsap.set(textEls, { opacity: 0, y: 24 });
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: media, start: "top 78%", toggleActions: "play none none none" },
      });
      tl.to(media, { opacity: 1, scale: 1, xPercent: 0, duration: 1.0 })
        .to(textEls, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, "-=0.45");
      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    }

    // Reduced-motion: aplica direto o estado final (máscara fechada).
    if (prefersReducedMotion()) {
      media.style.setProperty("--mask", revealInset + "%");
      return;
    }

    const proxy = { m: 0 };
    const apply = () => media.style.setProperty("--mask", proxy.m + "%");
    apply(); // começa com a imagem inteira visível (máscara aberta)

    const textEls = textRef.current ? Array.from(textRef.current.children) : [];
    gsap.set(textEls, { opacity: 0, y: 22 });

    const tl = gsap.timeline({ paused: true });
    tl.to(proxy, { m: revealInset, duration: 1.1, ease: "power3.inOut", onUpdate: apply })
      .to(textEls, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12 }, "-=0.45");

    const st = ScrollTrigger.create({
      trigger: stage,
      start: "top 82%", // dispara assim que a seção começa a entrar
      once: true,
      onEnter: () => tl.play(),
    });

    return () => { st.kill(); tl.kill(); };
  }, []);

  return (
    <section className="section case-reveal">
      <div className="container-x">
        <div className="case-reveal__stage" ref={stageRef}>
          <div className="case-reveal__text" ref={textRef}>
            {title && <h3 className="case-reveal__title">{title}</h3>}
            {body && <p className="case-reveal__body">{body}</p>}
          </div>
          <figure
            className="case-reveal__media"
            ref={mediaRef}
            style={{ "--ar": ratio, "--ar-m": mobileRatio }}
          >
            <img
              className="case-reveal__img case-reveal__img--wide"
              src={image}
              alt={alt}
              draggable="false"
              loading="lazy"
            />
            {imageMobile && (
              <img
                className="case-reveal__img case-reveal__img--portrait"
                src={imageMobile}
                alt={alt}
                draggable="false"
                loading="lazy"
              />
            )}
          </figure>
        </div>
      </div>
    </section>
  );
}

export default CaseReveal;
