import { supabase } from "@/integrations/supabase/client";
import { ADMIN_EMAILS } from "@/lib/auth";

export type NewQuestionNotificationPayload = {
  messageId: string;
  subject?: string | null;
  body: string;
  userEmail?: string | null;
  userName?: string | null;
  productId?: string | null;
  productName?: string | null;
};

/**
 * Yeni müşteri sorusu geldiğinde yönetici e-posta ve sistem bildirim altyapısını tetikler.
 * - Yönetici e-postalarına bildirim gönderir.
 * - Supabase Edge Function 'notify-admin' mevcut ise çağırır.
 * - Hata durumunda kullanıcı akışını kesintiye uğratmadan güvenle loglar.
 */
export async function notifyAdminsOnNewQuestion(payload: NewQuestionNotificationPayload) {
  try {
    const targetEmails = [...ADMIN_EMAILS];

    console.info("[Bildirim Altyapısı] Yeni soru kaydedildi. Bildirilecek yöneticiler:", targetEmails, {
      subject: payload.subject,
      sender: payload.userEmail || payload.userName,
      product: payload.productName || payload.productId,
    });

    // 2. Supabase Edge Function'a bildirim isteği gönder (Resend / SMTP / Webhook)
    const { error: fnError } = await supabase.functions.invoke("notify-admin", {
      body: {
        to: targetEmails,
        type: "new_question",
        ...payload,
      },
    });

    if (fnError) {
      // Edge function henüz deploy edilmemiş veya API key henüz atanmamış olabilir.
      // Bu durum normaldir ve sessizce loglanır.
      console.warn("[Bildirim Altyapısı] Edge Function bildirim servisi çağrısı:", fnError.message);
    } else {
      console.info("[Bildirim Altyapısı] Yönetici bildirim e-postası başarıyla kuyruğa alındı.");
    }
  } catch (err) {
    console.warn("[Bildirim Altyapısı] Bildirim gönderilirken istisna oluştu (akış devam ediyor):", err);
  }
}
