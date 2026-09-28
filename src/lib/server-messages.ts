import { createServerFn } from "@tanstack/react-start";
import { getSql } from "./neon";

export const getMessagesFn = createServerFn({ method: "GET" }).handler(async () => {
  const sql = getSql();
  const rows = await sql`
    SELECT m.*,
           json_build_object(
             'id', p.id,
             'name', p.name,
             'image_url', p.image_url,
             'price', p.price,
             'currency', p.currency
           ) as products
    FROM messages m
    LEFT JOIN products p ON p.id = m.product_id
    ORDER BY m.created_at DESC
  `;
  return rows;
});

export const getMessageRepliesFn = createServerFn({ method: "GET" })
  .validator((messageId: string) => messageId)
  .handler(async ({ data: messageId }) => {
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM message_replies
      WHERE message_id = ${messageId}::uuid
      ORDER BY created_at ASC
    `;
    return rows;
  });

export const insertMessageFn = createServerFn({ method: "POST" })
  .validator((payload: any) => payload)
  .handler(async ({ data }) => {
    const sql = getSql();
    const { user_id, user_email, user_name, product_id, subject, body } = data;
    const rows = await sql`
      INSERT INTO messages (user_id, user_email, user_name, product_id, subject, body)
      VALUES (${user_id || 'guest'}, ${user_email || null}, ${user_name || null}, ${product_id ? product_id : null}, ${subject || null}, ${body})
      RETURNING *
    `;
    return rows[0];
  });

export const insertMessageReplyFn = createServerFn({ method: "POST" })
  .validator((payload: any) => payload)
  .handler(async ({ data }) => {
    const sql = getSql();
    const { message_id, author_id, author_name, from_admin, body } = data;
    const rows = await sql`
      INSERT INTO message_replies (message_id, author_id, author_name, from_admin, body)
      VALUES (${message_id}::uuid, ${author_id || 'guest'}, ${author_name || null}, ${Boolean(from_admin)}, ${body})
      RETURNING *
    `;
    return rows[0];
  });

export const updateMessageStatusFn = createServerFn({ method: "POST" })
  .validator((payload: { id: string; status: string }) => payload)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = await sql`
      UPDATE messages
      SET status = ${data.status}, updated_at = now()
      WHERE id = ${data.id}::uuid
      RETURNING *
    `;
    return rows[0];
  });
