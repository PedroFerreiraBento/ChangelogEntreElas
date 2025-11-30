// app/api/admin/decisions/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const user = await requireUser();
  if (!user || user.role !== "developer") {
    return NextResponse.json(
      { error: "Acesso restrito ao desenvolvedor." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const numericId = Number(id);
  if (!numericId || Number.isNaN(numericId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  await query(`DELETE FROM decisions WHERE id = $1`, [numericId]);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const user = await requireUser();
  if (!user || user.role !== "developer") {
    return NextResponse.json(
      { error: "Acesso restrito ao desenvolvedor." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const numericId = Number(id);
  if (!numericId || Number.isNaN(numericId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await req.json();
  const { title, description, status, options } = body as {
    title: string;
    description?: string;
    status: string;
    options: {
      id?: number;
      label: string;
      image_url?: string;
      sort_order?: number;
    }[];
  };

  await query(
    `
    UPDATE decisions
    SET title = $1,
        description = $2,
        status = $3
    WHERE id = $4
    `,
    [title, description || null, status, numericId]
  );

  // para simplificar: apaga opções antigas e recria
  await query(`DELETE FROM decision_options WHERE decision_id = $1`, [
    numericId,
  ]);

  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    await query(
      `
      INSERT INTO decision_options (decision_id, label, image_url, sort_order)
      VALUES ($1, $2, $3, $4)
      `,
      [numericId, opt.label, opt.image_url || null, opt.sort_order ?? i]
    );
  }

  return NextResponse.json({ ok: true });
}
