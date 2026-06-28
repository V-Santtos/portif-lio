import { useLayoutEffect, useRef, useState } from "react";
import ecoAvatar01 from "../previews/preview-01/assets/avatar-01.png";
import ecoAvatar02 from "../previews/preview-01/assets/avatar-02.png";
import ecoGarden from "./preview-assets/eco-garden.jpg";
import ecoWorker from "../previews/preview-01/assets/hero-worker.png";

import nexousBg from "./preview-assets/nexous-bg.jpg";
import nexousBrandLeft from "./preview-assets/nexous-brand-left.jpg";
import nexousBrandRight from "./preview-assets/nexous-brand-right.jpg";
import nexousInnovativeLeft from "./preview-assets/nexous-innovative-left.jpg";
import nexousTitleSmall from "./preview-assets/nexous-title-small.jpg";

import rooforaWorker from "./preview-assets/roofora-worker.jpg";
import rooforaLogo from "../previews/preview-03/assets/roofora-logo.png";

import dinevoChefPortrait from "./preview-assets/dinevo-chef-portrait.jpg";
import dinevoChefSmall from "./preview-assets/dinevo-chef-small.jpg";
import dinevoDishSmall from "../previews/preview-04/assets/dish-small.png";
import dinevoPlate from "./preview-assets/dinevo-plate.jpg";
import dinevoSignatureDish from "./preview-assets/dinevo-signature.jpg";
import mintaHand from "./preview-assets/minta-hand.jpg";
import mintaGrain from "./preview-assets/grain.png";

const PREVIEW_CANVAS = {
  width: 1280,
  height: 720,
};

