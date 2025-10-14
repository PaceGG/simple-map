export const fileToBase64 = async (file: File): Promise<string> => {
  // Загружаем изображение
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // 🔹 коэффициент сжатия линейный
  const compressionFactor = 1 / 4.8;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * compressionFactor);
  canvas.height = Math.round(img.height * compressionFactor);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Не удалось получить 2D контекст");

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Получаем Base64 в JPEG с качеством 0.7
  return canvas.toDataURL("image/jpeg", 0.7);
};
