import { getToken } from "@/services/auth";
import { getServiceTypes } from "@/services/service";
import { addService, getVehicleDetail } from "@/services/vehicle";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddServiceScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceType, setServiceType] = useState({
    id: "",
    name: "",
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [km, setKm] = useState("0 km");
  const [note, setNote] = useState("");
  const [price, setPrice] = useState("");

  const getServiceType = async () => {
    const token = await getToken();
    if (!token) return null;
    try {
      const data = await getServiceTypes(token);
      setServiceTypes(data);
    } catch (error) {
      console.log(error);
    }
  }

  const getVehicle = async () => {
    const token = await getToken();
    if (!token) return null;
    try {
      const data = await getVehicleDetail(token);
      
      setKm(data.odometer.toString());
    } catch (error: any) {
      console.log(error.response.data);
    }
  }

  const handleSubmit = async () => {
    const token = await getToken();
    if (!token) return Alert.alert("Error", "Token tidak ditemukan");
    if (!serviceType || !date || !km || !price || !note) return Alert.alert("Error", "Semua field wajib diisi");
    console.log({
        service_type_id: serviceType?.id,
        date,
        km,
        description: note,
        total: price,
      });
    
    try {
      await addService(token, {
        service_type_id: serviceType?.id,
        date,
        km,
        description: note,
        total: price,
      })
      router.back();
    } catch (error:any) {
      console.log(error.response.data);
    }
  }

  useEffect(() => {
    getVehicle();
    getServiceType();
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" },
      ]}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, backgroundColor: isDark ? "#0F172A" : "#FFFFFF" },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={isDark ? "#E2E8F0" : "#334155"}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>
          Tambah Data Servis
        </Text>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        {/* JENIS SERVICE */}
        <Text style={styles.label}>Jenis Service</Text>
        <TouchableOpacity
          style={[
            styles.input,
            { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
          ]}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text
            style={{
              color: serviceType
                ? isDark
                  ? "#E5E7EB"
                  : "#0F172A"
                : "#94A3B8",
            }}
          >
            {serviceType?.name ?? "Pilih Jenis Service"}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {showDropdown && (
          <View
            style={[
              styles.dropdown,
              { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            ]}
          >
            {serviceTypes.map((item: any) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setServiceType(item);
                  setShowDropdown(false);
                }}
              >
                <Text style={{ color: isDark ? "#E5E7EB" : "#0F172A" }}>
                  {item?.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TANGGAL */}
        <Text style={styles.label}>Tanggal Service</Text>
        <TextInput
          placeholder="dd/mm/yyyy"
          placeholderTextColor="#94A3B8"
          value={date}
          onChangeText={setDate}
          style={[
            styles.input,
            { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            { color: isDark ? "#E2E8F0" : "#334155" },
          ]}
        />

        {/* KM */}
        <Text style={styles.label}>Kilometer saat ini</Text>
        <TextInput
          value={`${km} km`}
          editable={true}
          style={[
            styles.input,
            { backgroundColor: isDark ? "#334155" : "#E2E8F0" },
            { color: isDark ? "#E2E8F0" : "#334155" },
          ]}
        />

        {/* KETERANGAN */}
        <Text style={styles.label}>Keterangan Servis</Text>
        <TextInput
          multiline
          numberOfLines={4}
          value={note}
          onChangeText={setNote}
          style={[
            styles.textArea,
            { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            { color: isDark ? "#E2E8F0" : "#334155" },
          ]}
        />

        {/* BIAYA */}
        <Text style={styles.label}>Total Biaya Servis</Text>
        <TextInput
          placeholder="Masukkan Biaya Servis"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
          style={[
            styles.input,
            { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            { color: isDark ? "#E2E8F0" : "#334155" },
          ]}
        />
      </View>

      {/* BUTTON */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
        <Text style={styles.saveText}>Simpan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },

  form: {
    padding: 16,
  },

  label: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
    marginTop: 14,
  },

  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textArea: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },

  dropdown: {
    borderRadius: 12,
    marginTop: 6,
    overflow: "hidden",
  },

  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  saveButton: {
    margin: 16,
    paddingVertical: 14,
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
  },

  saveText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#3B82F6",
    fontSize: 16,
  },
});
