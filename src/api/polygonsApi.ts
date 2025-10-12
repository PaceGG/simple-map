import axios from "axios";
import { type Polygon, type Point } from "../types";

const BASE_URL = "http://localhost:3001/polygons";

// Тип для хранения в базе (PolygonData идентичен Polygon)
export type PolygonData = {
  id: string;
  points: Point[];
  title: string;
  image: string; // base64
};

// 🔹 File → base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}

// 🔹 base64 → File (для использования в коде, если нужно)
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "";
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// 🔹 Polygon → PolygonData (для сохранения в базе)
export async function toPolygonData(polygon: Polygon): Promise<PolygonData> {
  // Если polygon.image уже base64, просто возвращаем
  return {
    id: polygon.id,
    points: polygon.points,
    title: polygon.title,
    image: polygon.image || "",
  };
}

// 🔹 PolygonData → Polygon (для использования в коде)
export function fromPolygonData(data: PolygonData): Polygon {
  return {
    id: data.id,
    points: data.points,
    title: data.title,
    image: data.image,
  };
}

export const polygonsApi = {
  // Получаем все полигоны
  getAll: async (): Promise<Polygon[]> => {
    const res = await axios.get<PolygonData[]>(BASE_URL);
    return res.data.map(fromPolygonData);
  },
  // Создаём новый полигон
  create: async (polygon: Polygon): Promise<Polygon> => {
    const polygonData = await toPolygonData(polygon);
    const res = await axios.post<PolygonData>(BASE_URL, polygonData);
    return fromPolygonData(res.data);
  },
  // Удаляем по id
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
  },
};
