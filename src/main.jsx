import React, { Suspense, lazy, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import { PageTransitionProvider } from "./PageTransition.jsx";

// Code-split: só a Home (App) precisa estar no bundle inicial. As outras
// rotas carregam sob demanda — a transitionTo() (PageTransition.jsx) já
// cobre a tela por ~1,6s antes de navegar e mais ~0,75s depois, tempo de
// sobra pra buscar o chunk sem flash visível. Quem chega direto por URL
// (refresh, link externo) vê o fallback abaixo (null = nada, deixa o creme
// de fundo aparecer, igual ao boot).
const Projetos = lazy(() => import("./Projetos.jsx"));
const Case = lazy(() => import("./Case.jsx"));
const Comecar = lazy(() => import("./Comecar.jsx"));
const Processo = lazy(() => import("./Processo.jsx"));
import Navbar from "./Navbar.jsx";
import { ScrollSmoother, prefersReducedMotion, useIsoLayoutEffect } from "./lib.jsx";
import "../styles.css";

// Num hard refresh o navegador pode manter por alguns milissegundos a posição
// da página anterior, mesmo com scrollRestoration manual. Os efeitos filhos
// (especialmente o handoff da Escada) rodam antes do ScrollToTop e poderiam ler
// esse Y antigo como uma chegada real ao fim da seção. Zerar antes de montar o
// React garante que nenhum trigger nasça olhando a posição restaurada.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

// Rola pro topo a cada troca de rota (SPA não faz isso sozinha;
// scrollRestoration está em "manual"). Roda enquanto a transição cobre a tela.
// Com o ScrollSmoother ativo o salto tem que passar por ele: window.scrollTo
// mexeria só no scroll nativo e o conteúdo (que é movido por transform)
// ficaria pra trás por uma fração de segundo.
function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    let frame = 0;
    let settleFrame = 0;
    let finalizeFrame = 0;
    let fallbackTimer = 0;
    let finalized = false;
    const root = document.documentElement;
    root.removeAttribute("data-scroll-reset-ready");

    const reset = () => {
      const smoother = ScrollSmoother.get();
      if (smoother) {
        smoother.paused(false);
        smoother.scrollTop(0);
      } else {
        window.scrollTo(0, 0);
      }
    };

    const finalizeReset = () => {
      if (finalized) return;
      finalized = true;
      reset();
      finalizeFrame = window.requestAnimationFrame(() => {
        reset();
        root.setAttribute("data-scroll-reset-ready", "");
        window.dispatchEvent(new CustomEvent("app:scroll-reset-ready"));
      });
    };

    // O browser pode reaplicar o Y antigo depois dos primeiros layouts. Os dois
    // frames limpam o estado inicial; `pageshow` fecha a conta DEPOIS da
    // restauração de histórico. Em troca de rota SPA não há pageshow, então o
    // fallback libera os triggers após a geometria inicial do carrossel.
    reset();
    frame = window.requestAnimationFrame(() => {
      reset();
      settleFrame = window.requestAnimationFrame(() => {
        reset();
      });
    });
    window.addEventListener("pageshow", finalizeReset, { once: true });
    fallbackTimer = window.setTimeout(finalizeReset, 450);

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(settleFrame);
      window.cancelAnimationFrame(finalizeFrame);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("pageshow", finalizeReset);
      root.removeAttribute("data-scroll-reset-ready");
    };
  }, [pathname]);
  return null;
}

// Força o Case a desmontar/remontar quando o slug muda. Sem isso, ir de um
// case pro outro pelo botão "próximo projeto" mantém o MESMO componente vivo
// (mesma rota, só o param muda) — e o SplitText do título + o pin do
// ScrollTrigger mexem no DOM por fora do React, então título/tags/descrição
// ficam presos no conteúdo do case anterior. `key` reseta tudo do zero.
function CaseRoute() {
  const { slug } = useParams();
  return <Case key={slug} />;
}

// O ScrollSmoother exige que TODO o conteúdo rolável viva dentro de
// #smooth-content, que recebe um transform. Isso cria um containing block
// novo: qualquer position:fixed aqui dentro passa a ser fixo em relação ao
// conteúdo, não à viewport. Por isso Navbar e o painel de transição ficam
// FORA (ver main render), e os overlays das rotas usam createPortal.
function SmoothScroll({ children }) {
  useIsoLayoutEffect(() => {
    // Sem suavização em reduced-motion: o scroll fica nativo, como era antes.
    if (prefersReducedMotion()) return;

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,
      // Touch fica NATIVO de propósito. Suavizar o dedo descola o conteúdo do
      // gesto, e o lock da Bridge + o snap do carrossel no mobile já são
      // território sensível (o normalizeScroll foi rejeitado por isso).
      smoothTouch: false,
      // Evita ScrollTrigger.refresh() quando a barra de endereço do iOS
      // some/aparece — a refresh no meio do scroll dá salto visual.
      ignoreMobileResize: true,
      effects: false,
    });

    return () => smoother.kill();
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <PageTransitionProvider>
          <ScrollToTop />
          <Navbar />
          <SmoothScroll>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/"                        element={<App />} />
                <Route path="/projetos"                element={<Projetos />} />
                <Route path="/projetos/:slug"          element={<CaseRoute />} />
                <Route path="/meu-processo"            element={<Processo />} />
                <Route path="/comecar"                 element={<Comecar />} />
              </Routes>
            </Suspense>
          </SmoothScroll>
        </PageTransitionProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
