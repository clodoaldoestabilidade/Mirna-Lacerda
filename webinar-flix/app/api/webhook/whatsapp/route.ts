import { NextRequest, NextResponse } from "next/server";

const OPTOUT_KEYWORDS = ["stop", "parar", "sair", "não quero", "nao quero", "cancelar"];

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await req.json();

    const entries = body.entry ?? [];
    for (const entry of entries) {
      const changes = entry.changes ?? [];
      for (const change of changes) {
        const messages = change.value?.messages ?? [];
        for (const msg of messages) {
          if (msg.type !== "text" && msg.type !== "button") continue;

          const text = (
            msg.type === "button" ? msg.button?.text : msg.text?.body
          )?.toLowerCase().trim() ?? "";

          const phone = msg.from?.replace(/^\+?55/, "") ?? "";

          const isOptOut = OPTOUT_KEYWORDS.some((kw) => text.includes(kw));

          if (isOptOut && phone) {
            await fetch(`${supabaseUrl}/rest/v1/optout_list`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Prefer: "return=minimal",
              },
              body: JSON.stringify({
                phone,
                reason: text,
              }),
            });

            await fetch(
              `${supabaseUrl}/rest/v1/followup_queue?phone=eq.${phone}&sent=eq.false`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                  Prefer: "return=minimal",
                },
                body: JSON.stringify({ sent: true, sent_at: new Date().toISOString() }),
              }
            );
          }
        }
      }
    }
  } catch {
    // never fail the webhook
  }

  return NextResponse.json({ ok: true });
}
