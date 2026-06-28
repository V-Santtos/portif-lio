import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "./lib.jsx";
import { usePageTransition } from "./PageTransition.jsx";

const TIMELINES = ["Imediato", "Em 1 mês", "Em 2-3 meses", "Ainda não sei"];
const BUDGETS = [
  "Menos que R$ 1.000",
  "R$ 1.000 a R$ 2.500",
  "R$ 2.500 a R$ 5.000",
  "Acima de R$ 5.000",
];

function Comecar() {
  const { transitionTo } = usePageTransition();
  const titleRef = useRef(null);
  const formRef = useRef(null);
  const [sent, setSent] = useState(false);
  const [contact, setContact] = useState("");
  const [contactMode, setContactMode] = useState("email"); // "email" | "tel"

  useIsoLayoutEffect(() => {
    document.documentElement.removeAttribute("data-booting");
  }, []);

  // Entrada: título sobe por palavra, campos entram em fade/stagger.
  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const titleSpans = titleRef.current?.querySelectorAll(".word > span");
    if (titleSpans?.length) {
      gsap.set(titleSpans, { yPercent: 110 });
      gsap.to(titleSpans, { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.1 });
    }
    const rows = formRef.current?.querySelectorAll("[data-reveal]");
    if (rows?.length) {
      gsap.set(rows, { opacity: 0, y: 24 });
      gsap.to(rows, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, delay: 0.3 });
    }
  }, []);

  // Máscara BR de celular: (00) 00000-0000. Só insere o separador ") " quando
  // já há 3+ dígitos — assim com 2 dígitos fica "(31" e o backspace não trava.
  const maskPhone = (digits) => {
    const d = digits.slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return "(" + d;
    if (d.length <= 7) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  };

  // Campo de contato inteligente: se começa com número → telefone (máscara);
  // senão → e-mail. Se sobrou só formatação (ex.: "("), limpa.
  const handleContact = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");
    if (/^[\s(]*\d/.test(raw)) {
      setContactMode("tel");
      setContact(maskPhone(digits));
    } else if (digits.length === 0 && /^[()\s-]*$/.test(raw)) {
      setContactMode("email");
      setContact("");
    } else {
      setContactMode("email");
      setContact(raw);
    }
  };

  // Placeholder: sem destino real ainda (WhatsApp/n8n será plugado depois).
  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    window.setTimeout(() => setSent(false), 2600);
  };

  return (
    <section className="section comecar" data-screen-label="Comecar">
      <div className="container-x">
        <button className="projetos__back" aria-label="Voltar para o início" onClick={() => transitionTo("/")}>
          <span className="projetos__back-arrow">←</span>
          <svg viewBox="0 0 660 415" className="projetos__back-logo" aria-hidden="true">
            <path d="M271.351379,390.390137 C270.981232,391.557617 270.866669,392.384430 270.612915,393.166077 C269.321655,397.144501 269.120728,402.763245 266.375092,404.635284 C263.400330,406.663544 258.041718,405.239899 253.722641,405.244690 C229.562790,405.271454 205.402222,405.192291 181.243896,405.392029 C178.253906,405.416718 177.300369,404.231476 176.300858,401.887177 C156.847824,356.260895 137.260498,310.691803 117.844193,265.049957 C87.451782,193.606567 57.168861,122.116623 26.832207,50.649517 C22.796198,41.141491 18.703394,31.657557 14.678192,22.144991 C14.256608,21.148682 14.116426,20.033297 13.748783,18.593725 C15.605118,18.454586 17.044662,18.253098 18.484257,18.252756 C41.810181,18.247208 65.136444,18.332808 88.461693,18.213902 C92.156288,18.195066 93.750679,19.457699 95.238724,22.955526 C116.234879,72.309738 137.473969,121.560555 158.628113,170.847641 C174.084061,206.858536 189.497330,242.887772 204.941803,278.903625 C207.014145,283.736237 209.157883,288.538300 211.591904,294.092316 C212.449310,292.460785 213.082596,291.452148 213.534317,290.367859 C232.515289,244.806290 255.737885,201.586075 285.087708,161.818939 C310.158295,127.849915 338.093018,96.451332 371.391693,70.289833 C402.241791,46.052113 436.218994,27.490196 474.493225,17.794535 C522.798035,5.557906 569.222351,9.290203 612.480896,35.836849 C620.399292,40.696114 627.721008,46.527504 634.807617,52.377281 C626.092529,49.763187 617.497131,46.607250 608.637085,44.649010 C590.784668,40.703266 572.706604,40.739075 554.694153,43.673744 C494.543610,53.473701 447.723572,86.419815 407.505493,129.953522 C353.545105,188.362534 316.419647,256.829346 290.142487,331.432526 C283.337799,350.751556 277.710785,370.485382 271.351379,390.390137 z" />
            <path d="M389.200073,170.188293 C383.789307,187.671875 380.391174,205.532242 381.080536,223.863113 C382.330292,257.096924 392.542206,286.887390 417.630829,309.881134 C435.416107,326.181366 456.587311,336.471130 480.574036,339.828156 C492.030243,341.431488 503.779083,342.279022 515.313110,341.732300 C545.563049,340.298309 572.561829,329.877838 595.628296,309.909790 C597.625061,308.181213 599.735840,306.584351 602.079102,304.696381 C618.655212,320.818298 635.180054,336.890381 652.573303,353.807098 C644.472107,360.512451 637.164368,367.230530 629.192322,373.036224 C603.338623,391.864319 574.468323,403.833801 542.764709,407.914307 C526.514282,410.005859 509.932343,411.472717 493.615326,410.721710 C448.575439,408.648621 407.161316,395.147369 371.538910,366.715790 C347.475220,347.509735 329.792664,323.469421 320.070465,293.981171 C319.567902,292.456726 319.445068,290.389862 320.061432,288.974396 C338.447815,246.750229 360.335510,206.503586 388.374329,169.574585 C388.928253,169.813721 389.064178,170.001007 389.200073,170.188293 z" />
            <path d="M584.739990,104.227501 C547.355530,80.296631 508.357483,80.636566 468.211212,95.544312 C468.035217,95.034554 467.859253,94.524796 467.683289,94.015038 C475.927979,88.388588 483.921753,82.343636 492.467682,77.219643 C512.525818,65.193176 534.225098,57.082554 557.270203,53.290104 C582.150757,49.195602 606.672424,50.937729 630.183472,60.962807 C632.146667,61.799915 634.019714,62.879940 635.851257,63.985207 C637.670349,65.082901 639.384094,66.355072 641.653320,67.896706 C640.686462,69.140015 639.920471,70.335197 638.953674,71.336433 C626.233765,84.509666 613.413025,97.586761 600.807495,110.868210 C598.382874,113.422829 596.598633,113.436523 594.087708,111.373749 C591.152710,108.962624 588.050659,106.754829 584.739990,104.227501 z" />
          </svg>
        </button>

        <header className="comecar__head">
          <p className="comecar__kicker">Preencha abaixo que te retorno em breve.</p>
          <h1 className="comecar__title" ref={titleRef}>
            <span className="word"><span>Vamos</span></span>{" "}
            <span className="word"><span>conversar.</span></span>
          </h1>
        </header>

        <form className="comecar__form" ref={formRef} onSubmit={handleSubmit}>
          <div className="comecar__field" data-reveal>
            <label className="comecar__label" htmlFor="cm-nome">Nome <span>*</span></label>
            <input id="cm-nome" name="nome" type="text" className="comecar__input" placeholder="Seu nome" required />
          </div>

          <div className="comecar__field" data-reveal>
            <label className="comecar__label" htmlFor="cm-contato">E-mail ou telefone <span>*</span></label>
            <input
              id="cm-contato"
              name="contato"
              type="text"
              inputMode={contactMode === "tel" ? "tel" : "email"}
              className="comecar__input"
              placeholder="voce@email.com  ·  (00) 00000-0000"
              value={contact}
              onChange={handleContact}
              required
            />
            <span className="comecar__hint">
              Começou com número? Vira telefone. Senão, e-mail.
            </span>
          </div>

          <fieldset className="comecar__field comecar__field--radios" data-reveal>
            <legend className="comecar__label">Prazo <span>*</span></legend>
            <div className="comecar__radios">
              {TIMELINES.map((t) => (
                <label className="comecar__radio" key={t}>
                  <input type="radio" name="prazo" value={t} required />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="comecar__field comecar__field--radios" data-reveal>
            <legend className="comecar__label">Orçamento <span>*</span></legend>
            <div className="comecar__radios">
              {BUDGETS.map((b) => (
                <label className="comecar__radio" key={b}>
                  <input type="radio" name="orcamento" value={b} required />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="comecar__field" data-reveal>
            <label className="comecar__label" htmlFor="cm-msg">Mensagem</label>
            <textarea id="cm-msg" name="mensagem" rows="5" className="comecar__input comecar__textarea" placeholder="Me conta sua ideia..."></textarea>
          </div>

          <div className="comecar__field comecar__submit-row" data-reveal>
            <button type="submit" className={`comecar__submit${sent ? " is-sent" : ""}`}>
              {sent ? "Enviado ✓" : "Bora!"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Comecar;
