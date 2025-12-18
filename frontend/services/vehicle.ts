import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export const getServiceHistories = async (token: string) => {
  const response = await api.get("/services", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data?.data;
};

export const getServiceSchedule = async (token: string) => {
  const response = await api.get("/services/schedules", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data?.data;
};

export const addService = async (token: string, data: any) => {
  const response = await api.post("/services", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export const getVehicleDetail = async (token: string) => {
  const response = await api.get("/vehicles/detail", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data?.data;
};

export const updateVehicle = async (token: string, formData: FormData) => {
  return api.post('/vehicles', formData, { // Pakai POST jika pakai _method: PUT
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
      method: 'PUT',
    },
  });
};

