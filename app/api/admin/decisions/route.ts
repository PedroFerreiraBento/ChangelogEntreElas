// app/api/admin/decisions/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  if (!user || user.role !== "developer") {
    return NextResponse.json(
      { error: "Acesso restrito ao desenvolvedor." },
      { status: 403 }
    );
  }

  const decisions = await query<{
    id: number;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
  }>(
    `
    SELECT id, title, description, status, created_at
    FROM decisions
    ORDER BY created_at DESC
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

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user || user.role !== "developer") {
    return NextResponse.json(
      { error: "Acesso restrito ao desenvolvedor." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { title, description, options } = body as {
    title: string;
    description?: string;
    options: { label: string; image_url?: string; sort_order?: number }[];
  };

  if (!title || !options?.length) {
    return NextResponse.json(
      { error: "Título e pelo menos uma opção são obrigatórios." },
      { status: 400 }
    );
  }

  // cria decisão
  const decisionRows = await query<{ id: number }>(
    `
    INSERT INTO decisions (title, description)
    VALUES ($1, $2)
    RETURNING id
    `,
    [title, description || null]
  );
  const decisionId = decisionRows[0].id;

  // cria opções
  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    await query(
      `
      INSERT INTO decision_options (decision_id, label, image_url, sort_order)
      VALUES ($1, $2, $3, $4)
      `,
      [decisionId, opt.label, opt.image_url || null, opt.sort_order ?? i]
    );
  }

  return NextResponse.json({ ok: true, id: decisionId });
}
