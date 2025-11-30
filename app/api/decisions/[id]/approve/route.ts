// app/api/decisions/[id]/approve/route.ts
import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const decisionId = Number(id);
  if (!decisionId || Number.isNaN(decisionId)) {
    return NextResponse.json(
      { error: "ID de decisão inválido." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const selectedOptionId = Number(body.selectedOptionId);
  const comment = (body.comment || "") as string;

  if (!selectedOptionId || Number.isNaN(selectedOptionId)) {
    return NextResponse.json(
      { error: "selectedOptionId é obrigatório." },
      { status: 400 }
    );
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // TODO: colocar auth de verdade depois
  const author = user.email;

  try {
    // 1) garante que a opção pertence à decisão
    const [opt] = await query<{ id: number }>(
      `
      SELECT id
      FROM decision_options
      WHERE id = $1 AND decision_id = $2
      `,
      [selectedOptionId, decisionId]
    );

    if (!opt) {
      return NextResponse.json(
        { error: "Opção não encontrada para essa decisão." },
        { status: 400 }
      );
    }

    // 2) registra resposta
    await query(
      `
      INSERT INTO decision_responses (decision_id, selected_option_id, comment, author)
      VALUES ($1, $2, $3, $4)
      `,
      [decisionId, selectedOptionId, comment, author]
    );

    // 3) atualiza status da decisão
    await query(
      `
      UPDATE decisions
      SET status = 'decided',
          decided_at = NOW(),
          decided_by = $1
      WHERE id = $2
      `,
      [author, decisionId]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao aprovar decisão:", error);
    return NextResponse.json(
      { error: "Erro ao salvar decisão." },
      { status: 500 }
    );
  }
}
