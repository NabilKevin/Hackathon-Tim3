import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTERS = ["Semua", "Keamanan", "Servis Rutin", "Oli Mesin","Oli Gear","Servis Lainnya"] as const;

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: string;
  icon: React.ReactNode;
}

const DATA: NotificationItem[] = [
  {
    id: "1",
    title: "Servis Rutin",
    message: "Jangan lupa servis motor mu ya untuk menjaga kesehatan motor mu",
    time: "3 min ago",
    category: "Servis Rutin",
    icon: <Ionicons name="construct-outline" size={22} color="#3B82F6" />,
  },
  {
    id: "2",
    title: "Getaran Terdeteksi",
    message: "Parkiran Mall Grand Indo",
    time: "2 min ago",
    category: "Keamanan",
    icon: <Ionicons name="alert-circle" size={22} color="#EF4444" />,
  },
  {
    id: "3",
    title: "Ganti Oli Gear",
    message: "Jadwal Ganti Oli Gear sudah dekat jangan lupa untuk segera mengganti dalam 2 hari kedepan ya",
    time: "3 min ago",
    category: "Oli Gear",
    icon: <Ionicons name="cog-outline" size={22} color="#F59E0B" />,
  },
  {
    id: "4",
    title: "Ganti Oli Mesin",
    message: "Estimasi 3 Hari Ke Depan",
    time: "3 min ago",
    category: "Oli Mesin",
    icon: <MaterialCommunityIcons name="oil" size={22} color="#0EA5E9" />,
  },
  {
    id: "5",
    title: "Ganti Oli Mesin",
    message: "Jadwal Ganti Oli Mesin sudah terlewat",
    time: "3 min ago",
    category: "Oli Mesin",
    icon: <MaterialCommunityIcons name="oil" size={22} color="#EF4444" />,
  },
  {
    id: "6",
    title: "Mesin Menyala",
    message: "Pastikan yang menyalakan mesin itu anda ya",
    time: "2 min ago",
    category: "Keamanan",
    icon: <Ionicons name="warning-outline" size={22} color="#EF4444" />,
  },
];

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const [activeFilter, setActiveFilter] = useState("Semua");

  const filteredData =
    activeFilter === "Semua"
      ? DATA
      : DATA.filter((item) => item.category === activeFilter);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>
          Notifikasi
        </Text>

        {/* FILTER */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    activeFilter === filter ? "#3B82F6" : isDark ? "#1E293B" : "#FFFFFF",
                },
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: activeFilter === filter ? "#FFFFFF" : "#64748B",
                }}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            ]}
          >
            <View style={styles.cardRow}>
              <View style={styles.iconWrapper}>{item.icon}</View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: isDark ? "#E5E7EB" : "#0F172A" }]}>
                  {item.title}
                </Text>
                <Text style={styles.message}>{item.message}</Text>
              </View>

              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },

  filterRow: {
    gap: 10,
  },

  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
  },

  message: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  time: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: 8,
  },
});
