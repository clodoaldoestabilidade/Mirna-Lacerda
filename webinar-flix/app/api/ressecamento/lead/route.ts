import { NextRequest, NextResponse } from "next/server";

const PIPELINE_ID = "1b96fdf0-4c53-438e-84be-748b0f4ba1e4";
const STAGE_ID    = "de2e5929-d47c-4de9-a1b7-260a6549c943";

async function sendQuizWhatsApp(phone: string, primeiroNome: string) {
  const edgeFnUrl   = process.env.SEND_QUIZ_LEAD_URL;
  const notifyToken = process.env.WEBINAR_NOTIFY_SECRET;
  const workshopData = process.env.WORKSHOP_DATA ?? "em breve";
  const workshopHora = process.env.WORKSHOP_HORA ?? "20h";

  if (!edgeFnUrl || !notifyToken) return;

  const normalizedPhone = phone.replace(/\D/g, "").replace(/^0+/, "");

  await fetch(edgeFnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${notifyToken}`,
    },
    body: JSON.stringify({
      phone: normalizedPhone,
      name: primeiroNome,
      workshopData,
      workshopHora,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, email, whatsapp, problema, tentou, oQueTentou } = body;

    if (!nome || !email || !whatsapp || !problema) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const primeiroNome = (nome as string).trim().split(" ")[0];

    const dealNote = [
      `Problema: ${problema}`,
      `Já tentou resolver: ${tentou === "sim" ? "Sim" : "Não"}`,
      oQueTentou ? `O que tentou: ${oQueTentou}` : null,
    ].filter(Boolean).join("\n");

    const ingestUrl = process.env.MEGACRM_INGEST_URL;
    if (ingestUrl) {
      await fetch(ingestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          email,
          phone: whatsapp,
          pipeline_id: PIPELINE_ID,
          stage_id: STAGE_ID,
          deal_note: dealNote,
          tags: ["quiz:ressecamento"],
          source_label: `Quiz Ressecamento — ${problema}`,
          page_url: "https://webinar.acesso.vip/ressecamento",
        }),
      });
    }

    await sendQuizWhatsApp(whatsapp as string, primeiroNome);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
