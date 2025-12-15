import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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

/* ================= FILTER CONFIG ================= */

const FILTERS = [
  { label: "Semua", type: "all" },
  { label: "Keamanan", type: "security" },
  { label: "Servis", type: "service" },
  { label: "Sistem", type: "system" },
  { label: "Peringatan", type: "warning" },
] as const;

/* ================= TYPE MAP ================= */

const TYPE_MAP: Record<
  string,
  { label: string; icon: React.ReactNode; bg: string }
> = {
  security: {
    label: "Keamanan",
    icon: <Ionicons name="alert-circle" size={22} color="#EF4444" />,
    bg: "#FEE2E2",
  },
  service: {
    label: "Servis",
    icon: <Ionicons name="construct-outline" size={22} color="#3B82F6" />,
    bg: "#DBEAFE",
  },
  system: {
    label: "Sistem",
    icon: <Ionicons name="settings-outline" size={22} color="#0EA5E9" />,
    bg: "#E0F2FE",
  },
  warning: {
    label: "Peringatan",
    icon: <Ionicons name="warning-outline" size={22} color="#F59E0B" />,
    bg: "#FEF3C7",
  },
};

/* ================= TYPES ================= */

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: "security" | "service" | "system" | "warning";
  is_read: number;
  created_at: string;
}

/* ================= SCREEN ================= */

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [data, setData] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNotifications("all");
  }, []);

  const fetchNotifications = async (type: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications?type=${type}`);
      setData(res.data.data);
    } catch (e) {
      console.log("Gagal load notifikasi", e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
      }}
    >
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
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? "#F8FAFC" : "#0F172A" },
          ]}
        >
          Notifikasi
        </Text>

        {/* FILTER */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.type}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    activeFilter === f.type
                      ? "#3B82F6"
                      : isDark
                      ? "#1E293B"
                      : "#FFFFFF",
                },
              ]}
              onPress={() => {
                setActiveFilter(f.type);
                fetchNotifications(f.type);
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color:
                    activeFilter === f.type ? "#FFFFFF" : "#64748B",
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshing={loading}
        onRefresh={() => fetchNotifications(activeFilter)}
        ListEmptyComponent={
          !loading ? (
            <Text
              style={{
                textAlign: "center",
                marginTop: 40,
                color: "#94A3B8",
              }}
            >
              Tidak ada notifikasi
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const meta = TYPE_MAP[item.type];

          return (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  opacity: item.is_read ? 0.6 : 1,
                },
              ]}
            >
              <View style={styles.cardRow}>
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: meta?.bg },
                  ]}
                >
                  {meta?.icon}
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.title,
                      { color: isDark ? "#E5E7EB" : "#0F172A" },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.message}>{item.message}</Text>
                </View>

                <Text style={styles.time}>
                  {item.created_at ?? "Baru saja"}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

/* ================= STYLES ================= */

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
