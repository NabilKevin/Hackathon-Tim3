import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem("token", token);
};

export const saveUser = async (user: any) => {
  await AsyncStorage.setItem("user", JSON.stringify(user));
};

export const getToken = async () => {
  return AsyncStorage.getItem("token");
};

export const logout = async () => {
  await AsyncStorage.removeItem("token");
};

export const getUser = async () => {
  const user = await AsyncStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export const updateUser = async (token: string, data: any) => {
  const response = await api.put("/update-profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json',
      // "Content-Type": "multipart/form-data",
    },
  });
}