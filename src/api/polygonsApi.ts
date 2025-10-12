import axios from "axios";
import { type Polygon, type Point } from "../types";

const BASE_URL = "http://localhost:3001/polygons";

export type PolygonData = {
  id: string;
  points: Point[];
  title: string;
};

// Конвертация Polygon → PolygonData (для отправки в базу)
function toPolygonData(polygon: Polygon): PolygonData {
  return {
    id: polygon.id,
    points: polygon.points,
    title: polygon.title,
  };
}

// Конвертация PolygonData → Polygon (для использования в коде)
function fromPolygonData(data: PolygonData): Polygon {
  return {
    id: data.id,
    points: data.points,
    title: data.title,
  };
}

export const polygonsApi = {
  // Получаем все полигоны из базы
  getAll: async (): Promise<Polygon[]> => {
    const res = await axios.get<PolygonData[]>(BASE_URL);
    return res.data.map(fromPolygonData);
  },

  // Создаём новый полигон
  create: async (polygon: Polygon): Promise<Polygon> => {
    const polygonData = toPolygonData(polygon);
    const res = await axios.post<PolygonData>(BASE_URL, polygonData);
    return fromPolygonData(res.data);
  },

  // Удаляем полигон по id
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
  },
};
