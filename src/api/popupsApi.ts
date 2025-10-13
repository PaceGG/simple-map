import axios from "axios";
import type { Popup, PopupData } from "../types";
import { polygonsApi } from "./polygonsApi";
import { organizationsApi } from "./organizationsApi";

const BASE_URL = "http://localhost:3001/popups";

export function toPopupData(popup: Popup): PopupData {
  return {
    id: popup.id,
    position: popup.position,
    image: popup.image,
    organizationId: popup.organization.id,
  };
}

export async function fromPopupData(data: PopupData): Promise<Popup> {
  return {
    id: data.id,
    position: data.position,
    image: data.image,
    organization: await organizationsApi.getById(data.organizationId),
  };
}

export const popupsApi = {
  async getAll(): Promise<Popup[]> {
    const res = await axios.get<PopupData[]>(BASE_URL);
    const basePopups = await Promise.all(res.data.map(fromPopupData));
    const polygonsPopups = await polygonsApi.getAllPopups();
    return [...basePopups, ...polygonsPopups];
  },

  async create(popup: Popup): Promise<Popup> {
    const popupData = toPopupData(popup);
    const res = await axios.post<PopupData>(BASE_URL, popupData);
    return await fromPopupData(res.data);
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
  },
};
