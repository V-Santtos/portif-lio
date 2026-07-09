// Fonte de verdade única da ordem e visibilidade dos projetos.
// Consumida por:
//   • Projetos.jsx (listagem /projetos)
//   • Hero.jsx      (dropdown do link PROJETOS no hover — desktop)
//   • Case.jsx      (botão "próximo projeto" no fim do case)
//
// Ocultar um projeto = comentar a linha aqui. Rota e dados do case
// (casesData.js) seguem intactos; para voltar, basta descomentar.
// A numeração de /projetos é por índice, então renumera sozinha.
export const PROJECTS = [
  { id: "minas-tintas", name: "Minas Tintas", img: "/minas-tintas.png",        href: "/projetos/minas-tintas" },
  // { id: "barbearia",    name: "Barbearia",    video: "/videos/barbearia.mp4",  href: "/projetos/barbearia"    },
  { id: "hawk-street",  name: "Hawk Street",  video: "/hawk-street.mp4",       href: "/projetos/hawk-street"  },
  { id: "flux-time",    name: "Flux Time",    video: "/videos/flux.mp4",       href: "/projetos/flux-time"    },
  // { id: "art-piso",     name: "Art Piso",     img: "/art-piso.jpg",            href: "/projetos/art-piso"     },
];

// Próximo projeto na lista visível — cicla pro primeiro ao chegar no fim.
// Retorna null se o slug não estiver na lista.
export function nextProject(slug) {
  const i = PROJECTS.findIndex((p) => p.id === slug);
  if (i === -1) return null;
  return PROJECTS[(i + 1) % PROJECTS.length];
}
