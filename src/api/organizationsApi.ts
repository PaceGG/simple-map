import axios from "axios";
import type { OrganizationInfo } from "../types";

const BASE_URL = "http://localhost:3001/organizations";

export const organizationsApi = {
  async getAll(): Promise<OrganizationInfo[]> {
    const response = await axios.get(BASE_URL);
    return response.data;
  },

  async getById(id: number): Promise<OrganizationInfo> {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: Omit<OrganizationInfo, "id">): Promise<OrganizationInfo> {
    const response = await axios.post(BASE_URL, data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<OrganizationInfo>
  ): Promise<OrganizationInfo> {
    const response = await axios.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
  },
};
