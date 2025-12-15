// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // Ada token, langsung ke home
          router.replace("/(tabs)/dashboard");
        } else {
          // Tidak ada token, ke login
          router.replace("/login");
        }
      } catch (err) {
        console.log("Error cek token:", err);
        router.replace("/login");
      }
    };
  }, []);

  return null; // Tidak menampilkan UI, hanya redirect
}