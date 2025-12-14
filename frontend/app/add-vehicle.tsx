import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function AddVehicleScreen() {
  const isDark = useColorScheme() === "dark";

  const [vehicleName, setVehicleName] = useState("");
  const [brand, setBrand] = useState("");
  const [transmission, setTransmission] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [fuel, setFuel] = useState("");
  const [engine, setEngine] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
  if (!vehicleName || !brand || !year || !plate) {
    Alert.alert("Validasi", "Mohon lengkapi semua data wajib!");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("name", vehicleName);
    formData.append("brand", brand);
    formData.append("transmission", transmission);
    formData.append("year", year);
    formData.append("plate_number", plate);
    formData.append("gas_type", fuel);
    formData.append("machine_capacity", engine);

    // Dummy GPS (nanti bisa ambil dari Location API)
    formData.append("latitude", "-6.2741");
    formData.append("longitude", "106.85");

    if (image) {
      formData.append("photo", {
        uri: image,
        name: "vehicle.jpg",
        type: "image/jpeg",
      } as any);
    }

    await api.post("/vehicles", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    Alert.alert("Berhasil", "Kendaraan Berhasil ditambah!");

    // Setelah kendaraan dibuat → cek pairing
    try {
      const telemetry = await api.get("/vehicles/telemetry");

      if (!telemetry.data?.device_id) {
        router.replace("/(tabs)/vehicles/connect-device");
      } else {
        router.replace("/dashboard");
      }
    } catch {
      router.replace("/(tabs)/vehicles/connect-device");
    }

  } catch (error: any) {
    Alert.alert(
      "Gagal",
      error.response?.data?.message || "Gagal menambahkan kendaraan"
    );
  }
};

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* HEADER DENGAN TOMBOL BACK */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={isDark ? "#E2E8F0" : "#334155"}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? "#F1F5F9" : "#0F172A" },
          ]}
        >
          Tambah Kendaraan
        </Text>

        {/* Placeholder untuk membuat judul tetap centered */}
        <View style={{ width: 26 }} />
      </View>

      {/* FORM INPUT */}
      <InputField label="Nama Kendaraan" value={vehicleName} onChange={setVehicleName} />
      <InputField label="Brand" value={brand} onChange={setBrand} placeholder="Honda / Yamaha / Suzuki" />
      <InputField label="Tipe Transmisi" value={transmission} onChange={setTransmission} placeholder="Manual / Matic" />
      <InputField label="Tahun Keluar" value={year} onChange={setYear} keyboardType="numeric" />
      <InputField label="Plat Nomor" value={plate} onChange={setPlate} placeholder="B 1234 CD" />
      <InputField label="Bahan Bakar" value={fuel} onChange={setFuel} placeholder="Pertalite / Pertamax" />
      <InputField label="Kapasitas Mesin" value={engine} onChange={setEngine} placeholder="150cc" />

      {/* IMAGE PICKER */}
      <Text style={[styles.label, { color: isDark ? "#e2e8f0" : "#334155" }]}>
        Upload Gambar Motor
      </Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>Pilih Gambar</Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 12,
            marginTop: 10,
          }}
        />
      )}

      {/* SAVE BUTTON */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Simpan Kendaraan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* Reusable Input Component */
type InputProps = {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
}: InputProps) => {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={[
          styles.label,
          { color: isDark ? "#e2e8f0" : "#334155" },
        ]}
      >
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e293b" : "#e2e8f0",
            color: isDark ? "white" : "black",
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
        keyboardType={keyboardType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 25,
    backgroundColor: "#51a2ff10",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#51A2FF",
    fontSize: 16,
    fontWeight: "700",
  },
});
