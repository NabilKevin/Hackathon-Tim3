import { api } from "@/services/api";
import { getToken } from "@/services/auth";
import { getNotification } from "@/services/notification";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList, Modal, StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ================= FILTER CONFIG ================= */
const FILTERS = [
  { label: "Semua", type: "all", icon: <Ionicons name="notifications-outline" size={18} color="#6B7280" /> },
  { label: "Keamanan", type: "security", icon: <Ionicons name="shield-checkmark-outline" size={18} color="#EF4444" /> },
  { label: "Servis", type: "service", icon: <Ionicons name="construct-outline" size={18} color="#3B82F6" /> },
  { label: "Sistem", type: "system", icon: <Ionicons name="settings-outline" size={18} color="#0EA5E9" /> },
  { label: "Peringatan", type: "warning", icon: <Ionicons name="warning-outline" size={18} color="#F59E0B" /> },
] as const;

/* ================= TYPES ================= */
interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: "security" | "service" | "system" | "warning";
  is_read: number;
  created_at: string;
  excerpt?: string;
  time?: string;
}

/* ================= SCREEN ================= */
export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const [activeFilter, setActiveFilter] = useState("all");
  const [data, setData] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (item: NotificationItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalVisible(false);
  };

  /* ---------- Fetch Notifications ---------- */
  const fetchNotifications = async (type: string) => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) {
        const res = await getNotification(token, type);
        const filtered = type === "all" ? res : res.filter((item: any) => item.type === type);
        setData(filtered);
      } else {
        Alert.alert("Error", "Token tidak ditemukan");
      }
    } catch (e) {
      console.log("Gagal load notifikasi", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(activeFilter);
  }, [activeFilter]);

  /* ---------- Mark All as Read ---------- */
  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
    } catch (err) {
      console.log("MARK READ ERROR:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      markAllAsRead();
    }, [])
  );

  /* ---------- ICON PER TYPE ---------- */
  const renderIcon = (type: string) => {
    switch (type) {
      case "security":
        return <Ionicons name="shield-checkmark-outline" size={24} color="#EF4444" />;
      case "service":
        return <Ionicons name="construct-outline" size={24} color="#3B82F6" />;
      case "system":
        return <Ionicons name="settings-outline" size={24} color="#0EA5E9" />;
      case "warning":
        return <Ionicons name="warning-outline" size={24} color="#F59E0B" />;
      default:
        return <Ionicons name="notifications-outline" size={24} color="#6B7280" />;
    }
  };

 return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openModal(item)}>
            <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
              <View style={styles.cardRow}>
                <View style={styles.iconWrapper}>{renderIcon(item.type)}</View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.title, { color: isDark ? "#E5E7EB" : "#0F172A" }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.message}>{item.excerpt ?? item.message}</Text>
                </View>

                <Text style={styles.time}>{item.time ?? item.created_at}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* MODAL DETAIL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <Text style={[styles.modalTitle, { color: isDark ? "#E5E7EB" : "#0F172A" }]}>
              {selectedItem?.title}
            </Text>
            <Text style={[styles.modalType, { color: isDark ? "#94A3B8" : "#64748B" }]}>
              Type: {selectedItem?.type}
            </Text>
            <Text style={[styles.modalMessage, { color: isDark ? "#E5E7EB" : "#0F172A" }]}>
              {selectedItem?.excerpt}
            </Text>
            <Text style={[styles.modalTime, { color: isDark ? "#94A3B8" : "#64748B" }]}>
              {selectedItem?.time}
            </Text>

            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  filterContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: "#64748B",
  },
  time: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: 6,
    alignSelf: "flex-start",
  },

   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", borderRadius: 14, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  modalType: { fontSize: 13, marginBottom: 10 },
  modalMessage: { fontSize: 15, marginBottom: 12 },
  modalTime: { fontSize: 12, textAlign: "right", marginBottom: 20 },
  closeButton: { backgroundColor: "#3B82F6", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
});
