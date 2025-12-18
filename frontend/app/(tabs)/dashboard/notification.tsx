import { api } from "@/services/api";
import { getToken } from "@/services/auth";
import { getNotification } from "@/services/notification";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView, // Tambahkan ScrollView
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ================= FILTER CONFIG ================= */
const FILTERS = [
  { label: "Semua", type: "all", iconName: "notifications-outline" },
  { label: "Keamanan", type: "security", iconName: "shield-checkmark-outline" },
  { label: "Servis", type: "service", iconName: "construct-outline" },
  { label: "Sistem", type: "system", iconName: "settings-outline" },
  { label: "Peringatan", type: "warning", iconName: "warning-outline" },
] as const;

/* ================= TYPES ================= */
interface NotificationItem {
  id: number;
  title: string;
  message: string;
  content: string;
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
         // Ambil data dari API
         const res = await getNotification(token, type);
         
         // Pastikan res adalah array (jaga-jaga jika API error/null)
         const safeRes = Array.isArray(res) ? res : [];

         // Lakukan filtering
         const filtered = type === "all" 
            ? safeRes 
            : safeRes.filter((item: any) => item.type === type);
         
         // Masukkan ke state (bisa array isi data, atau array kosong)
         setData(filtered);

      } else {
         // Jika tidak ada token, kosongkan data
         setData([]); 
      }
    } catch (e) {
      console.log("Gagal load notifikasi", e);
      // Jika error, anggap data kosong agar UI tidak crash
      setData([]); 
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

  /* ---------- ICON RENDER HELPER ---------- */
  const renderIcon = (type: string, size = 24, color?: string) => {
    const defaultColor = isDark ? "#E5E7EB" : "#374151";
    
    // Warna spesifik icon card
    let iconColor = color || defaultColor;
    if (!color) {
        if (type === 'security') iconColor = "#EF4444";
        if (type === 'service') iconColor = "#3B82F6";
        if (type === 'system') iconColor = "#0EA5E9";
        if (type === 'warning') iconColor = "#F59E0B";
    }

    let iconName: any = "notifications-outline";
    if (type === "security") iconName = "shield-checkmark-outline";
    if (type === "service") iconName = "construct-outline";
    if (type === "system") iconName = "settings-outline";
    if (type === "warning") iconName = "warning-outline";

    return <Ionicons name={iconName} size={size} color={iconColor} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
      
      {/* --- HEADER & FILTER SECTION (Sticky di atas) --- */}
      <View style={[
          styles.headerContainer, 
          { paddingTop: insets.top + 10, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }
        ]}>
        
        {/* Title */}
        <Text style={[styles.headerTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
          Notifikasi
        </Text>

        {/* Horizontal Scroll Filter */}
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.type;
              
              // Warna Tombol
              const bgColor = isActive 
                ? "#3B82F6" // Biru jika aktif
                : isDark ? "#1E293B" : "#FFFFFF"; // Putih/Gelap jika tidak
              
              const borderColor = isActive ? "#3B82F6" : (isDark ? "#334155" : "#E2E8F0");
              
              // Warna Text & Icon
              const contentColor = isActive 
                ? "#FFFFFF" 
                : (isDark ? "#94A3B8" : "#64748B");

              return (
                <TouchableOpacity
                  key={filter.type}
                  onPress={() => setActiveFilter(filter.type)}
                  style={[
                    styles.filterButton,
                    { backgroundColor: bgColor, borderColor: borderColor }
                  ]}
                >
                  <Ionicons name={filter.iconName as any} size={16} color={contentColor} />
                  <Text style={[styles.filterText, { color: contentColor }]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* --- LIST NOTIFIKASI --- */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openModal(item)}>
            <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
              <View style={styles.cardRow}>
                <View style={[styles.iconWrapper, { backgroundColor: isDark ? "#334155" : "#EFF6FF" }]}>
                   {renderIcon(item.type, 24)}
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.title, { color: isDark ? "#E5E7EB" : "#0F172A" }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.message} numberOfLines={2}>
                    {item.excerpt ?? item.message}
                  </Text>
                </View>

                <Text style={styles.time}>{item.time ?? item.created_at}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#94A3B8' }}>
                Tidak ada notifikasi
            </Text>
        }
      />

      {/* MODAL DETAIL */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <View style={{alignItems: 'center', marginBottom: 15}}>
                 {selectedItem && renderIcon(selectedItem.type, 40)}
            </View>
            
            <Text style={[styles.modalTitle, { color: isDark ? "#E5E7EB" : "#0F172A" }]}>
              {selectedItem?.title}
            </Text>
            
            <Text style={[styles.modalMessage, { color: isDark ? "#CBD5E1" : "#334155" }]}>
              {selectedItem?.content}
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
  // HEADER
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
  },
  
  // FILTER
  filterScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // CARD
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: 6,
    marginTop: 2,
  },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContainer: { width: "100%", borderRadius: 20, padding: 24, paddingVertical: 30 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: 'center' },
  modalMessage: { fontSize: 15, marginBottom: 20, textAlign: 'center', lineHeight: 22 },
  modalTime: { fontSize: 12, textAlign: "center", marginBottom: 24 },
  closeButton: { backgroundColor: "#3B82F6", paddingVertical: 12, borderRadius: 12, alignItems: "center", width: '100%' },
});