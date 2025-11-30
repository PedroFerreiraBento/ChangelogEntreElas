// lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Função simples pra fazer queries
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
