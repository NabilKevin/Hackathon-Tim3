import { api } from "./api";

export const getServiceTypes = async (token: string) => {
  const response = await api.get("/services/types", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data?.data;
};