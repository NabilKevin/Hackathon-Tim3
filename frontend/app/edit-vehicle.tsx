import { storageurl } from "@/services/api"; // Import URL Storage
import { getToken } from "@/services/auth";
import { getVehicleDetail, updateVehicle } from "@/services/vehicle";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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

export default function EditVehicleScreen() {
  const isDark = useColorScheme() === "dark";

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [vehicleName, setVehicleName] = useState("");
  const [brand, setBrand] = useState("");
  const [transmission, setTransmission] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [fuel, setFuel] = useState("");
  const [engine, setEngine] = useState("");
  const [image, setImage] = useState<string | null>(null);
  
  // State untuk melacak apakah gambar diganti atau tidak
  const [isNewImage, setIsNewImage] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setIsNewImage(true); // Tandai bahwa user memilih gambar baru
    }
  };

  const fetchData = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      setInitialLoading(true);
      const response = await getVehicleDetail(token);
      
      setVehicleName(response.name);
      setBrand(response.brand);
      setTransmission(response.transmission);
      setYear(response.year.toString());
      setPlate(response.plate_number);
      setFuel(response.gas_type);
      setEngine(response.machine_capacity);

      // Handle Gambar Lama
      if (response.photo) {
        // Jika path dari database belum ada http, tambahkan STORAGE_URL
        const fullPath = response.photo.startsWith('http') 
            ? response.photo 
            : `${storageurl}${response.photo}`;
        setImage(fullPath);
      }

    } catch (error) {
      console.log("Error fetching data:", error);
      Alert.alert("Error", "Gagal mengambil data kendaraan");
    } finally {
      setInitialLoading(false);
    }
  }

  const handleSave = async () => {
    const token = await getToken();
    if (!token) return Alert.alert("Error", "Token tidak ditemukan");

    if (!vehicleName || !brand || !year || !plate || !fuel || !transmission || !engine ) {
      Alert.alert("Validasi", "Mohon lengkapi semua data wajib!");
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();

      // Backend Method Spoofing (PENTING untuk update file via FormData)
      formData.append("_method", "PUT"); 

      formData.append("name", vehicleName);
      formData.append("brand", brand);
      formData.append("transmission", transmission);
      formData.append("year", year);
      formData.append("plate_number", plate);
      formData.append("gas_type", fuel);
      formData.append("machine_capacity", engine);

      // Hanya kirim gambar jika user menggantinya (isNewImage = true)
      if (isNewImage && image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("photo", {
            uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
            name: filename || "vehicle_update.jpg",
            type: type,
        } as any);
      }
      
      // Pastikan fungsi updateVehicle di service Anda support FormData
      await updateVehicle(token, formData);

      Alert.alert("Berhasil", "Data kendaraan berhasil diperbarui!", [
        { text: "OK", onPress: () => router.back() } // Kembali ke halaman sebelumnya
      ]);

    } catch (error: any) {
      console.error("Update Error:", error.response?.data || error.message);
      Alert.alert("Gagal", error.response?.data?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();  
  }, []);

  if (initialLoading) {
    return (
        <View style={[styles.center, {backgroundColor: isDark ? "#0f172a" : "#f8fafc"}]}>
            <ActivityIndicator size="large" color="#2563EB" />
        </View>
    );
  }

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
          Ubah Data Kendaraan
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* FORM INPUT */}
      <InputField label="Nama Kendaraan" value={vehicleName} onChange={setVehicleName} />
      <InputField label="Brand" value={brand} onChange={setBrand} placeholder="Honda / Yamaha" />
      <InputField label="Tipe Transmisi" value={transmission} onChange={setTransmission} placeholder="Manual / Matic" />
      <InputField label="Tahun Keluar" value={year} onChange={setYear} keyboardType="numeric" />
      <InputField label="Plat Nomor" value={plate} onChange={setPlate} placeholder="B 1234 CD" />
      <InputField label="Bahan Bakar" value={fuel} onChange={setFuel} placeholder="Pertalite / Pertamax" />
      <InputField label="Kapasitas Mesin" value={engine} onChange={setEngine} placeholder="150" keyboardType="numeric" />

      {/* IMAGE PICKER */}
      <Text style={[styles.label, { color: isDark ? "#e2e8f0" : "#334155" }]}>
        Foto Kendaraan
      </Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Ionicons name="camera-outline" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.uploadButtonText}>
            {image ? "Ganti Foto" : "Pilih Foto"}
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
            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
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