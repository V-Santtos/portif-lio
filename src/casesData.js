// Dados de cada case. Mesmo template para todos — só muda o conteúdo aqui.
// Textos de minas-tintas, barbearia, flux-time e art-piso são PROVISÓRIOS.
export const CASES = {
  "hawk-street": {
    tags: ["E-COMMERCE", "LOJA", "2026"],
    title: "HAWK",
    desc: "Loja de streetwear construída para converter. Uma experiência de compra que carrega a identidade da marca em cada detalhe.",
    challenge: "Levar a Hawk Street além do Instagram, hoje seu principal canal de vendas, para uma loja própria com mais credibilidade e alcance — atraindo mais tráfego e novos clientes, sem deixar de lado quem já acompanha a marca.",
    solution: "Uma loja construída como vitrine da marca, que traduz no digital o visual editorial da Hawk Street — forte, minimalista e premium — e entrega uma experiência de compra fluida e profissional, à altura da presença que a marca já tem.",
    results: "Com a loja no ar, a Hawk Street vende pelo próprio canal e fortalece sua marca, com estrutura para crescer e escalar as vendas.",
  },

  "minas-tintas": {
    tags: ["PWA", "FIDELIDADE", "2026"],
    title: "MINAS TINTAS",
    desc: "Sistema (PWA) que organiza o relacionamento da Minas Tintas com seus pintores parceiros. Cada orçamento aprovado libera bônus em pontos, trocados por recompensas na lojinha.",
    challenge: "O controle de indicações, orçamentos e comissões dos pintores era manual e informal — sem rastreio do que cada pintor gerava, nem clareza na hora de liberar e distribuir o bônus.",
    solution: "Um PWA com dois perfis: o pintor monta orçamentos no campo, mesmo offline, e a administração confirma os pagamentos. Ao aprovar, o sistema credita 1% ao pintor responsável e transforma pontos em resgates numa lojinha gerenciada pela loja.",
    results: "Todo o fluxo de indicação e bônus centralizado e rastreável num só lugar, com regras configuráveis (percentual e multiplicador) e uma base escalável para fidelizar e expandir a rede de pintores parceiros.",
    blocks: [
      {
        type: "shot",
        image: "/cases/minas-tintas/desktop-admin.png",
        alt: "Painel administrativo do Minas Tintas — tela de pedidos para aprovação",
        ratio: "2391 / 1426",
        captionTop: true,
        label: "Painel admin",
        caption: "Aprova pedidos e libera bônus em poucos cliques.",
      },
      {
        type: "split",
        image: "/cases/minas-tintas/pintor-app.png",
        alt: "App do pintor Minas Tintas — home e lojinha de pontos",
        ratio: "1024 / 1536",
        title: "Orçou, ganhou, trocou.",
        body: "O pintor monta o orçamento em poucos cliques e acompanha tudo pelo celular. Cada trabalho rende pontos para trocar por itens na lojinha.",
      },
      {
        type: "cta",
        title: "Curtiu esse projeto?\nBora criar o seu.",
        body: "Se você precisa de uma aplicação como essa ou algo semelhante — é só me chamar.",
        buttonLabel: "Bora!",
        buttonHref: "https://wa.me/5533984246770",
      },
    ],
  },

  "barbearia": {
    tags: ["AGENDAMENTO", "SISTEMA", "2026"],
    title: "BARBEARIA",
    desc: "Sistema de agendamento inteligente para barbearias. O cliente marca o horário em poucos passos e a barbearia gerencia profissionais, agenda num painel próprio.",
    challenge: "O barbeiro recebe muitos clientes pelo WhatsApp ao mesmo tempo e não consegue parar de cortar cabelo para responder todos. E ainda precisa controlar a agenda de vários profissionais, os horários livres e os agendamentos. O desafio é atender bem o cliente, desafogar o barbeiro e manter a operação organizada — tudo num sistema só.",
    solution: "O cliente marca em poucos passos, pelo site ou pelo WhatsApp, e vê apenas os horários realmente livres — calculados a partir da agenda de cada profissional, folgas e bloqueios. No WhatsApp, parte do atendimento é automática e já sugere o próximo horário, então o barbeiro não precisa parar de trabalhar para responder. E um painel reúne tudo: o calendário de todos os profissionais, as conversas pendentes e um dashboard com ocupação, horários de pico e disponibilidade.",
    results: "O barbeiro não para mais de trabalhar para responder mensagem: o cliente agenda sozinho, a qualquer hora, pelo site ou pelo WhatsApp. A agenda fica organizada e sem conflito, e o barbeiro acompanha o dia inteiro — ocupação, horários livres e conversas pendentes.",
  },

  "flux-time": {
    tags: ["APP", "FOCO", "2026"],
    title: "FLUX TIME",
    desc: "Aplicativo de foco e produtividade construído para concentração profunda. Um timer Pomodoro com display flip-clock, modo imersivo que apaga toda a interface e sons ambientes para o usuário entrar no fluxo.",
    challenge: "Apps de produtividade costumam ser poluídos e cheios de distração — o oposto do que prometem. O desafio era criar uma ferramenta de foco bonita, calma e que saísse da frente na hora de concentrar.",
    solution: "Um timer Pomodoro configurável com display flip-clock e um modo foco imersivo que esconde tudo — controles, navbar e até o cursor — como um player de vídeo. Complementado por cronômetro, tarefas com alarmes, trilhas e frequências sonoras e temas claro/escuro, num PWA instalável.",
    results: "Uma experiência de foco fluida e instalável, que leva à concentração com poucos cliques: interface limpa no uso e rica nos detalhes — animações em GSAP, som e tema sob medida.",
  },

  "art-piso": {
    tags: ["GESTÃO", "ESTOQUE", "2026"],
    title: "ART PISO",
    desc: "Sistema inteligente de gestão de caixas e reservas de piso. Organiza num só lugar: espaço, produtos, pedidos e clientes.",
    challenge: "Gerir e organizar o galpão, as reservas e as caixas de piso de forma eficiente e inteligente. A loja possui muitos produtos cadastrados, com vários lotes diferentes, e para isso é preciso mapear corretamente as caixas, controlar as reservas e manter o estoque sempre correto.",
    solution: "Um sistema único que reúne o galpão inteiro: cada produto e lote, onde está no espaço, quantas caixas existem, quantas estão reservadas e quantas estão disponíveis. O disponível é sempre calculado, nunca digitado; reserva, entrada, perda e entrega têm fluxo próprio.",
    results: "O estoque fica sempre correto e o galpão sob controle. A loja sabe, em tempo real, o que tem, onde está cada caixa e o que pode vender ou reservar — com cada funcionário acessando apenas o que precisa.",
  },
};
