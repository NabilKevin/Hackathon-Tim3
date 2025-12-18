import { api } from "@/services/api";
import { Fontisto, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { TouchableOpacity, useColorScheme } from "react-native";

import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";


export default function SecurityScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [security, setSecurity] = useState({
    anti_theft_enabled: false,
    geofence_enabled: false,
    geofence_radius: 500,
    alarm_enabled: false,
    remote_engine_cut: false,
    engine_on: false,
    vibration: false,
    wheel_move: false,
  });

  const [loading, setLoading] = useState(true);

  const fetchSecurity = async () => {
    try {
      const res = await api.get("/vehicles/security");
      const data = res.data.data;

      // convert 0/1 ke boolean
      setSecurity({
        anti_theft_enabled: !!data.anti_theft_enabled,
        geofence_enabled: !!data.geofence_enabled,
        geofence_radius: data.geofence_radius,
        alarm_enabled: !!data.alarm_enabled,
        remote_engine_cut: !!data.remote_engine_cut,
        engine_on: !!data.engine_on,
        vibration: !!data.vibration,
        wheel_move: !!data.wheel_move,
      });
    } catch (e) {
      console.log("Gagal load security", e);
    } finally {
      setLoading(false);
    }
  };

  // ----------------- FOCUS EFFECT -----------------
  useFocusEffect(
    useCallback(() => {
      fetchSecurity();
    }, [])
  );

  const toggleSecurity = async (field: keyof typeof security, value: boolean) => {
    try {
      let newState = { ...security };

      // Anti-Theft dimatikan -> matikan semua fitur terkait
      if (field === "anti_theft_enabled") {
        newState.anti_theft_enabled = value;

        if (!value) {
          newState.remote_engine_cut = false;
          newState.alarm_enabled = false;
          newState.engine_on = false;
          newState.vibration = false;
          newState.wheel_move = false;
        }
      } else {
        // Cek jika Anti-Theft mati, jangan izinkan menyalakan fitur lain
        if (!security.anti_theft_enabled && value === true) {
          console.log("Fitur keamanan hanya bisa dinyalakan jika Anti-Theft aktif");
          return;
        }
        (newState as any)[field] = value;
      }

      // Optimistic UI
      setSecurity(newState);

      // Kirim ke API
      if (field === "anti_theft_enabled") {
        // Jika Anti-Theft dimatikan, update semua field ke API
        if (!value) {
          await Promise.all([
            api.post("/vehicles/security/toggle", { anti_theft_enabled: false }),
            api.post("/vehicles/security/toggle", { remote_engine_cut: false }),
            api.post("/vehicles/security/toggle", { alarm_enabled: false }),
            api.post("/vehicles/security/toggle", { engine_on: false }),
            api.post("/vehicles/security/toggle", { vibration: false }),
            api.post("/vehicles/security/toggle", { wheel_move: false }),
          ]);
          return;
        }
      }

      // Update single feature biasa
      await api.post("/vehicles/security/toggle", { [field]: value });
    } catch (e) {
      console.log("Gagal update", field);

      // rollback UI
      fetchSecurity();
    }
  };

  const theme = {
    background: isDark ? "#0C0F14" : "#F6F8FC",
    card: isDark ? "#1A1D24" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#000000",
    subtext: isDark ? "#A8B0C0" : "#6B7A99",
    border: isDark ? "#2A2D35" : "#E6E8EC",
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: isDark ? "#11141A" : "#0F1A2E" }]}>
        <Text style={[styles.headerTitle, { color: "#fff" }]}>Sistem Keamanan</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>● Sistem Aktif & Aman</Text>
        </View>
      </View>

      {/* Anti Theft */}
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: "#000" }]}>
        <View style={styles.cardLeft}>
          <Fontisto style={{ marginRight: 15 }} name="locked" size={28} color="#4DA1FF" />
          <View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Anti-Theft Mode</Text>
            <Text style={[styles.cardSubtitle, { color: theme.subtext }]}>
              Alarm otomatis saat disentuh
            </Text>
          </View>
          <Switch
            style={{ marginLeft: 50 }}
            value={security.anti_theft_enabled}
            onValueChange={(v) => toggleSecurity("anti_theft_enabled", v)}
            trackColor={{ true: "#00C4C4" }}
          />
        </View>
      </View>

      {/* Geofencing */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardLeft}>
          <MaterialCommunityIcons style={{ marginRight: 15 }} name="map-marker-radius" size={28} color="#4DA1FF" />
          <View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Geofencing</Text>
            <Text style={[styles.cardSubtitle, { color: theme.subtext }]}>
              Alert jika keluar area
            </Text>
          </View>
          <Switch
            style={{ marginLeft: 100 }}
            value={security.geofence_enabled}
            onValueChange={(v) => toggleSecurity("geofence_enabled", v)}
            trackColor={{ true: "#00C4C4" }}
          />
        </View>
        <View style={{ height: 10 }} />
        <View style={styles.sliderBar}>
          <View style={styles.sliderFill} />
        </View>
        <Text style={[styles.radiusText, { color: theme?.subtext }]}>
          Radius: {security?.geofence_radius ?? 0}m
        </Text>
      </View>

      {/* Notification Trigger */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>NOTIFIKASI TRIGGER</Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <TriggerItem label="Mesin Menyala" value={security.engine_on}
          onToggle={() => toggleSecurity("engine_on", !security.engine_on)} theme={theme} />
        <TriggerItem label="Getaran / Guncangan" value={security.vibration}
          onToggle={() => toggleSecurity("vibration", !security.vibration)} theme={theme} />
        <TriggerItem label="Pergerakan Roda" value={security.wheel_move}
          onToggle={() => toggleSecurity("wheel_move", !security.wheel_move)} theme={theme} />
      </View>

      {/* Vehicle Control */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Keamanan Kendaraan</Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <ControlItem
          label="Matikan Mesin"
          value={security.remote_engine_cut}
          onToggle={(v: boolean) => toggleSecurity("remote_engine_cut", v ?? false)}
          theme={theme}
          icon="engine-off"
          iconColor="#FF4D4D"
          iconBgColor="#FF4D4D20"
        />
        <ControlItem
          label="Alarm Aktif"
          value={security.alarm_enabled}
          onToggle={(v: boolean) => toggleSecurity("alarm_enabled", v ?? false)}
          theme={theme}
          icon="alarm-light"
          iconColor="#4DA1FF"
          iconBgColor="#4DA1FF20"
        />
      </View>
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

/* --- Subcomponents --- */
const TriggerItem = ({ label, value, onToggle, theme }: any) => (
  <TouchableOpacity onPress={onToggle} style={styles.triggerRow}>
    <Text style={[styles.triggerLabel, { color: theme.text }]}>{label}</Text>
    <View style={[styles.checkbox, value && styles.checkboxChecked]}>
      {value && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
    </View>
  </TouchableOpacity>
);

const ControlItem = ({ label, value, onToggle, theme, icon, iconColor, iconBgColor }: any) => (
  <View style={styles.controlRow}>
    <View style={styles.cardLeft}>
      <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.triggerLabel, { color: theme.text }]}>{label}</Text>
    </View>
    <Switch value={value} onValueChange={onToggle} trackColor={{ true: "#00C4C4" }} />
  </View>
);






/* --- Styles --- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  statusPill: {
    marginTop: 15,
    backgroundColor: "#37C97E33",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    justifyContent: "center",
    alignItems: "center",
    color: "#37C97E",
    fontSize: 12,
    fontWeight: "600",
  },

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },


  card: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 18,
    elevation: 2,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
    tintColor: "#4DA1FF",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  sliderBar: {
    height: 6,
    backgroundColor: "#E0E8F5",
    borderRadius: 10,
    marginTop: 10,
  },
  sliderFill: {
    width: "60%",
    height: "100%",
    backgroundColor: "#4DA1FF",
    borderRadius: 10,
  },
  radiusText: {
    marginTop: 6,
    fontSize: 12,
  },

  sectionTitle: {
    marginTop: 30,
    marginLeft: 20,
    fontSize: 13,
    fontWeight: "700",
  },

  triggerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  triggerLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#B7C4D6",
    borderRadius: 6,
  },
  checkboxChecked: {
    backgroundColor: "#4DA1FF",
    borderColor: "#4DA1FF",
  },

  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
});
