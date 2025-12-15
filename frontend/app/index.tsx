// app/index.tsx
import { router } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    // Redirect ke halaman login atau dashboard sesuai kebutuhan
    router.replace("/splash");
  }, []);

  return null; // Tidak menampilkan UI, hanya redirect
}