// lib/auth.ts
import bcrypt from "bcryptjs";
import { query } from "./db";
import { headers } from "next/headers";

export async function requireUser() {
  const hdrs = await headers();
  const cookieHeader = hdrs.get("cookie") || "";

  const token = getCookieValue(cookieHeader, "session");

  if (!token) return null;
  const user = await getUserFromSessionToken(token);
  return user;
}

function getCookieValue(cookieHeader: string, name: string): string | null {
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return rest.join("=");
    }
  }
  return null;
}

export type AuthUser = {
  id: number;
  email: string;
  role: "developer" | "partner";
};

export async function findUserByEmail(
  email: string
): Promise<(AuthUser & { password_hash: string }) | null> {
  const rows = await query<AuthUser & { password_hash: string }>(
    `SELECT id, email, role, password_hash FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function getUserFromSessionToken(
  token: string
): Promise<AuthUser | null> {
  const rows = await query<AuthUser>(
    `
    SELECT u.id, u.email, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = $1
    LIMIT 1
    `,
    [token]
  );
  return rows[0] || null;
}

export async function createSession(userId: number, token: string) {
  await query(
    `
    INSERT INTO sessions (user_id, session_token)
    VALUES ($1, $2)
    `,
    [userId, token]
  );
}

export async function deleteSessionByToken(token: string) {
  await query(
    `
    DELETE FROM sessions WHERE session_token = $1
    `,
    [token]
  );
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
