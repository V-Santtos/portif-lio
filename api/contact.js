const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const clean = (value) => String(value || "").trim();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error("Configuração de e-mail ausente.");
    return res.status(500).json({ error: "O envio ainda não está configurado." });
  }

  const nome = clean(req.body?.nome);
  const contato = clean(req.body?.contato);
  const contatoTipo = clean(req.body?.contatoTipo);
  const prazo = clean(req.body?.prazo);
  const orcamento = clean(req.body?.orcamento);
  const mensagem = clean(req.body?.mensagem);

  if (!nome || !contato || !prazo || !orcamento || mensagem.length < 10) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
  }

  const subjectName = nome.replace(/[\r\n]+/g, " ").slice(0, 80);
  const rows = [
    ["Nome", nome],
    ["Contato", contato],
    ["Tipo de contato", contatoTipo === "tel" ? "Telefone" : "E-mail"],
    ["Prazo", prazo],
    ["Orçamento", orcamento],
    ["Mensagem", mensagem],
  ];
  const html = `
    <h1>Novo contato pelo portfólio</h1>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif">
      ${rows.map(([label, value]) => `<tr><td style="padding:8px 16px 8px 0;font-weight:700;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("")}
    </table>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "victor-portfolio-contact-form/1.0",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: contatoTipo === "email" ? contato : undefined,
        subject: `Novo contato de ${subjectName}`,
        html,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Falha ao enviar e-mail:", response.status, details);
      return res.status(502).json({ error: "Não foi possível enviar agora." });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Erro ao contactar o provedor de e-mail:", error);
    return res.status(502).json({ error: "Não foi possível enviar agora." });
  }
}
