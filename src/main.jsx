import React, { useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import App from "./App.jsx";
import Projetos from "./Projetos.jsx";
import Case from "./Case.jsx";
import LogoTest from "./LogoTest.jsx";
import { PageTransitionProvider } from "./PageTransition.jsx";
import Navbar from "./Navbar.jsx";
import "../styles.css";

// Rola pro topo a cada troca de rota (SPA não faz isso sozinha;
// scrollRestoration está em "manual"). Roda enquanto a transição cobre a tela.
function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PageTransitionProvider>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/"                        element={<App />} />
          <Route path="/projetos"                element={<Projetos />} />
          <Route path="/projetos/:slug"          element={<Case />} />
          <Route path="/logo-test"               element={<LogoTest />} />
        </Routes>
      </PageTransitionProvider>
    </BrowserRouter>
  </React.StrictMode>
);
