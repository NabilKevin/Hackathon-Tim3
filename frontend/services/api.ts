import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const storageurl = "http://192.168.3.7:8000/storage/";
export const api = axios.create({
  //baseUrl menggunakan ngrok
  // baseURL: "https://hammocklike-vulnerably-thuy.ngrok-free.dev/api",
  // Ganti baseURL sesuai IP backend yang aktif di jaringan lokal
  baseURL: "http://192.168.3.7:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
