import { getToken } from "@/services/auth";
import { getVehicleDetail } from "@/services/vehicle";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";

export default function Vehicles() {
  const isDark = useColorScheme() === "dark";
  const [data, setData] = React.useState({
    name: "",
    brand: "",
    year: "",
    plate_number: "",
    odometer: 0,
    transmission: "",
    gas_type: "",
    machine_capacity: "",
  });

  const fetchData = async () => {
    const token = await getToken();
    if (token) {
      try {
        const response = await getVehicleDetail(token);
        setData(response);
      } catch (error: any) {
        console.log(error.response.data);
      }
    } else {
      Alert.alert("Error", "Token tidak ditemukan");
    }
  };

  useEffect (() => {
    fetchData();
  }, []);
  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0B0F1A" : "#F6F9FF" }
      ]}
    >

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Image
          source={require("../../../assets/images/vehicle-motor-15.jpg")}
          style={styles.motorImage}
          resizeMode="contain"
        />

        <View 
          style={[
            styles.overlay,
            { backgroundColor: isDark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.35)" }
          ]}
        />

        <View style={styles.headerInfo}>
          <Text style={[styles.motorTitle, { color: "#fff" }]}>
            {data.brand} {data.name}
          </Text>
          <Text style={[styles.motorSub, { color: "#E0E0E0" }]}>
            {data.plate_number} • {data.year}
          </Text>
        </View>
      </View>

      {/* STATUS */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusBox,
            { backgroundColor: isDark ? "#1A1F2E" : "#fff" }
          ]}
        >
          <View style={styles.dotActive} />
          <Text style={[styles.statusText, { color: isDark ? "#fff" : "#000" }]}>
            GPS Active
          </Text>
        </View>

        <View
          style={[
            styles.statusBox,
            { backgroundColor: isDark ? "#1A1F2E" : "#fff" }
          ]}
        >
          <View style={styles.dotActive} />
          <Text style={[styles.statusText, { color: isDark ? "#fff" : "#000" }]}>
            OBD Connect
          </Text>
        </View>
      </View>

      {/* ODOMETER */}
      <View
        style={[
          styles.odometerBox,
          { backgroundColor: isDark ? "#1A1F2E" : "#fff" }
        ]}
      >
        <Text
          style={[
            styles.odometerLabel,
            { color: isDark ? "#BFC7E0" : "#7B8AB8" }
          ]}
        >
          ODOMETER REALTIME
        </Text>

        <Text
          style={[
            styles.odometerValue,
            { color: isDark ? "#fff" : "#000" }
          ]}
        >
          {data.odometer} km
        </Text>

        <TouchableOpacity 
          style={[
            styles.serviceButton,
            { backgroundColor: isDark ? "#2B3B67" : "#DDEBFF" }
          ]}
          onPress={() => {router.push("/(tabs)/vehicles/service-schedule")}}
        >
          <Text
            style={[
              styles.serviceButtonText,
              { color: isDark ? "#AECBFF" : "#1E6EF5" }
            ]}
          >
            Lihat Jadwal Servis
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.hintText,
            { color: isDark ? "#B0B0B0" : "#666" }
          ]}
        >
          Klik untuk mencatat servis hari ini pada KM saat ini.
        </Text>
      </View>

      {/* DETAIL MESIN */}
      <View
        style={[
          styles.detailSection,
          { backgroundColor: isDark ? "#1A1F2E" : "#fff" }
        ]}
      >
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: isDark ? "#C2C8DA" : "#6B7A99" }]}>
            Transmisi
          </Text>
          <Text style={[styles.detailValue, { color: isDark ? "#fff" : "#000" }]}>
            {data.transmission?.toUpperCase()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: isDark ? "#C2C8DA" : "#6B7A99" }]}>
            Bahan Bakar
          </Text>
          <Text style={[styles.detailValue, { color: isDark ? "#fff" : "#000" }]}>
            {data.gas_type?.split(' ').map((word) => `${word[0]?.toUpperCase()}${word.slice(1)?.toLowerCase()}`).join(' ')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: isDark ? "#C2C8DA" : "#6B7A99" }]}>
            Kapasitas Mesin
          </Text>
          <Text style={[styles.detailValue, { color: isDark ? "#fff" : "#000" }]}>
            {data.machine_capacity} cc
          </Text>
        </View>
      </View>

      {/* BUTTON PERANGKAT */}
      <TouchableOpacity
        style={[
          styles.deviceButton,
          { backgroundColor: isDark ? "#2C6AE8" : "#559CFF" }
        ]}
        onPress={() => {router.push("/(tabs)/vehicles/connect-device")}}
      >
        <Text style={styles.deviceButtonText}>Informasi Perangkat Terhubung</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerContainer: {
    width: "100%",
    height: 220,
    backgroundColor: "#000",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    position: "relative",
  },
  motorImage: { width: "100%", height: "100%" },
  overlay: { position: "absolute", width: "100%", height: "100%" },

  headerInfo: { position: "absolute", bottom: 20, left: 20 },
  motorTitle: { fontSize: 22, fontWeight: "700" },
  motorSub: { fontSize: 14, marginTop: 4 },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  statusBox: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#3DDC84",
    marginRight: 8,
  },
  statusText: { fontWeight: "600" },

  odometerBox: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
  },
  odometerLabel: { textAlign: "center", fontWeight: "600" },
  odometerValue: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "700",
    marginVertical: 8,
  },
  serviceButton: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  serviceButtonText: { fontWeight: "600" },
  hintText: {
    marginTop: 10,
    fontSize: 12,
    textAlign: "center",
  },

  detailSection: {
    marginHorizontal: 20,
    marginTop: 25,
    padding: 15,
    borderRadius: 15,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  detailLabel: { fontSize: 14 },
  detailValue: { fontWeight: "700", fontSize: 14 },

  deviceButton: {
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 40,
  },
  deviceButtonText: { color: "#fff", fontWeight: "700" },
});