function PreviewShell({ className, label, children }) {
  const rootRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, x: 0, y: 0 });

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    function update() {
      const rect = root.getBoundingClientRect();
      const scale = Math.min(rect.width / PREVIEW_CANVAS.width, rect.height / PREVIEW_CANVAS.height);
      const x = (rect.width - PREVIEW_CANVAS.width * scale) / 2;
      const y = (rect.height - PREVIEW_CANVAS.height * scale) / 2;
      setFit({ scale, x, y });
    }

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`lp-preview ${className}`} aria-label={label} ref={rootRef}>
      <div
        className="lp-preview__canvas"
        style={{
          transform: `translate3d(${fit.x}px, ${fit.y}px, 0) scale(${fit.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PreviewLink({ className, children, label }) {
  return (
    <span className={className} aria-label={label}>
      {children}
    </span>
  );
}

function EcoPreview() {
  return (
    <PreviewShell className="lp-preview--eco" label="Hero preview inspirado em EcoScape">
      <section className="hero-preview">
        <nav className="hero-preview__nav" aria-label="Navegacao do preview">
          <PreviewLink className="hero-preview__brand">
            <span className="hero-preview__brand-mark" />
            EcoScape
          </PreviewLink>

          <div className="hero-preview__links">
            <span>Inicio</span>
            <span>Sobre</span>
            <span>Servicos</span>
            <span>Blog</span>
            <span>Paginas</span>
          </div>

          <div className="hero-preview__nav-actions">
            <PreviewLink className="hero-preview__nav-cta">Comecar</PreviewLink>
            <PreviewLink className="hero-preview__icon-btn" label="Abrir contato" />
          </div>
        </nav>

        <div className="hero-preview__image">
          <img src={ecoGarden} alt="" loading="lazy" />
        </div>

        <div className="hero-preview__content">
          <p className="hero-preview__eyebrow">// Manutencao de gramado</p>
          <h1>
            <span>Jardins saudaveis</span>
            <span>em <em>todas</em> as</span>
            <span>estacoes</span>
          </h1>
          <p className="hero-preview__copy">
            Cuidado especializado e manutencao sob medida para manter seu jardim verde,
            vivo e bonito em qualquer clima.
          </p>
        </div>

        <div className="hero-preview__actions">
          <PreviewLink>Agendar agora</PreviewLink>
          <PreviewLink className="hero-preview__icon-btn" label="Agendar" />
        </div>

        <aside className="hero-preview__stat" aria-label="Indicador de prova social">
          <div>
            <strong>7M+</strong>
            <span>clientes ativos</span>
            <div className="hero-preview__avatars" aria-hidden="true">
              <img src={ecoAvatar01} alt="" loading="lazy" />
              <img src={ecoAvatar02} alt="" loading="lazy" />
              <img src={ecoAvatar01} alt="" loading="lazy" />
            </div>
          </div>
          <img className="hero-preview__person" src={ecoWorker} alt="" loading="lazy" />
        </aside>
      </section>
    </PreviewShell>
  );
}

function NexousPreview() {
  return (
    <PreviewShell className="lp-preview--nexous" label="Hero preview inspirado em Nexous">
      <section className="nexous-hero">
        <div className="nexous-hero__media" aria-hidden="true">
          <img src={nexousBg} alt="" loading="lazy" />
        </div>

        <nav className="nexous-hero__nav" aria-label="Navegacao do preview">
          <div className="nexous-hero__nav-group">
            <span>Inicio</span>
            <span>Sobre</span>
            <span>Servicos</span>
          </div>

          <PreviewLink className="nexous-hero__brand">NEXOUS<span>&trade;</span></PreviewLink>

          <div className="nexous-hero__nav-group nexous-hero__nav-group--right">
            <span>Projetos</span>
            <span className="nexous-hero__pages">Todas as paginas</span>
            <PreviewLink className="nexous-hero__contact">
              <span>Contato</span>
              <i aria-hidden="true" />
            </PreviewLink>
          </div>
        </nav>

        <div className="nexous-hero__content">
          <p className="nexous-hero__badge">Agencia criativa digital</p>

          <h1 className="nexous-hero__title">
            <span className="nexous-hero__line nexous-hero__line--top">
              <img src={nexousInnovativeLeft} alt="" loading="lazy" />
              <span>SOLUCOES</span>
              <img src={nexousTitleSmall} alt="" loading="lazy" />
            </span>
            <span className="nexous-hero__line nexous-hero__line--serif">INOVADORAS PARA</span>
            <span className="nexous-hero__line">ELEVAR SUA</span>
            <span className="nexous-hero__line nexous-hero__line--bottom">
              <img src={nexousBrandLeft} alt="" loading="lazy" />
              <span>MARCA</span>
              <img src={nexousBrandRight} alt="" loading="lazy" />
            </span>
          </h1>

          <p className="nexous-hero__copy">
            Da criacao ao desempenho, desenvolvemos estrategias que geram crescimento
            mensuravel para marcas ambiciosas.
          </p>

          <PreviewLink className="nexous-hero__cta">
            <span>Agendar conversa</span>
            <i aria-hidden="true" />
          </PreviewLink>
        </div>
      </section>
    </PreviewShell>
  );
}

function RooforaPreview() {
  return (
    <PreviewShell className="lp-preview--roofora" label="Hero preview inspirado em Roofora">
      <section className="roofora-hero">
        <nav className="roofora-hero__nav" aria-label="Navegacao do preview">
          <div className="roofora-hero__nav-inner">
            <PreviewLink className="roofora-hero__brand">
              <img src={rooforaLogo} alt="Roofora" loading="lazy" />
            </PreviewLink>

            <div className="roofora-hero__links">
              <span className="is-active">Inicio</span>
              <span>Precos</span>
              <span>Sobre</span>
              <span>Servicos</span>
              <span>Projetos</span>
              <span>Blog</span>
            </div>

            <PreviewLink className="roofora-hero__nav-cta">Entrar em contato</PreviewLink>
          </div>
        </nav>

        <div className="roofora-hero__stage">
          <div className="roofora-hero__image" aria-hidden="true">
            <img src={rooforaWorker} alt="" loading="lazy" />
          </div>

          <div className="roofora-hero__content">
            <h1>
              <span>Especialistas confiaveis</span>
              <span>para reparos em casa</span>
            </h1>
            <p>
              Solucoes para telhados feitas para durar, protegendo sua casa com
              tecnica especializada e qualidade consistente.
            </p>

            <div className="roofora-hero__actions">
              <PreviewLink className="roofora-hero__primary">Solicitar orcamento</PreviewLink>
              <PreviewLink className="roofora-hero__secondary">Ligar hoje</PreviewLink>
            </div>
          </div>

          <div className="roofora-hero__cards" aria-label="Diferenciais do servico">
            <article className="roofora-card">
              <span className="roofora-card__icon roofora-card__icon--shield" aria-hidden="true" />
              <h2>Profissionais certificados</h2>
              <p>Equipe qualificada com anos de experiencia comprovada e certificacoes do setor.</p>
            </article>

            <article className="roofora-card">
              <span className="roofora-card__icon roofora-card__icon--building" aria-hidden="true" />
              <h2>Solucoes residenciais e comerciais</h2>
              <p>Atendimento tecnico para casas, empresas e projetos que exigem execucao precisa.</p>
            </article>

            <article className="roofora-card">
              <span className="roofora-card__icon roofora-card__icon--clock" aria-hidden="true" />
              <h2>Resposta rapida</h2>
              <p>Planejamento agil para reduzir espera, resolver urgencias e manter sua rotina segura.</p>
            </article>
          </div>
        </div>
      </section>
    </PreviewShell>
  );
}

function DinevoPreview() {
  return (
    <PreviewShell className="lp-preview--dinevo" label="Hero preview inspirado em Dinevo">
      <section className="dinevo-hero">
        <nav className="dinevo-nav" aria-label="Navegacao do preview">
          <PreviewLink className="dinevo-brand">
            <span className="dinevo-brand__mark" aria-hidden="true" />
            <span>Dinevo</span>
          </PreviewLink>

          <div className="dinevo-nav__links">
            <span className="is-active">Inicio</span>
            <span>Sobre</span>
            <span>Menu</span>
            <span>Paginas</span>
            <span>Contato</span>
          </div>

          <PreviewLink className="dinevo-nav__cta">
            Reservar mesa
            <span aria-hidden="true">↗</span>
          </PreviewLink>
        </nav>

        <div className="dinevo-hero__media" aria-hidden="true">
          <img src={dinevoPlate} alt="" loading="lazy" />
          <div className="dinevo-hero__shade" />
        </div>

        <div className="dinevo-hero__content">
          <p className="dinevo-hero__eyebrow">上質な時間を</p>

          <h1>
            <span>Onde a elegancia</span>
            <span>encontra sabor</span>
          </h1>

          <div className="dinevo-social" aria-label="Clientes satisfeitos">
            <div className="dinevo-social__avatars" aria-hidden="true">
              <img src={dinevoDishSmall} alt="" loading="lazy" />
              <img src={dinevoChefSmall} alt="" loading="lazy" />
              <img src={dinevoChefPortrait} alt="" loading="lazy" />
              <span>10+</span>
            </div>
            <p>
              Transformamos cada refeicao em uma experiencia memoravel.<br />
              Pratos marcantes preparados a cada servico.
            </p>
          </div>

          <div className="dinevo-hero__actions">
            <PreviewLink className="dinevo-hero__primary">
              Explorar menu
              <span aria-hidden="true">↗</span>
            </PreviewLink>
          </div>
        </div>

        <aside className="dinevo-signature-card" aria-label="Prato em destaque">
          <header>
            <strong>Experimente nossos pratos autorais</strong>
            <span aria-hidden="true">↙</span>
          </header>
          <img src={dinevoSignatureDish} alt="" loading="lazy" />
        </aside>
      </section>
    </PreviewShell>
  );
}

function MintaPreview() {
  return (
    <PreviewShell className="lp-preview--minta" label="Hero preview inspirado em Minta">
      <section className="minta-hero">
        <div className="minta-hero__media" aria-hidden="true">
          <img src={mintaHand} alt="" loading="lazy" />
        </div>

        <nav className="minta-nav" aria-label="Navegacao do preview">
          <PreviewLink className="minta-brand">
            <span className="minta-brand__mark" aria-hidden="true" />
            minta
          </PreviewLink>
          <div className="minta-nav__links">
            <span>Recursos</span>
            <span>Planos</span>
            <span>Blog</span>
          </div>
          <PreviewLink className="minta-nav__cta">Acesso antecipado</PreviewLink>
        </nav>

        <div className="minta-hero__content">
          <h1>
            <span>Entre na luz.</span>
            <span>Seu futuro ja espera.</span>
          </h1>
          <p>
            A Minta e a carteira cripto inteligente que guia voce do primeiro
            deposito aos primeiros grandes resultados.
          </p>
          <PreviewLink className="minta-hero__cta">Entrar na lista</PreviewLink>
        </div>

        <div className="minta-grain" aria-hidden="true" style={{ backgroundImage: `url(${mintaGrain})` }} />
      </section>
    </PreviewShell>
  );
}

const PREVIEWS = {
  eco: EcoPreview,
  nexous: NexousPreview,
  roofora: RooforaPreview,
  dinevo: DinevoPreview,
  minta: MintaPreview,
};

function LandingPreview({ variant }) {
  const Component = PREVIEWS[variant];
  return Component ? <Component /> : null;
}

export default LandingPreview;
