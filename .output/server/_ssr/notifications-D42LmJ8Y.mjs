import { t as supabase } from "./client-DxLTTzyN.mjs";
import { t as ADMIN_EMAILS } from "./AuthModal-C56nx3nQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-D42LmJ8Y.js
/**
* Yeni müşteri sorusu geldiğinde yönetici e-posta ve sistem bildirim altyapısını tetikler.
* - Yönetici e-postalarına bildirim gönderir.
* - Supabase Edge Function 'notify-admin' mevcut ise çağırır.
* - Hata durumunda kullanıcı akışını kesintiye uğratmadan güvenle loglar.
*/
async function notifyAdminsOnNewQuestion(payload) {
	try {
		const targetEmails = [...ADMIN_EMAILS];
		console.info("[Bildirim Altyapısı] Yeni soru kaydedildi. Bildirilecek yöneticiler:", targetEmails, {
			subject: payload.subject,
			sender: payload.userEmail || payload.userName,
			product: payload.productName || payload.productId
		});
		const { error: fnError } = await supabase.functions.invoke("notify-admin", { body: {
			to: targetEmails,
			type: "new_question",
			...payload
		} });
		if (fnError) console.warn("[Bildirim Altyapısı] Edge Function bildirim servisi çağrısı:", fnError.message);
		else console.info("[Bildirim Altyapısı] Yönetici bildirim e-postası başarıyla kuyruğa alındı.");
	} catch (err) {
		console.warn("[Bildirim Altyapısı] Bildirim gönderilirken istisna oluştu (akış devam ediyor):", err);
	}
}
//#endregion
export { notifyAdminsOnNewQuestion as t };
