export function formatPrice(price: number | null | undefined, currency = "TRY") {
  if (price === null || price === undefined) return "Fiyat için sorun";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export const FALLBACK_IMAGE = "/images/kategori-dolap.jpg";
