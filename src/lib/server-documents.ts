import { createServerFn } from "@tanstack/react-start";
import { getSql } from "./neon";

export const getPdfDocumentFn = createServerFn({ method: "GET" })
  .validator((key: string) => key)
  .handler(async ({ data: key }) => {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS site_documents (
        key text PRIMARY KEY,
        filename text,
        data text NOT NULL,
        updated_at timestamptz DEFAULT now()
      );
    `;

    const rows = await sql`
      SELECT key, filename, data, updated_at
      FROM site_documents
      WHERE key = ${key}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) return null;
    return rows[0] as { key: string; filename: string | null; data: string; updated_at: string };
  });

export const savePdfDocumentFn = createServerFn({ method: "POST" })
  .validator((payload: { key: string; filename?: string; data: string }) => payload)
  .handler(async ({ data }) => {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS site_documents (
        key text PRIMARY KEY,
        filename text,
        data text NOT NULL,
        updated_at timestamptz DEFAULT now()
      );
    `;

    const rows = await sql`
      INSERT INTO site_documents (key, filename, data, updated_at)
      VALUES (${data.key}, ${data.filename || "yenilikler.pdf"}, ${data.data}, now())
      ON CONFLICT (key) DO UPDATE SET
        filename = EXCLUDED.filename,
        data = EXCLUDED.data,
        updated_at = now()
      RETURNING key, filename, updated_at
    `;

    return rows[0];
  });
