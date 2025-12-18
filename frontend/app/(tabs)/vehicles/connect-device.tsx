import { api } from "@/services/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React from "react";
import {
  Alert,
  BackHandler, // Import BackHandler
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ConnectDevice() {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  const [pairing, setPairing] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [loadingStatus, setLoadingStatus] = React.useState(true);

  // --- LOGIC TOMBOL BACK ---
  const handleBack = () => {
    // 1. Jika sudah connect, langsung boleh keluar
    if (connected) {
      router.replace('/(tabs)/vehicles');
      return true;
    }

    // 2. Jika belum connect, tampilkan Alert Peringatan
    Alert.alert(
      "Perangkat Belum Terhubung",
      "Agar fitur pelacakan berfungsi, Anda wajib menghubungkan perangkat. Yakin ingin keluar?",
      [
        {
          text: "Hubungkan Dulu",
          style: "cancel",
          onPress: () => {}, // Tetap di halaman ini
        },
        {
          text: "Keluar Saja",
          style: "destructive",
          // Paksa keluar walaupun belum connect
          onPress: () => router.replace('/(tabs)/accounts'), 
        },
      ]
    );
    return true; // Mencegah aksi default back (Android)
  };

  // --- HANDLE BACK BUTTON FISIK (ANDROID) ---
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return handleBack();
      };

      // Pasang listener
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Copot listener saat pindah halaman
      return () => subscription.remove();
    }, [connected]) // Re-run jika status connected berubah
  );

  const checkDeviceStatus = async () => {
    try {
      const res = await api.post("/devices/status");
      console.log("STATUS CHECK:", res.data);
      const isConnected = Boolean(res.data?.device_connected);
      setConnected(isConnected);
    } catch (error) {
      console.log("STATUS ERROR:", error);
      setConnected(false);
    } finally {
      setLoadingStatus(false);
    }
  };

  const hasCheckedRef = React.useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      if (hasCheckedRef.current) return;
      hasCheckedRef.current = true;
      setLoadingStatus(true);
      checkDeviceStatus();
    }, [])
  );

  const handlePingDevice = async () => {
    if (connected) {
      Alert.alert("Info", "Perangkat sudah terhubung");
      return;
    }

    try {
      setPairing(true);
      const serialNumber = `SR-${Date.now()}`;

      await api.post("/devices/ping", {
        device_serial_number: serialNumber,
      });

      setConnected(true);
      Alert.alert("Berhasil", "Perangkat berhasil terhubung", [
        { text: "Lanjut ke Dashboard", onPress: () => router.replace("/dashboard") }
      ]);
      
    } catch (error: any) {
      Alert.alert(
        "Gagal",
        error.response?.data?.message || "Gagal menghubungkan perangkat"
      );
    } finally {
      setPairing(false);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0B0F1A" : "#F6F9FF" },
      ]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12 },
        ]}
      >
        {/* Tombol Back Custom */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={isDark ? "#E5E7EB" : "#334155"}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}>
          Hubungkan Perangkat
        </Text>
      </View>

      {/* INFO */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: isDark ? "#1A1F2E" : "#FFFFFF" },
        ]}
      >
        <MaterialCommunityIcons
          name="devices"
          size={36}
          color={isDark ? "#AECBFF" : "#2563EB"}
        />
        <Text style={[styles.infoTitle, { color: isDark ? "#fff" : "#000" }]}>
          Sambungkan Perangkat Kendaraan
        </Text>
        <Text style={styles.infoText}>
          Hubungkan perangkat GPS / OBD agar Anda dapat memantau lokasi, status
          mesin, dan riwayat servis secara realtime.
        </Text>
      </View>

      {/* DEVICE STATUS */}
      <View
        style={[
          styles.statusCard,
          { backgroundColor: isDark ? "#1A1F2E" : "#FFFFFF" },
        ]}
      >
        <View style={styles.statusRow}>
          <Ionicons name="location-outline" size={22} color="#3DDC84" />
          <Text style={[styles.statusLabel, { color: isDark ? "#fff" : "#000" }]}>
            GPS Device
          </Text>
          <Text style={connected ? styles.statusConnected : styles.statusDisconnected}>
            {connected ? "Terhubung" : "Belum Terhubung"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statusRow}>
          <MaterialCommunityIcons name="engine-outline" size={22} color="#3DDC84" />
          <Text style={[styles.statusLabel, { color: isDark ? "#fff" : "#000" }]}>
            OBD Device
          </Text>
          <Text style={connected ? styles.statusConnected : styles.statusDisconnected}>
            {connected ? "Terhubung" : "Belum Terhubung"}
          </Text>
        </View>
      </View>

      {/* ACTION */}
      <TouchableOpacity
        onPress={handlePingDevice}
        disabled={pairing || connected || loadingStatus}
        style={[
          styles.primaryButton,
          {
            backgroundColor:
              connected
                ? "#22C55E"
                : pairing
                  ? "#94A3B8"
                  : isDark
                    ? "#2C6AE8"
                    : "#559CFF",
          },
        ]}
      >
        <Ionicons
          name={connected ? "checkmark-circle-outline" : "bluetooth-outline"}
          size={20}
          color="#fff"
        />
        <Text style={styles.primaryButtonText}>
          {loadingStatus
            ? "Memeriksa perangkat..."
            : connected
              ? "Perangkat Sudah Terhubung"
              : pairing
                ? "Menghubungkan..."
                : "Cari & Hubungkan Perangkat"}
        </Text>
      </TouchableOpacity>

      {/* GUIDE */}
      <View
        style={[
          styles.guideCard,
          { backgroundColor: isDark ? "#1A1F2E" : "#FFFFFF" },
        ]}
      >
        <Text style={[styles.guideTitle, { color: isDark ? "#fff" : "#000" }]}>
          Cara Menghubungkan
        </Text>
        <Text style={styles.guideItem}>
          1. Pastikan perangkat kendaraan dalam kondisi aktif.
        </Text>
        <Text style={styles.guideItem}>
          2. Aktifkan Bluetooth di ponsel Anda.
        </Text>
        <Text style={styles.guideItem}>
          3. Tekan tombol “Cari & Hubungkan Perangkat”.
        </Text>
        <Text style={styles.guideItem}>
          4. Pilih perangkat yang tersedia.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusConnected: {
    fontSize: 12,
    color: "#22C55E",
    fontWeight: "600",
  },
  backButton: { marginRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  infoCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 8,
  },
  statusCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusLabel: {
    flex: 1,
    marginLeft: 10,
    fontWeight: "600",
  },
  statusDisconnected: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 12,
    opacity: 0.3,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 25,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  guideCard: {
    marginHorizontal: 20,
    marginTop: 25,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
  },
  guideTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },
  guideItem: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 6,
  },
});