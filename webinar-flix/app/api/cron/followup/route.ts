import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface QueueRow {
  id: string;
  phone: string;
  name: string;
  problema: string;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const edgeFnUrl = process.env.SEND_QUIZ_LEAD_URL;
  const notifyToken = process.env.WEBINAR_NOTIFY_SECRET;
  const workshopData = process.env.WORKSHOP_DATA ?? "em breve";
  const workshopHora = process.env.WORKSHOP_HORA ?? "20h";

  if (!supabaseUrl || !supabaseKey || !edgeFnUrl || !notifyToken) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const res = await fetch(
    `${supabaseUrl}/rest/v1/followup_queue?sent=eq.false&send_at=lte.${now}&select=id,phone,name,problema&limit=20`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to query queue" }, { status: 500 });
  }

  const rows: QueueRow[] = await res.json();
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  let processed = 0;

  const phones = rows.map((r) => `"${r.phone}"`).join(",");
  const optoutRes = await fetch(
    `${supabaseUrl}/rest/v1/optout_list?phone=in.(${phones})&select=phone`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );
  const optedOut = new Set(
    optoutRes.ok
      ? ((await optoutRes.json()) as { phone: string }[]).map((r) => r.phone)
      : []
  );

  for (const row of rows) {
    if (optedOut.has(row.phone)) {
      await fetch(`${supabaseUrl}/rest/v1/followup_queue?id=eq.${row.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ sent: true, sent_at: new Date().toISOString() }),
      });
      continue;
    }

    try {
      const sendRes = await fetch(edgeFnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${notifyToken}`,
        },
        body: JSON.stringify({
          phone: row.phone,
          name: row.name,
          workshopData,
          workshopHora,
          type: "followup",
          problema: row.problema,
        }),
      });

      if (sendRes.ok) {
        await fetch(
          `${supabaseUrl}/rest/v1/followup_queue?id=eq.${row.id}`,
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
        processed++;
      }
    } catch {
      // skip this row, will retry on next cron run
    }
  }

  return NextResponse.json({ ok: true, processed, total: rows.length });
}
