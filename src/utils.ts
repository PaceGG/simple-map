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

  const targetWidth = 960;
  const scaleFactor = targetWidth / img.width;

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = Math.round(img.height * scaleFactor);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Не удалось получить 2D контекст");

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Получаем Base64 в WebP с качеством 0.7
  return canvas.toDataURL("image/webp", 1);
};
