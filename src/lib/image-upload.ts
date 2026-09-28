/**
 * Görselleri tarayıcıda otomatik optimize edip WebP / JPEG formatında
 * hafif ve yüksek kaliteli Base64 Data URL'e dönüştürür.
 * Bu sayede fotoğraflar doğrudan bulut veritabanında (Neon) saklanır,
 * ek depolama servisi gerekmez ve tüm cihazlarda anında açılır.
 */
export async function processImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Sadece resim dosyalarını kabul et
    if (!file.type.startsWith("image/")) {
      reject(new Error("Lütfen geçerli bir görsel dosyası seçin."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Görsel yüklenemedi."));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // En-boy oranını koruyarak yeniden boyutlandır
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Görsel işlenemedi."));
          return;
        }

        // Net çizim
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // WebP dene, desteklenmiyorsa JPEG'e dönüştür
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Birden fazla dosyayı sırayla optimize edip listeler.
 */
export async function processMultipleImageFiles(
  files: FileList | File[],
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const fileArray = Array.from(files);
  const results: string[] = [];

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    try {
      const base64 = await processImageFile(file);
      results.push(base64);
    } catch (err) {
      console.warn(`[ImageUpload] ${file.name} işlenemedi:`, err);
    }
    if (onProgress) {
      onProgress(i + 1, fileArray.length);
    }
  }

  return results;
}
