import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const decisions = await query<{
    id: number;
    title: string;
    description: string | null;
    created_at: string;
  }>(
    `
    SELECT id, title, description, created_at
    FROM decisions
    WHERE status = 'pending'
    ORDER BY created_at ASC
    `
  );

  if (decisions.length === 0) return NextResponse.json([]);

  const ids = decisions.map((d) => d.id);

  const options = await query<{
    id: number;
    decision_id: number;
    label: string;
    image_url: string | null;
    sort_order: number;
  }>(
    `
    SELECT id, decision_id, label, image_url, sort_order
    FROM decision_options
    WHERE decision_id = ANY($1)
    ORDER BY sort_order ASC
    `,
    [ids]
  );

  const grouped = decisions.map((d) => ({
    ...d,
    options: options.filter((o) => o.decision_id === d.id),
  }));

  return NextResponse.json(grouped);
}
