import axios from "axios";
import { type Polygon, type PolygonData, type Popup } from "../types";
import { fromPopupData, popupsApi, toPopupData } from "./popupsApi";

const BASE_URL = "http://localhost:3001/polygons";

function toPolygonData(polygon: Polygon): PolygonData {
  return {
    ...polygon,
    companies: polygon.companies.map(toPopupData),
  };
}

async function fromPolygonData(data: PolygonData): Promise<Polygon> {
  const companies = await Promise.all(
    data.companies.map(async (c) => {
      try {
        return await fromPopupData(c);
      } catch (err) {
        console.warn(`Не удалось загрузить popup с ID ${c.id}`, err);
        return null;
      }
    })
  );

  return {
    ...data,
    companies: companies.filter((c): c is Popup => c !== null),
  };
}

export const polygonsApi = {
  getAll: async (): Promise<Polygon[]> => {
    const res = await axios.get<PolygonData[]>(BASE_URL);
    return await Promise.all(res.data.map(fromPolygonData));
  },

  /** 🔹 Получить полигон по ID */
  getById: async (id: string): Promise<Polygon> => {
    const res = await axios.get<PolygonData>(`${BASE_URL}/${id}`);
    return await fromPolygonData(res.data);
  },

  getAllPopups: async (): Promise<Popup[]> => {
    const polygons = await polygonsApi.getAll();
    return polygons.flatMap((p) => {
      const { companies, ...polygonInfo } = p;
      return companies.map((co) => ({ ...co, polygonInfo }));
    });
  },

  create: async (polygon: Polygon): Promise<Polygon> => {
    const polygonData = toPolygonData(polygon);
    const res = await axios.post<PolygonData>(BASE_URL, polygonData);
    return await fromPolygonData(res.data);
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
  },

  addCompany: async (polygonId: string, popup: Popup): Promise<Polygon> => {
    if (!popup.organization?.id) {
      throw new Error("Popup не привязан к организации");
    }

    const res = await axios.get<PolygonData>(`${BASE_URL}/${polygonId}`);
    const polygonData = res.data;

    const newPopupData = toPopupData(popup);
    polygonData.companies.push(newPopupData);

    const updateRes = await axios.put<PolygonData>(
      `${BASE_URL}/${polygonId}`,
      polygonData
    );

    return await fromPolygonData(updateRes.data);
  },

  movePopup: async (popupId: string, polygonId: string): Promise<Polygon> => {
    const allPopups = await popupsApi.getAll();
    const popup = allPopups.find((p) => p.id === popupId);
    if (!popup) throw new Error("Попап не найден");
    if (!popup.organization?.id)
      throw new Error("Попап не привязан к организации");

    await popupsApi.delete(popupId);
    return await polygonsApi.addCompany(polygonId, popup);
  },
};
