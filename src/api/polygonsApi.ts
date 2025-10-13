import axios from "axios";
import { type Polygon, type PolygonData, type Popup } from "../types";
import { fromPopupData, popupsApi, toPopupData } from "./popupsApi";

const BASE_URL = "http://localhost:3001/polygons";

// Конвертация Polygon → PolygonData (для отправки в базу)
function toPolygonData(polygon: Polygon): PolygonData {
  return {
    ...polygon,
    companies: polygon.companies.map(toPopupData),
  };
}

// Конвертация PolygonData → Polygon (для использования в коде)
function fromPolygonData(data: PolygonData): Polygon {
  return {
    ...data,
    companies: data.companies.map(fromPopupData),
  };
}

export const polygonsApi = {
  getAll: async (): Promise<Polygon[]> => {
    const res = await axios.get<PolygonData[]>(BASE_URL);
    return res.data.map(fromPolygonData);
  },

  getAllPopups: async (): Promise<Popup[]> => {
    const polygons = await polygonsApi.getAll();
    return polygons.flatMap((p) => p.companies);
  },

  create: async (polygon: Polygon): Promise<Polygon> => {
    const polygonData = toPolygonData(polygon);
    const res = await axios.post<PolygonData>(BASE_URL, polygonData);
    return fromPolygonData(res.data);
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
  },

  addCompany: async (polygonId: string, popup: Popup): Promise<Polygon> => {
    const res = await axios.get<PolygonData>(`${BASE_URL}/${polygonId}`);
    const polygonData = res.data;

    const newPopupData = toPopupData(popup);

    polygonData.companies.push(newPopupData);

    const updateRes = await axios.put<PolygonData>(
      `${BASE_URL}/${polygonId}`,
      polygonData
    );

    return fromPolygonData(updateRes.data);
  },

  movePopup: async (popupId: string, polygonId: string): Promise<Polygon> => {
    const allPopups = await popupsApi.getAll();
    const popup = allPopups.find((p) => p.id === popupId);
    if (!popup) throw new Error("Попап не найден");

    await popupsApi.delete(popupId);

    const updatedPolygon = await polygonsApi.addCompany(polygonId, popup);

    return updatedPolygon;
  },
};
