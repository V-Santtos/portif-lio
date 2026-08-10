import { useEffect, useRef, useState } from "react";
import { gsap, fadeJump, currentScrollY } from "./lib.jsx";
import { usePageTransition } from "./PageTransition.jsx";
import { useLocation } from "react-router-dom";

const HamburgerIcon = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
    <rect width="22" height="2" fill="currentColor" />
    <rect y="6" width="22" height="2" fill="currentColor" />
    <rect y="12" width="22" height="2" fill="currentColor" />
  </svg>
);

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <line x1="1" y1="1" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="1" x2="1" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Botão COMEÇAR padrão (mesmo visual do nav do case). Destino: /comecar.
const StartButton = ({ onClick }) => (
  <button type="button" onClick={onClick} className="hero__talk-btn" aria-label="Começar">
    <span className="hero__talk-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="5" width="14" height="16" rx="2" />
        <path d="M9 5V4.2A1.2 1.2 0 0 1 10.2 3h3.6A1.2 1.2 0 0 1 15 4.2V5" />
        <line x1="8.5" y1="11" x2="15.5" y2="11" />
        <line x1="8.5" y1="14.5" x2="15.5" y2="14.5" />
        <line x1="8.5" y1="18" x2="12.5" y2="18" />
      </svg>
    </span>
    <span className="hero__talk-label">Começar</span>
  </button>
);

