import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const api = axios.create({
  //baseUrl menggunakan ngrok
  // baseURL: "https://hammocklike-vulnerably-thuy.ngrok-free.dev/api",
  // Ganti baseURL sesuai IP backend yang aktif di jaringan lokal
  // Ganti baseURL sesuai IP backend yang aktif di jaringan lokal
  // baseURL: "http://10.249.18.179:8000/api",
  baseURL: "http://192.168.0.105:8000/api",
  

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
// Ganti baseURL sesuai IP backend yang aktif di jaringan lokal
export const storageurl = "http://192.168.0.105:8000/storage/";

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
