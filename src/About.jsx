import { useRef } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "./lib.jsx";
import aboutPhoto from "../asset/about-card.jpg";

function About() {
  const sectionRef = useRef(null);
  const ruleRef = useRef(null);
  const ruleLineRef = useRef(null);
  const hookRef = useRef(null);

  // Hairline presa ao scroll. Duas decisões que não são estilo, são o que
  // faz o efeito não quebrar:
  // 1. O comprimento final vem de medir o marcador no "b" (getBoundingClientRect),
  //    nunca de fórmula — a fórmula antiga tinha um termo fixo (2.5rem) que
  //    não escalava e errava o pouso nas telas pequenas.
  // 2. O progresso é recalculado do zero a cada frame a partir da posição da
  //    seção. ScrollTrigger posicional fica stale atrás do pin do Hero
  //    (Regras/01), e recalcular do zero é o que deixa o traço andar pra
  //    frente E pra trás sem dessincronizar.
  useIsoLayoutEffect(() => {
    const svg = ruleRef.current;
    const line = ruleLineRef.current;
    const hook = hookRef.current;
    const section = sectionRef.current;
    if (!svg || !line || !hook || !section) return;

    // O marcador fica na LINHA DE BASE do título (é um inline-block vazio),
    // ou seja: no pé das letras. O traço tem que parar ANTES disso, dentro do
    // "b". O recuo é uma fração do corpo do título (que é `cqw`), nunca px —
    // px fixo é justamente o que fazia a versão antiga errar em tela pequena.
    // Único número de calibragem visual deste efeito.
    const RECUO_EM = 0.18;
    const recuo = () => parseFloat(getComputedStyle(hook).fontSize) * RECUO_EM;

    if (prefersReducedMotion()) {
      const alturaFinal =
        hook.getBoundingClientRect().top - section.getBoundingClientRect().top - recuo();
      gsap.set(svg, { height: alturaFinal });
      gsap.set(line, { drawSVG: "0% 100%" });
      // Sem movimento, mas o estado final continua sendo "já impactou" — nada
      // fica escondido atrás de uma animação que não vai rodar (Regras/02).
      gsap.set(section.querySelectorAll(".about__i-dot"), { backgroundColor: "var(--color-accent)" });
      gsap.set(section.querySelectorAll(".about__dot"), { color: "var(--color-accent)" });
      return;
    }

    let alturaFinal = 0;
    let cancelado = false;

    const medir = () => {
      // Mede com o traço "cheio" — o height do SVG não pode depender do
      // estado atual da animação, senão a medida realimenta a si mesma.
      alturaFinal =
        hook.getBoundingClientRect().top - section.getBoundingClientRect().top - recuo();
      gsap.set(svg, { height: alturaFinal });
    };

    // Impacto: a palavra reage quando o traço encosta. Alvo é a PALAVRA
    // inteira, nunca uma letra — a linha fica em 50% da seção e o pôster é
    // alinhado à esquerda, então acima de ~1720px (onde o pôster trava em
    // 1600px) o glifo sob a linha muda. Reagir por palavra é imune a isso.
    // Alvo é a LINHA, não a palavra: a foto é irmã de "mim." dentro da linha 2
    // e está encaixada na linha de base dela. Animar só a palavra descolaria
    // as duas — a linha inteira reage como um bloco só.
    const palavras = section.querySelectorAll(".about__title-line");
    // Os dois pontos de "mim." (pingo do "i" + ponto final) — trocam de cor
    // junto com o mesmo impacto, não é gatilho separado. Separados porque a
    // bolinha do "i" é decorativa (backgroundColor) e o "." é texto real
    // (color): setar backgroundColor num span de TEXTO pinta a caixa inteira
    // do inline-block — que herda a altura de linha do título (28cqw) — não
    // só o desenho do glifo. Já mordeu isso uma vez.
    const pingoI = section.querySelectorAll(".about__i-dot");
    const pontoFinal = section.querySelectorAll(".about__dot");
    let bateu = false;

    const impacto = () => {
      // yPercent (não px): é relativo à altura da própria caixa, que é `cqw` —
      // o recuo do impacto escala junto com o pôster de graça.
      gsap
        .timeline({
          // Remedir depois do impacto: se a tela for redimensionada NO MEIO da
          // animação, a medida sai com o transform aplicado. No fim ele já
          // voltou a zero, então aqui o valor é sempre o de repouso.
          onComplete: medir,
        })
        .to(palavras, { yPercent: 6, duration: 0.16, ease: "power2.out", stagger: 0.07 })
        .to(pingoI, { backgroundColor: "var(--color-accent)", scale: 1.5, duration: 0.2, ease: "power2.out" }, "<")
        .to(pontoFinal, { color: "var(--color-accent)", scale: 1.5, duration: 0.2, ease: "power2.out" }, "<")
        .to(palavras, { yPercent: 0, duration: 1.15, ease: "elastic.out(1, 0.3)", stagger: 0.07 })
        .to([pingoI, pontoFinal], { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.35)" }, "<");
    };

    // Volta pro preto quando o scroll recua — a cor segue a mesma filosofia
    // reversível do traço, não é um flash de mão única.
    const reverter = () => {
      gsap.to(pingoI, { backgroundColor: "var(--color-dark)", duration: 0.4, ease: "power2.out" });
      gsap.to(pontoFinal, { color: "var(--color-dark)", duration: 0.4, ease: "power2.out" });
    };

    const desenhar = () => {
      if (!alturaFinal) return;
      const rect = section.getBoundingClientRect();
      // 0 quando o topo da seção toca a base da tela; 1 quando o ponto de
      // pouso do traço chega ao meio da tela.
      const percorrido = window.innerHeight - rect.top;
      const total = window.innerHeight * 0.5 + alturaFinal;
      const p = gsap.utils.clamp(0, 1, percorrido / total);
      gsap.set(line, { drawSVG: `0% ${p * 100}%` });

      // Dispara em 0.80 — ponto calibrado pelo Victor. O impacto acontece
      // antes do traço terminar de desenhar.
      // Histerese: só rearma depois de recuar bastante. Sem a folga, parar o
      // scroll exatamente no ponto de disparo faria o impacto repetir todo frame.
      if (p >= 0.8 && !bateu) {
        bateu = true;
        impacto();
      } else if (p < 0.68 && bateu) {
        bateu = false;
        reverter();
      }
    };

    gsap.set(line, { drawSVG: "0% 0%" });

    // Antes de `fonts.ready` o navegador ainda usa a fonte fallback: o "b"
    // está em outro lugar e a medida sai errada.
    document.fonts.ready.then(() => {
      if (cancelado) return;
      medir();
      desenhar();
      gsap.ticker.add(desenhar);
      window.addEventListener("resize", medir);
    });

    return () => {
      cancelado = true;
      gsap.ticker.remove(desenhar);
      window.removeEventListener("resize", medir);
    };
  }, []);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const els = sectionRef.current?.querySelectorAll("[data-reveal]");
    if (!els?.length) return;

    gsap.set(els, { opacity: 0, y: 28 });

    // Timeline PAUSADA + IntersectionObserver. Esta seção mora ABAIXO do
    // carrossel: ScrollTrigger posicional guarda a posição do alvo na hora em
    // que é criado, e o spacer do pin do Hero deixa esse número stale — o
    // reveal simplesmente não dispara, sem erro no console (Regras/01).
    const tl = gsap.timeline({ paused: true });
    tl.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
    });

    let observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          tl.play();
          observer?.disconnect();
          observer = null;
        }
      },
      { rootMargin: "0px 0px -22% 0px" }
    );
    observer.observe(sectionRef.current);

    return () => {
      observer?.disconnect();
      tl.kill();
    };
  }, []);

  return (
    <section className="section about" id="sobre" ref={sectionRef} data-screen-label="05 Sobre">
      {/* Hairline única: desce alinhada ao botão circular da Automation
          ("Veja de perto") e pousa dentro do "b" de "sobre". Fica pendurada na
          SEÇÃO, não no pôster: o pôster é alinhado à esquerda e o botão é
          centrado na página — dentro do pôster ela sairia do eixo.
          A altura NÃO é calculada: o tween mede `.about__hook` (marcador
          invisível dentro do "b") ao vivo, então o pouso acerta em qualquer
          largura de tela. */}
      <svg
        className="about__rule about__rule--top"
        aria-hidden="true"
        ref={ruleRef}
        preserveAspectRatio="none"
      >
        <line x1="50%" y1="0" x2="50%" y2="100%" ref={ruleLineRef} />
      </svg>

      <div className="about__poster">
        <h2 className="about__title" data-reveal>
          <span className="about__title-line">
            {/* O marcador quebra "sobre" em so|bre só pra ter um ponto de
                medida no início do "b". Largura zero: não muda o desenho da
                palavra, só serve de alvo pro getBoundingClientRect(). */}
            <span className="about__word">
              so<span className="about__hook" ref={hookRef} aria-hidden="true" />bre
            </span>
          </span>
          {/* A foto encaixa logo depois do ponto de "mim.", com a base na
              linha de base do texto — não é empurrada até a margem direita. */}
          <span className="about__title-line about__title-line--2">
            <span className="about__word">
              {/* Pingo do "i" desenhado a mao, nao o da fonte: cobrir o pingo
                  REAL com uma bolinha por cima nunca fecha 100% (a forma dele
                  nao e um circulo perfeito, sobra farolete). Solucao real: o
                  "i" digitado e o "ı" SEM pingo (U+0131, letra propria, existe
                  no turco) — a fonte nunca desenha o pingo dela, entao a
                  bolinha nossa nao compete com nada por baixo, ela E o pingo.
                  Texto visual fica aria-hidden; a versao acessivel (leitor de
                  tela, copiar/colar) mora em about__sr-only, com o "i" normal. */}
              <span className="about__sr-only">mim.</span>
              <span aria-hidden="true">
                m
                <span className="about__i">
                  ı<span className="about__i-dot" />
                </span>
                m<span className="about__dot">.</span>
              </span>
            </span>
            <span className="about__photo">
              <img src={aboutPhoto} alt="Victor Cardoso" />
            </span>
          </span>
        </h2>

        <div className="about__foot">
          <h3 className="about__intro" data-reveal>Prazer em te conhecer!</h3>
          <p className="about__body" data-reveal>
            Opa! Meu nome é Victor. Eu crio sites que posicionam o seu negócio
            como a escolha óbvia — sem enrolação, sem promessas vazias. A
            maioria dos sites de pequenas empresas parecem feitos às pressas.
            Confusos, genéricos, que não convencem ninguém. Eu crio sites que
            comunicam com clareza, transmitem confiança e fazem o "sim"
            parecer natural.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
