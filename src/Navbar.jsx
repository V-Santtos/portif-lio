import { useEffect, useRef, useState } from "react";
import { gsap, fadeJump } from "./lib.jsx";
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

// Botão COMEÇAR padrão (mesmo visual do nav do case). Destino definitivo: tarefa 4.
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
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
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
    return () => window.removeEventListener("scroll", handleScroll);
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
        if (location.pathname === "/") {
          fadeJump(() => {
            document.getElementById("contato")?.scrollIntoView();
            window.dispatchEvent(new CustomEvent("contact:highlight"));
          });
        } else {
          window.location.href = "/#contato";
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
          <button onClick={() => handleLink("#contato")} className="nav-overlay__link">CONTATO</button>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
