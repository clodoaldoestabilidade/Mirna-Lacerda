import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const PIPELINE_ID = "1b96fdf0-4c53-438e-84be-748b0f4ba1e4";
const STAGE_ID    = "de2e5929-d47c-4de9-a1b7-260a6549c943";
const META_PIXEL_ID = "1313505902379038";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

async function sendMetaCAPI(email: string, phone: string, nome: string, sourceUrl: string) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return;

  const normalizedPhone = "55" + phone.replace(/\D/g, "").replace(/^0+/, "");

  const eventData = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: sourceUrl,
        user_data: {
          em: [sha256(email)],
          ph: [sha256(normalizedPhone)],
          fn: [sha256(nome.trim().split(" ")[0])],
          country: [sha256("br")],
        },
      },
    ],
  };

  await fetch(
    `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    }
  );
}

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

    const problemLabels: Record<string, string> = {
      incontinencia: "Incontinência Urinária",
      ressecamento: "Ressecamento Íntimo",
      desejo: "Falta de Desejo",
      relacionamento: "Problema no Relacionamento",
      outro: "Outro",
    };
    const problemaLabel = problemLabels[problema] ?? problema;

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
          notes: dealNote,
          description: dealNote,
          tags: [
            "quiz:ressecamento",
            `problema:${problema}`,
            tentou === "sim" ? "ja-tentou-resolver" : "nunca-tentou",
          ],
          custom_fields: {
            problema: problemaLabel,
            ja_tentou_resolver: tentou === "sim" ? "Sim" : "Não",
            o_que_tentou: oQueTentou || "",
          },
          source_label: `Quiz Ressecamento — ${problemaLabel}`,
          page_url: "https://webinar.acesso.vip/ressecamento",
        }),
      });
    }

    await sendQuizWhatsApp(whatsapp as string, primeiroNome);

    await sendMetaCAPI(
      email as string,
      whatsapp as string,
      nome as string,
      "https://webinar.acesso.vip/ressecamento"
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
