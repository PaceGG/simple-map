import axios from "axios";
import { type Popup, type PopupData } from "../types";
import { Organization, PopupType } from "../data";
import { polygonsApi } from "./polygonsApi";

const BASE_URL = "http://localhost:3001/popups";

// Конвертация Popup → PopupData (для отправки в базу)
export function toPopupData(popup: Popup): PopupData {
  const organizationKey = Object.keys(Organization).find(
    (key) =>
      Organization[key as keyof typeof Organization] === popup.organization
  ) as keyof typeof Organization;

  const typeKey = Object.keys(PopupType).find(
    (key) => PopupType[key as keyof typeof PopupType] === popup.type
  ) as keyof typeof PopupType;

  return {
    id: popup.id,
    position: popup.position,
    image: popup.image,
    organization: organizationKey,
    type: typeKey,
  };
}

// Конвертация PopupData → Popup (для использования в коде)
export function fromPopupData(data: PopupData): Popup {
  return {
    ...data,
    organization: Organization[data.organization],
    type: PopupType[data.type],
  };
}

export const popupsApi = {
  // Получаем все попапы из базы
  getAll: async (): Promise<Popup[]> => {
    const res = await axios.get<PopupData[]>(BASE_URL);
    const dataPopups = res.data.map(fromPopupData);

    const polygonsPopups = await polygonsApi.getAllPopups();

    console.log([...dataPopups, ...polygonsPopups]);

    return [...dataPopups, ...polygonsPopups];
  },

  // Создаём новый попап, но отправляем в базу только ключи
  create: async (popup: Popup): Promise<Popup> => {
    const popupData = toPopupData(popup);
    const res = await axios.post<PopupData>(BASE_URL, popupData);
    return fromPopupData(res.data);
  },

  // Удаляем попап по id
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
  },
};
