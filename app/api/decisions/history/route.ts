// app/api/decisions/history/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const items = await query<{
    id: number;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
    decided_at: string | null;
    comment: string | null;
    author: string | null;
    selected_option_label: string;
    selected_option_image: string | null;
  }>(
    `
    SELECT
      d.id,
      d.title,
      d.description,
      d.status,
      d.created_at,
      d.decided_at,
      r.comment,
      r.author,
      o.label AS selected_option_label,
      o.image_url AS selected_option_image
    FROM decisions d
    JOIN decision_responses r ON r.decision_id = d.id
    JOIN decision_options o ON o.id = r.selected_option_id
    WHERE d.status != 'pending'
    ORDER BY d.decided_at DESC NULLS LAST, d.created_at DESC
    `
  );

  return NextResponse.json(items);
}
