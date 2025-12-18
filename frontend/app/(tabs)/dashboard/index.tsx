import { api } from "@/services/api";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import Svg, { Path } from "react-native-svg";

interface Region {
  latitude: number;
  longitude: number;
}

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region | null>(null); // kendaraan
  const [userLocation, setUserLocation] = useState<Region | null>(null); // user (opsional)
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [vehicleName, setVehicleName] = useState<string>("");
  const [telemetry, setTelemetry] = useState<any>(null);
  const [security, setSecurity] = useState<any>(null);
  const [geofence, setGeofence] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const [alarmActive, setAlarmActive] = useState(false);
  const [engineOn, setEngineOn] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);


  // ----------------- API FETCH -----------------
  const fetchLatestNotification = async () => {
    try {
      const res = await api.get("/notifications/latest?type=all&limit=1");
      if (res.data?.data?.length > 0) {
        const notif = res.data.data[0];
        setLatestNotification(notif);
        setHasUnread(notif.is_read === 0);
      } else {
        setHasUnread(false);
      }
    } catch (error) {
      console.log("FETCH LATEST NOTIFICATION ERROR:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setHasUnread(res.data.count > 0);
    } catch (err) {
      console.log("UNREAD COUNT ERROR:", err);
    }
  };

  const fetchVehicleStatus = async () => {
    try {
      const res = await api.get("/vehicles/status");
      const data = res.data.data;

      setVehicleName(data.vehicle.name);

      const lat = parseFloat(data.vehicle.latitude);
      const lng = parseFloat(data.vehicle.longitude);

      const newRegion = { latitude: lat, longitude: lng };
      setRegion(newRegion);

      fitMapToRelevantArea(newRegion);
      setTelemetry(data.telemetry);
      setSecurity(data.security);
      setAlarmActive(data.telemetry?.alarm_status ?? false);
      setEngineOn(data.telemetry?.engine_status ?? true);
      setGeofence(data?.geofence);
    } catch (error) {
      console.log("FETCH VEHICLE STATUS ERROR:", error);
    } finally {
      setLoading(false);
    }

  };

  // ----------------- FIT MAP TO AREA -----------------
  const fitMapToRelevantArea = (veh: Region | null = region) => {
    if (!mapRef.current) return;

    if (veh) {
      // Hitung delta agar radius 100m terlihat jelas
      const delta = 0.002; // ~220 meter (cukup untuk 100m radius)
      mapRef.current.animateToRegion(
        {
          latitude: (veh.latitude + geofence?.latitude) / 2,
          longitude: (veh.longitude + geofence?.longitude) / 2,
          latitudeDelta: Math.max(Math.abs(veh.latitude - geofence?.latitude) * 2, delta),
          longitudeDelta: Math.max(Math.abs(veh.longitude - geofence?.longitude) * 2, delta),
        },
        500
      );
    } else {
      mapRef.current.animateToRegion(
        { ...geofence, latitudeDelta: 0.002, longitudeDelta: 0.002 },
        500
      );
    }
  };

  // ----------------- LOCATION -----------------
  async function goToMyLocation() {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      const newLocation = { latitude: lat, longitude: lng };
      setUserLocation(newLocation);
      // Opsional: kamu bisa fokus ke lokasi ini, tapi utamakan rumah & kendaraan
    } catch (err) {
      alert("Tidak dapat mengambil lokasi");
    }
  }

  // ----------------- INITIAL -----------------
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Izin lokasi ditolak");
        return;
      }
      await Promise.all([fetchVehicleStatus(), fetchLatestNotification(), fetchUnreadCount()]);
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchVehicleStatus();
      fetchLatestNotification();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVehicleStatus();
      fetchLatestNotification();
    }, [])
  );

  // ----------------- TOGGLES -----------------
  const handleAlarmToggle = async () => {
    try {
      if (alarmActive) {
        await api.post("/vehicles/alarm/off");
        setAlarmActive(false);
        alert("Alarm dimatikan");
      } else {
        await api.post("/vehicles/alarm/on");
        setAlarmActive(true);
        alert("Alarm diaktifkan");
      }
      await fetchVehicleStatus();
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 403) alert("Aktifkan Anti-Theft Mode terlebih dahulu");
      else if (status === 404) alert("Trigger notifikasi belum diaktifkan");
      else alert("Gagal mengubah status alarm");
    }
  };

  const handleEngineToggle = async () => {
    try {
      if (engineOn) {
        await api.post("/vehicles/engine/off");
        setEngineOn(false);
        alert("Mesin dimatikan");
      } else {
        await api.post("/vehicles/engine/on");
        setEngineOn(true);
        alert("Mesin dinyalakan");
      }
      await fetchVehicleStatus();
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 403) alert("Aktifkan Anti-Theft Mode terlebih dahulu");
      else if (status === 404) alert("Trigger notifikasi belum diaktifkan");
      else alert("Gagal mengubah status mesin");
    }
  };

  // ----------------- RENDER -----------------
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? "#111" : "#F9FAFB" }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: isDark ? "#1f1f1f" : "#fff" }]}>
        <Svg width="46" height="48" viewBox="0 0 46 48" fill="none">
          <Path d="M6 24C6 26.3638 6.44618 28.7044 7.31308 30.8883C8.17997 33.0722 9.4506 35.0565 11.0524 36.7279C12.6542 38.3994 14.5558 39.7252 16.6487 40.6298C18.7416 41.5344 20.9847 42 23.25 42C25.5153 42 27.7584 41.5344 29.8513 40.6298C31.9442 39.7252 33.8458 38.3994 35.4476 36.7279C37.0494 35.0565 38.32 33.0722 39.1869 30.8883C40.0538 28.7044 40.5 26.3638 40.5 24C40.5 21.6362 40.0538 19.2956 39.1869 17.1117C38.32 14.9278 37.0494 12.9435 35.4476 11.2721C33.8458 9.60062 31.9442 8.27475 29.8513 7.37017C27.7584 6.46558 25.5153 6 23.25 6C20.9847 6 18.7416 6.46558 16.6487 7.37017C14.5558 8.27475 12.6542 9.60062 11.0524 11.2721C9.4506 12.9435 8.17997 14.9278 7.31308 17.1117C6.44618 19.2956 6 21.6362 6 24Z" stroke="#2F80ED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M13.6667 24C13.6667 26.6522 14.6763 29.1957 16.4736 31.0711M13.6667 24C13.6667 21.3478 14.6763 18.8043 16.4736 16.9289M13.6667 24H6M16.4736 31.0711C18.2708 32.9464 20.7083 34 23.25 34M16.4736 31.0711L11.0523 36.728M23.25 34C25.7917 34 28.2292 32.9464 30.0264 31.0711M23.25 34V42M30.0264 31.0711C31.8237 29.1957 32.8333 26.6522 32.8333 24M30.0264 31.0711L35.4477 36.728M32.8333 24C32.8333 21.3478 31.8237 18.8043 30.0264 16.9289M32.8333 24H40.5M30.0264 16.9289C28.2292 15.0536 25.7917 14 23.25 14M30.0264 16.9289L35.4477 11.272M23.25 14C20.7083 14 18.2708 15.0536 16.4736 16.9289M23.25 14V6M16.4736 16.9289L11.0523 11.272" stroke="#2F80ED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>

        <View style={{ flex: 1, marginLeft: 20 }}>
          <Text style={[styles.headerSubtitle, { color: isDark ? "#d1d5db" : "#6B7280" }]}>Kendaraan Anda</Text>
          <Text style={[styles.headerTitle, { color: isDark ? "#fff" : "#111827" }]}>{vehicleName || "-"}</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerIcon, { backgroundColor: isDark ? "#374151" : "#E5E7EB" }]}
          onPress={() => router.push("/(tabs)/dashboard/notification")}
        >
          <Ionicons name="notifications-outline" size={22} color={isDark ? "#fff" : "#1F2937"} />
          {hasUnread && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </View>

      {/* --- NATIVE MAPVIEW DENGAN RADIUS --- */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: geofence?.latitude,
            longitude: geofence?.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          zoomEnabled={true}
          scrollEnabled={true}
        >
          {/* Marker Kendaraan — tetap ditampilkan */}
          {region && (
            <Marker
              coordinate={region}
              title="Kendaraan"
              pinColor="#4285F4"
            />
          )}

          {/* ❌ HAPUS MARKER RUMAH — TIDAK DITAMPILKAN */}

          {/* ✅ TETAP TAMPILKAN LINGKARAN RADIUS 100m */}
          {
            security?.geofence_enabled && region && (
              <Circle
                center={geofence}
                radius={100}
                fillColor="rgba(76, 175, 80, 0.2)"
                strokeColor="#4CAF50"
                strokeWidth={2}
              />
            )
          }
        </MapView>

        <TouchableOpacity
          onPress={goToMyLocation}
          style={[styles.myLocationBtn, { backgroundColor: isDark ? "#1e293b" : "#fff" }]}
        >
          <Ionicons name="locate" size={22} color={isDark ? "#fff" : "#1e293b"} />
        </TouchableOpacity>

        {/* Tag Lokasi */}
        {region && (
          <View style={[styles.locationTag, { backgroundColor: isDark ? "#0f172a" : "#1E293B" }]}>
            <Text style={{ color: "#fff", fontSize: 12 }}>
              Kendaraan: {region.latitude.toFixed(5)}, {region.longitude.toFixed(5)}
            </Text>
          </View>
        )}
        {
          security?.geofence_enabled &&(
            <View style={[styles.locationTag, { backgroundColor: isDark ? "#0f172a" : "#FF9800", top: 50 }]}>
              <Text style={{ color: "#fff", fontSize: 12 }}>
                Rumah: {geofence?.latitude.toFixed(5)}, {geofence?.longitude.toFixed(5)}
              </Text>
            </View>
          )
        }
      </View>

      {/* ACTIONS, STATUS, DLL — SAMA SEPERTI SEBELUMNYA */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: alarmActive ? "#22C55E" : "#FF4D4F" }]} onPress={handleAlarmToggle}>
          <Ionicons name={alarmActive ? "notifications" : "notifications-off-outline"} size={25} color="#fff" />
          <Text style={styles.actionText}>{alarmActive ? "Matikan Alarm" : "Aktifkan Alarm"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: engineOn ? "#1F2937" : "#F97316" }]} onPress={handleEngineToggle}>
          <Ionicons name={engineOn ? "power-outline" : "flash-outline"} size={25} color="#fff" />
          <Text style={styles.actionText}>{engineOn ? "Matikan Mesin" : "Nyalakan Mesin"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: isDark ? "#fff" : "#111827" }]}>Status Kendaraan</Text>
      <View style={styles.statusGrid}>
        {renderStatusCard("ODOMETER", telemetry ? `${telemetry.odometer} km` : "-", isDark, <MaterialCommunityIcons name="counter" size={20} color="#3B82F6" />)}
        {renderStatusCard("ENGINE", telemetry ? `${telemetry.rpm} rpm` : "-", isDark, <FontAwesome5 name="tachometer-alt" size={20} color="#3B82F6" />)}
        {renderStatusCard("AKI", telemetry ? `${telemetry.battery} v` : "-", isDark, <Ionicons name="battery-half" size={20} color="#F59E0B" />)}
        {renderStatusCard("DIAGNOSA", "Normal", isDark, <MaterialCommunityIcons name="heart-pulse" size={20} color="#10B981" />, "#10B981")}
      </View>

      <View style={[styles.fuelCard, { backgroundColor: isDark ? "#1f1f1f" : "#fff" }]}>
        <MaterialCommunityIcons name="fuel" size={24} color={isDark ? "#34D399" : "#10B981"} />
        <View style={styles.fuelContent}>
          <Text style={[styles.fuelLabel, { color: isDark ? "#d1d5db" : "#6B7280" }]}>Bensin</Text>
          <Text style={[styles.fuelValue, { color: isDark ? "#fff" : "#111" }]}>{telemetry ? `${telemetry.fuel}%` : "-"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.fuelValue, { textAlign: "right", color: isDark ? "#34D399" : "#10B981" }]}>Good</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: isDark ? "#fff" : "#111827" }]}>Terkini</Text>
      <View style={[styles.recentCard, { backgroundColor: isDark ? "#1f1f1f" : "#fff" }]}>
        <View style={[styles.recentIndicator, { backgroundColor: latestNotification?.is_read ? "#9CA3AF" : "#EF4444" }]} />
        <View>
          <Text style={[styles.recentTitle, { color: isDark ? "#fff" : "#111827" }]}>{latestNotification?.title || "-"}</Text>
          <Text style={[styles.recentSubtitle, { color: isDark ? "#9ca3af" : "#6B7280" }]}>{latestNotification?.message || "Tidak ada notifikasi terbaru"}</Text>
        </View>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function renderStatusCard(label: string, value: string | number, isDark: boolean, icon: React.ReactNode, valueColor: string = "#111827") {
  return (
    <View style={[styles.statusCard, { backgroundColor: isDark ? "#1f1f1f" : "#fff" }]}>
      {icon}
      <Text style={[styles.statusLabel, { color: isDark ? "#d1d5db" : "#6B7280" }]}>{label}</Text>
      <Text style={[styles.statusValue, { color: isDark ? "#fff" : valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingLeft: 20, paddingRight: 20, backgroundColor: "#F9FAFB" },
  myLocationBtn: {
    position: "absolute",
    bottom: 15,
    right: 15,
    width: 45,
    height: 45,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 15,
    marginHorizontal: -20,
    backgroundColor: "#FFF",
  },
  headerSubtitle: { fontSize: 13, color: "#6B7280" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    width: "100%",
    height: 230,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
  },
  locationTag: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#1E293B",
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    zIndex: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 15,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  actionText: {
    color: "#fff",
    marginTop: 8,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
    marginTop: 5,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 5,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 3,
  },
  unreadDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  fuelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 15,
  },
  fuelContent: {
    marginLeft: 12,
  },
  fuelLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  fuelValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  recentIndicator: {
    width: 10,
    height: 10,
    backgroundColor: "#EF4444",
    borderRadius: 50,
    marginRight: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  recentSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },
});