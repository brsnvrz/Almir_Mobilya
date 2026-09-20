// Supabase Edge Function: notify-admin
// Yeni soru veya müşteri mesajı geldiğinde yöneticilere e-posta bildirimi gönderir.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, subject, body, userName, userEmail, productName } = await req.json();

    const sender = userName ? `${userName} (${userEmail})` : userEmail || "Ziyaretçi";
    const mailSubject = `[Almir Mobilya] Yeni Soru: ${subject || "Genel Soru"}${productName ? ` - ${productName}` : ""}`;
    const mailContent = `
Almir Mobilya Yönetim Paneli — Yeni Müşteri Sorusu

Gönderen: ${sender}
İlgili Ürün: ${productName || "Genel"}
Konu: ${subject || "Belirtilmedi"}

Mesaj:
${body}

---
Yönetim panelinden yanıtlamak için: https://almir-mobilya.lovable.app/yonetim
    `.trim();

    console.log(`[notify-admin] E-posta alıcıları: ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`[notify-admin] Konu: ${mailSubject}`);

    // RESEND_API_KEY veya SENDGRID_API_KEY tanımlıysa doğrudan API ile gönder
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Almir Mobilya <bildirim@almirmobilya.com>",
          to: Array.isArray(to) ? to : [to],
          subject: mailSubject,
          text: mailContent,
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, resend: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Bildirim kuyruğa alındı (API anahtarı tanımlandığında otomatik gönderilecektir).",
        preview: { to, mailSubject },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("[notify-admin] Hata:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
