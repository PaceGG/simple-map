import axios from "axios";
import { type Popup } from "../data"; // сюда импортируй свои типы Popup, OrganizationKey, PopupTypeKey

const BASE_URL = "http://localhost:3001/popups";

export const popupsApi = {
  getAll: async (): Promise<Popup[]> => {
    const res = await axios.get<Popup[]>(BASE_URL);
    return res.data;
  },

  create: async (popup: Popup): Promise<Popup> => {
    const res = await axios.post<Popup>(BASE_URL, popup);
    return res.data;
  },
};
