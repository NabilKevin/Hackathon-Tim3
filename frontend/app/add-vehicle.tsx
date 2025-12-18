import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location"; // PENTING: Jangan lupa import ini
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
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
  
  // State Lokasi & Loading
  const [location, setLocation] = useState<{lat: string, lng: string} | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Ambil Lokasi Saat Layar Dibuka
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Izin Ditolak", "Izin lokasi diperlukan untuk menyimpan titik awal kendaraan.");
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
            lat: currentLocation.coords.latitude.toString(),
            lng: currentLocation.coords.longitude.toString()
        });
        
        console.log("Lokasi ditemukan:", currentLocation.coords);

      } catch (error) {
        Alert.alert("Gagal", "Tidak bisa mengambil lokasi GPS.");
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // Validasi Field
    if (!vehicleName || !brand || !year || !plate || !transmission || !fuel || !engine) {
      Alert.alert("Validasi Gagal", "Mohon lengkapi semua formulir!");
      return;
    }

    if (!image) {
      Alert.alert("Validasi Gagal", "Foto kendaraan wajib diupload!");
      return;
    }

    // Validasi Lokasi (Optional: Bisa dipaksa atau dikasih default 0,0)
    const lat = location?.lat || "-6.200000"; 
    const lng = location?.lng || "106.816666";

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", vehicleName);
      formData.append("brand", brand);
      formData.append("transmission", transmission);
      formData.append("year", year);
      formData.append("plate_number", plate);
      formData.append("gas_type", fuel);
      formData.append("machine_capacity", engine);

      // Gunakan Lokasi Asli
      formData.append("latitude", lat);
      formData.append("longitude", lng);

      // Upload Gambar
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("photo", {
        uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
        name: filename || "vehicle.jpg",
        type: type,
      } as any);

      console.log("Sending Data:", formData);

      await api.post("/vehicles", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Berhasil", "Kendaraan Berhasil ditambah!", [
        {
            text: "OK",
            onPress: async () => {
                // Cek pairing setelah user klik OK
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
            }
        }
      ]);

    } catch (error: any) {
      console.error("ERROR UPLOAD:", error.response?.data);
      
      const serverMessage = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;
      
      let finalMessage = serverMessage || "Gagal menambahkan kendaraan";

      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];
        if (Array.isArray(firstError)) {
            finalMessage = firstError[0]; 
        }
      }

      Alert.alert("Gagal", finalMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      }}
      contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
    >
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={isDark ? "#E2E8F0" : "#334155"}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>
          Tambah Kendaraan
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* FORM INPUT */}
      <InputField label="Nama Kendaraan" value={vehicleName} onChange={setVehicleName} placeholder="Contoh: Beat Merah" />
      <InputField label="Brand" value={brand} onChange={setBrand} placeholder="Honda / Yamaha" />
      <InputField label="Tipe Transmisi" value={transmission} onChange={setTransmission} placeholder="Manual / Matic" />
      <InputField label="Tahun Keluar" value={year} onChange={setYear} keyboardType="numeric" placeholder="2023" />
      <InputField label="Plat Nomor" value={plate} onChange={setPlate} placeholder="B 1234 CD" />
      <InputField label="Bahan Bakar" value={fuel} onChange={setFuel} placeholder="Pertalite" />
      <InputField label="Kapasitas Mesin" value={engine} onChange={setEngine} placeholder="150" keyboardType="numeric"/>

      {/* INDIKATOR LOKASI (Opsional agar user tahu) */}
      <View style={{ marginBottom: 15 }}>
          <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}>
             📍 Lokasi Awal: {location ? `${location.lat}, ${location.lng}` : "Sedang mengambil..."}
          </Text>
      </View>

      {/* IMAGE PICKER */}
      <Text style={[styles.label, { color: isDark ? "#e2e8f0" : "#334155" }]}>
        Upload Gambar Motor
      </Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Ionicons name="camera-outline" size={20} color="white" style={{marginRight: 8}}/>
        <Text style={styles.uploadButtonText}>
            {image ? "Ganti Gambar" : "Pilih Gambar"}
        </Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 12,
            marginTop: 10,
            resizeMode: 'cover',
            borderWidth: 1,
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }}
        />
      )}

      {/* SAVE BUTTON */}
      <TouchableOpacity 
        style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]} 
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color="#51A2FF" />
        ) : (
            <Text style={styles.saveButtonText}>Simpan Kendaraan</Text>
        )}
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

const InputField = ({ label, value, onChange, placeholder, keyboardType }: InputProps) => {
  const isDark = useColorScheme() === "dark";
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: isDark ? "#e2e8f0" : "#334155" }]}>
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
    flexDirection: 'row',
    justifyContent: 'center'
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 25,
    backgroundColor: "#51a2ff20", 
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#51A2FF"
  },
  saveButtonText: {
    color: "#51A2FF",
    fontSize: 16,
    fontWeight: "700",
  },
});