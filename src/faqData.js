// Fonte única das 6 perguntas do FAQ. Consumida por Contact.jsx (render) e
// seo.js (schema.org FAQPage) — arquivo puro (sem JSX), porque seo.js é
// importado direto pelo Node em vite.config.js pra gerar sitemap/robots.
export const FAQS = [
  {
    question: "Para quem é este trabalho?",
    answers: [
      "Trabalho tanto com pessoas quanto com empresas e pequenos negócios. Posso desenvolver desde uma ferramenta pensada para facilitar uma necessidade específica do dia a dia até soluções para quem deseja otimizar processos ou construir uma presença digital mais forte. O ponto de partida é sempre entender o que precisa ser resolvido e criar algo que faça sentido para sua realidade.",
    ],
  },
  {
    question: "Para quem este trabalho não é indicado?",
    answers: [
      "Para quem espera uma entrega de alto nível sem um orçamento compatível com o que o projeto exige. Consigo adaptar escopo, prioridades e caminhos para diferentes investimentos, mas acredito que expectativa e orçamento precisam caminhar juntos. A ideia é encontrar a melhor solução possível dentro de uma realidade que faça sentido para os dois lados.",
    ],
  },
  {
    question: "Por que trabalhar com uma pessoa em vez de uma agência?",
    answers: [
      "Porque você fala diretamente com quem vai pensar e construir o seu projeto. Desde o início, eu entendo suas prioridades, acompanho cada etapa e mantenho você por dentro das decisões ao longo do processo. E essa proximidade não termina na entrega. Continuo disponível depois do projeto para ajustes, dúvidas e para o que precisar evoluir.",
    ],
  },
  {
    question: "Quanto tempo leva para desenvolver um projeto?",
    answers: [
      "Depende do que precisa ser construído. Um site institucional, um e-commerce ou uma ferramenta personalizada têm escopos e níveis de complexidade diferentes. Por isso, o prazo só é definido depois que eu entendo a necessidade, as funcionalidades e a dimensão do projeto. A partir daí, você recebe uma estimativa clara de tempo antes de começarmos.",
    ],
  },
  {
    question: "Você garante mais vendas ou resultados?",
    answers: [
      "Não existe como garantir um resultado isoladamente. Um site ou uma ferramenta bem construídos podem melhorar a experiência, tornar caminhos mais claros, comunicar melhor o valor do negócio e facilitar decisões. Tudo isso pode contribuir diretamente para melhores resultados.",
      "Mas o resultado final também depende do que acontece ao redor do projeto, como a oferta, o marketing, os processos internos e a própria entrega do negócio. Meu trabalho é construir uma parte forte desse conjunto, não prometer que ela sozinha vai resolver tudo.",
    ],
  },
  {
    question: "Como começamos?",
    answers: [
      "Você pode me chamar ou preencher o formulário contando um pouco sobre a sua ideia, mesmo que ela ainda não esteja totalmente definida. A partir daí, conversamos para entender o que você precisa, o que faz sentido construir e quais caminhos são possíveis. Com isso mais claro, preparo uma proposta com escopo, prazo e investimento.",
    ],
  },
];
