import { getToken } from "@/services/auth";
import { getServiceHistories } from "@/services/vehicle";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";

import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTERS = ["Semua", "Oli Mesin", "Servis Rutin", "Oli Gear", "Servis Lainnya"] as const;

interface ServiceItem {
  id: string,
  title: string,
  price: number,
  km: number,
  date: string,
  icon: string,
  category: string,
  note: string,
}

function formatRupiah(angka: number, withSymbol = true) {
  console.log(angka);
  
  // Pastikan input adalah angka
  if (typeof angka !== 'number') {
    angka = parseFloat(angka);
    if (isNaN(angka)) return withSymbol ? 'Rp0' : '0';
  }

  // Format angka dengan pemisah ribuan
  const formatted = angka.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  // Tambahkan simbol "Rp" jika diminta
  return withSymbol ? `Rp${formatted}` : formatted;
}

export default function ServiceHistory() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [activeFilter, setActiveFilter] = useState("Semua");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState([]);
  
  const fetchData = async () => {
    const token = await getToken();
    if (token) {
      const histories = await getServiceHistories(token);
      const d = activeFilter === "Semua"
      ? histories
      : histories?.filter((item: ServiceItem) => item.category === activeFilter)
      setData(d);
      
    }
  };

  const openDetail = (item: ServiceItem) => {
    setSelectedService(item);
    setModalVisible(true);
  };

  const closeDetail = () => {
    setModalVisible(false);
    setSelectedService(null);
  };
  
  useEffect(() => {
    fetchData();
  }, [activeFilter])

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F1F5F9" }}>
      {/* STATUS BAR */}

      {/* HEADER */}
      <View
        style={{
          backgroundColor: isDark ? "#000000ff" : "#FFFFFF",
          paddingTop: insets.top,
          marginTop: 0,
          paddingBottom: 14,
        }}
      >
        <Text
          style={[
            styles.header,
            { color: isDark ? "#F8FAFC" : "#0F172A" },
          ]}
        >
          Riwayat Servis
        </Text>

        {/* FILTER TABS */}
        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      activeFilter === filter
                        ? isDark
                          ? "#51A2FF"        // aktif dark mode
                          : "#F1F5F9"        // aktif light mode
                        : isDark
                          ? "#1E293B"        // tidak aktif dark mode
                          : "#FFFFFF",       // tidak aktif light mode
                    borderColor:
                      activeFilter === filter
                        ? isDark
                          ? "#334155"        // border aktif dark
                          : "#CBD5E1"        // border aktif light
                        : "transparent",
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        activeFilter === filter
                          ? isDark
                            ? "#FFFFFF"        // teks aktif dark
                            : "#000000"        // teks aktif light
                          : isDark
                            ? "#ffffffff"      // teks tidak aktif dark
                            : "#64748B",       // teks tidak aktif light
                    },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>

            ))}
          </ScrollView>
        </View>
      </View>

      {/* LIST */}
      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? "#94A3B8" : "#64748B" }]}>
            Data tidak ditemukan
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
          keyExtractor={(item: ServiceItem) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openDetail(item)}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
                ]}
              >
                <View style={styles.cardRow}>
                  {/* ICON */}
                  <View style={styles.iconContainer}>
                    {item.icon === "oil" ? (
                      <MaterialCommunityIcons name="oil" size={22} color="#51A2FF" />
                    ) : item.icon === "tools" ? (
                      <Ionicons name="construct-outline" size={22} color="#51A2FF" />
                    ) : (
                      <Ionicons name="cog-outline" size={22} color="#51A2FF" />
                    )}
                  </View>

                  {/* TITLE + PRICE */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: isDark ? "#E2E8F0" : "#0F172A" },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.price}>Rp.{item.price}</Text>
                  </View>

                  {/* KM + DATE */}
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[
                        styles.km,
                        { color: isDark ? "#E2E8F0" : "#0F172A" },
                      ]}
                    >
                      {item.km} KM
                    </Text>
                    <Text style={styles.date}>{item.date}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={styles.footerText}>Menampilkan 3 bulan terakhir</Text>

      {/* MODAL DETAIL */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={closeDetail}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDark ? "#F1F5F9" : "#0F172A" },
              ]}
            >
              DETAIL RIWAYAT SERVIS
            </Text>

            {selectedService && (
              <>
                <View
                  style={[
                    styles.detailGroup,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      borderColor: isDark ? "#1E293B" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.label,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    Jenis Service
                  </Text>
                  <Text
                    style={[
                      styles.value,
                      { color: isDark ? "#FFFFFF" : "#000000" },
                    ]}
                  >
                    {selectedService.title}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailGroup,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      borderColor: isDark ? "#1E293B" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.label, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                    Tanggal Service
                  </Text>
                  <Text style={[styles.value, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                    {selectedService.date}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailGroup,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      borderColor: isDark ? "#1E293B" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.label, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                    Kilometer saat Service
                  </Text>
                  <Text style={[styles.value, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                    {selectedService.km} Km
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailGroup,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      borderColor: isDark ? "#1E293B" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.label, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                    Keterangan
                  </Text>
                  <Text
                    style={[
                      styles.valueBox,
                      {
                        color: isDark ? "#E2E8F0" : "#1E293B",
                        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                        borderColor: isDark ? "#334155" : "#CBD5E1",
                      },
                    ]}
                  >
                    {selectedService.note}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailGroup,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      borderColor: isDark ? "#1E293B" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.label, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                    Total Biaya Servis
                  </Text>
                  <Text style={[styles.value, { color: isDark ? "#FFFFFF" : "#000000" }]}>
                    {formatRupiah(selectedService.price)}
                  </Text>
                </View>
              </>
            )}


            <TouchableOpacity style={styles.closeButton} onPress={closeDetail}>
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 16,
  },

  filterWrapper: {
    marginTop: 16,
    paddingHorizontal: 16,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
  },

  filterActive: {
    backgroundColor: "#51A2FF",
  },

  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },

  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: "100%",
    elevation: 10,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  detailGroup: {
  padding: 14,
  borderWidth: 1,
  borderRadius: 12,
  marginBottom: 12,
},

label: {
  fontSize: 13,
  marginBottom: 4,
  fontWeight: "500",
},

value: {
  fontSize: 15,
  fontWeight: "600",
},

valueBox: {
  marginTop: 6,
  padding: 12,
  fontSize: 14,
  borderWidth: 1,
  borderRadius: 10,
},


  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
  },

  closeButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },

  card: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    backgroundColor: "#E5F1FF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  price: {
    fontSize: 12,
    marginTop: 2,
    color: "#64748B",
  },

  km: {
    fontSize: 14,
    fontWeight: "700",
  },

  date: {
    fontSize: 12,
    marginTop: 2,
    color: "#94A3B8",
  },

  footerText: {
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 12,
    color: "#94A3B8",
  },
});
