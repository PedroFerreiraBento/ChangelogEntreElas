// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { findUserByEmail, verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email e senha são obrigatórios." },
      { status: 400 }
    );
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json(
      { error: "Credenciais inválidas." },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "Credenciais inválidas." },
      { status: 401 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  await createSession(user.id, token);

  const res = NextResponse.json({
    ok: true,
    role: user.role,
  });

  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return res;
}
