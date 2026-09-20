//#region node_modules/.nitro/vite/services/ssr/assets/format-zQdBECWS.js
function formatPrice(price, currency = "TRY") {
	if (price === null || price === void 0) return "Fiyat için sorun";
	return new Intl.NumberFormat("tr-TR", {
		style: "currency",
		currency,
		maximumFractionDigits: 0
	}).format(price);
}
//#endregion
export { formatPrice as t };
