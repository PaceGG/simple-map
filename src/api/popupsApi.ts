import axios from "axios";
import type { Popup, PopupData } from "../types";
import { polygonsApi } from "./polygonsApi";

const BASE_URL = "http://localhost:3001/popups";

/**
 * 🔹 Конвертация Popup → PopupData
 * Используется при сохранении в базу данных
 */
export function toPopupData(popup: Popup): PopupData {
  return {
    id: popup.id,
    position: popup.position,
    image: popup.image,
    organization: popup.organization, // сохраняем объект как есть
  };
}

/**
 * 🔹 Конвертация PopupData → Popup
 * Используется при загрузке данных из базы
 */
export function fromPopupData(data: PopupData): Popup {
  return {
    id: data.id,
    position: data.position,
    image: data.image,
    organization: data.organization, // возвращаем объект без преобразований
  };
}

/**
 * 🔹 API для работы с попапами
 */
export const popupsApi = {
  // Получить все попапы (включая из polygons)
  async getAll(): Promise<Popup[]> {
    const res = await axios.get<PopupData[]>(BASE_URL);
    const basePopups = res.data.map(fromPopupData);

    const polygonsPopups = await polygonsApi.getAllPopups();

    return [...basePopups, ...polygonsPopups];
  },

  // Создать новый попап
  async create(popup: Popup): Promise<Popup> {
    const popupData = toPopupData(popup);
    const res = await axios.post<PopupData>(BASE_URL, popupData);
    return fromPopupData(res.data);
  },

  // Удалить попап по ID
  async delete(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
  },
};
