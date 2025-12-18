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
  try {
    await AsyncStorage.removeItem("token"); // hapus token
    // hapus data user jika ada
    await AsyncStorage.removeItem("user");
    return true;
  } catch (err) {
    console.log("Logout error:", err);
    return false;
  }
};

export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    
    // Parse hanya jika data ada
    return user ? JSON.parse(user) : null;
    
  } catch (error) {
    // Jika terjadi error (misal data korup/bukan JSON valid)
    console.error("Gagal mengambil user dari storage:", error);
    return null;
  }
};

export const updateUser = async (token: string, data: any) => {
  
  const response = await api.post("/update-profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json',
      "Content-Type": "multipart/form-data",
    },
  });
  
  saveUser(response.data.user);
}