function Navbar() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { transitionTo } = usePageTransition();
  const location = useLocation();
  const lastScrollY = useRef(0);
  const overlayRef = useRef(null);
  const linksRef = useRef(null);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    lastScrollY.current = currentScrollY();

    // Lê a posição VISUAL, não window.scrollY. Com o ScrollSmoother, o lock da
    // Bridge sincroniza o scroll nativo com o visual e isso derruba o
    // window.scrollY de uma vez — delta negativo que a barra lia como "o
    // usuário está voltando" e aparecia sozinha no meio da Escada. O visual não
    // dá esse salto.
    const handleScroll = () => {
      const currentY = currentScrollY();
      const atTop = currentY < window.innerHeight * 0.9;
      const delta = currentY - lastScrollY.current;

      if (atTop) {
        setVisible(false);
        lastScrollY.current = currentY;
        return;
      }

      if (Math.abs(delta) < 8) return;

      setVisible(delta < 0);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // O conteúdo continua deslizando depois que os eventos de scroll param;
    // sem o ticker a barra só reagiria no próximo evento.
    gsap.ticker.add(handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      gsap.ticker.remove(handleScroll);
    };
  }, []);

  // Hero mobile abre o overlay pelo hambúrguer (sem COMEÇAR na barra)
  useEffect(() => {
    const open = () => setMenuOpen(true);
    window.addEventListener("nav:open-menu", open);
    return () => window.removeEventListener("nav:open-menu", open);
  }, []);

  // Roll-swap no hover dos links (INÍCIO / PROJETOS / CONTATO): cada letra
  // rola pra cima e uma cópia creme sobe no lugar (máscara por caractere).
  // Só desktop tem hover; reduced-motion mantém o fallback CSS de cor.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = linksRef.current;
    if (!root) return;

    const links = root.querySelectorAll(
      ".nav-overlay__link:not(.nav-overlay__link--comecar)"
    );
    const cleanups = [];

    links.forEach((btn) => {
      // Build do DOM uma vez só (StrictMode roda o efeito 2×). Os listeners
      // ficam FORA deste guard — precisam ser re-anexados a cada mount, já que
      // o cleanup do mount anterior os remove.
      if (!btn.dataset.rollReady) {
      const text = btn.textContent;
      btn.textContent = "";
      const frag = document.createDocumentFragment();
      for (const ch of text) {
        const glyph = ch === " " ? " " : ch;
        const cell = document.createElement("span");
        cell.className = "nav-roll__char";
        const col = document.createElement("span");
        col.className = "nav-roll__col";
        const top = document.createElement("span");
        top.className = "nav-roll__layer nav-roll__top";
        top.textContent = glyph;
        const bot = document.createElement("span");
        bot.className = "nav-roll__layer nav-roll__bot";
        bot.textContent = glyph;
        col.append(top, bot);
        cell.append(col);
        frag.append(cell);
      }
      btn.append(frag);
      btn.dataset.rollReady = "1";
      btn.classList.add("nav-overlay__link--roll");
      }

      const cols = btn.querySelectorAll(".nav-roll__col");
      const enter = () =>
        gsap.to(cols, {
          yPercent: -50,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.03,
          overwrite: true,
        });
      const leave = () =>
        gsap.to(cols, {
          yPercent: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.03,
          overwrite: true,
        });
      btn.addEventListener("mouseenter", enter);
      btn.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        btn.removeEventListener("mouseenter", enter);
        btn.removeEventListener("mouseleave", leave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (menuOpen) {
      hasOpenedRef.current = true;
      document.body.style.overflow = "hidden";

      gsap.fromTo(
        overlay,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "power3.inOut" }
      );

      const links = linksRef.current?.querySelectorAll(".nav-overlay__link");
      if (links?.length) {
        gsap.fromTo(
          links,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.3 }
        );
      }
    } else if (hasOpenedRef.current) {
      document.body.style.overflow = "";
      gsap.to(overlay, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.5,
        ease: "power3.inOut",
      });
    }
  }, [menuOpen]);

  const handleLink = (path) => {
    setMenuOpen(false);
    setTimeout(() => {
      if (path === "#contato") {
        const localContact = document.getElementById("contato");
        if (localContact) {
          fadeJump(() => {
            localContact.scrollIntoView();
            window.dispatchEvent(new CustomEvent("contact:highlight"));
          });
        } else {
          window.location.href = "/#contato";
        }
      } else if (path === "#auto") {
        if (location.pathname === "/") {
          fadeJump(() => document.getElementById("auto")?.scrollIntoView());
        } else {
          window.location.href = "/#auto";
        }
      } else {
        transitionTo(path);
      }
    }, 550);
  };

  return (
    <>
      <div
        className={`floating-nav${visible ? " floating-nav--visible" : ""}`}
        aria-hidden={menuOpen ? "true" : undefined}
      >
        <button
          className="floating-nav__logo-box"
          onClick={() => handleLink("/")}
          aria-label="Início"
        >
          <img src="/LOGO.svg" alt="" />
        </button>
        <button
          className="floating-nav__menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          MENU <HamburgerIcon />
        </button>
        <StartButton onClick={() => handleLink("/comecar")} />
      </div>

      <div
        className="nav-overlay"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div className="nav-overlay__bar">
          <button
            className="floating-nav__logo-box"
            onClick={() => handleLink("/")}
            aria-label="Início"
          >
            <img src="/LOGO.svg" alt="" />
          </button>
          <button
            className="floating-nav__menu-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            MENU <CloseIcon />
          </button>
          <StartButton onClick={() => handleLink("/comecar")} />
        </div>
        <nav className="nav-overlay__links" ref={linksRef}>
          <button onClick={() => handleLink("/")} className="nav-overlay__link">INÍCIO</button>
          <button onClick={() => handleLink("/projetos")} className="nav-overlay__link">PROJETOS</button>
          <button onClick={() => handleLink("/meu-processo")} className="nav-overlay__link">MEU PROCESSO</button>
          <button onClick={() => handleLink("#auto")} className="nav-overlay__link">SISTEMAS</button>
          <button onClick={() => handleLink("#contato")} className="nav-overlay__link">CONTATO</button>
          {/* Mobile: COMEÇAR entra na lista (a barra esconde o botão) */}
          <button onClick={() => handleLink("/comecar")} className="nav-overlay__link nav-overlay__link--comecar">COMEÇAR</button>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
