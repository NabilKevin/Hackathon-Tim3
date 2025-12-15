import { getToken } from "@/services/auth";
import { getServiceSchedule } from "@/services/vehicle";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BaseItem {
  id: string;
  title: string;
  icon?: string;
}

interface NormalService extends BaseItem {
  type?: "service";
  km: number; // pastikan number
  date: string;
  category: string;
}

interface BatteryService extends BaseItem {
  type: "battery";
  batteryVoltage: string;
  batteryStatus: "Good" | "Warning" | "Low";
}

type ServiceItem = NormalService | BatteryService;

export default function ServiceScheduleScreen() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const [data, setData] = useState<ServiceItem[]>([]);

  const fetchData = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const schedule: ServiceItem[] = await getServiceSchedule(token);

      // ===== Hitung km berikutnya berdasarkan servis terakhir =====
      const normalServices = schedule.filter(s => s.type !== "battery") as NormalService[];
      if (normalServices.length > 0) {
        const lastKm = normalServices[normalServices.length - 1].km;
        const nextKm = lastKm + 5000; // misal interval tiap 5000 km
        normalServices.push({
          id: "next",
          title: "Estimasi Servis Berikutnya",
          km: nextKm,
          date: "-", // bisa diisi perkiraan tanggal jika ada data
          category: "service",
        });
      }

      setData([...schedule]);
      console.log(schedule);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }: { item: ServiceItem }) => {
    if (item.type === "battery") {
      return (
        <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
          <View style={styles.cardRow}>
            <View style={[styles.iconWrapper, { backgroundColor: "#E0F2FE" }]}>
              <MaterialCommunityIcons name="car-battery" size={22} color="#0EA5E9" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: isDark ? "#E5E7EB" : "#0F172A" }]}>Status Aki</Text>
              <Text style={styles.subtitle}>{item.batteryVoltage}</Text>
            </View>

            <Text style={[
              styles.batteryStatus,
              { color: item.batteryStatus === "Good" ? "#22C55E" : item.batteryStatus === "Warning" ? "#F59E0B" : "#EF4444" }
            ]}>
              {item.batteryStatus}
            </Text>
          </View>
        </View>
      );
    }

    // ===== Servis normal =====
    return (
      <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
        <View style={styles.cardRow}>
          <View style={styles.iconWrapper}>
            <Ionicons name="construct-outline" size={22} color="#3B82F6" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: isDark ? "#E5E7EB" : "#0F172A" }]}>{item.title}</Text>
            <Text style={styles.subtitle}>Estimasi 5–6 Hari</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.kmText}>in {item.km} km</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
      {/* HEADER */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top, backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color={isDark ? "#E2E8F0" : "#334155"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>Jadwal Servis</Text>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => { router.push("/(tabs)/vehicles/add-service"); }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
        <Text style={styles.addButtonText}>Tambahkan Data Servis</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: { paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  card: { borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  iconWrapper: { width: 42, height: 42, borderRadius: 10, backgroundColor: "#E0F2FE", justifyContent: "center", alignItems: "center", marginRight: 12 },
  title: { fontSize: 15, fontWeight: "600" },
  subtitle: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  kmText: { fontSize: 13, fontWeight: "700", color: "#2563EB" },
  dateText: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  batteryStatus: { fontSize: 13, fontWeight: "700" },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 16, marginBottom: 20, paddingVertical: 12, backgroundColor: "#E0F2FE", borderRadius: 12 },
  addButtonText: { marginLeft: 8, fontWeight: "600", color: "#2563EB" },
});
