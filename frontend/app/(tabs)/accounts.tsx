import { getUser, logout } from "@/services/auth";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert, Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

export default function Account() {
  const isDark = useColorScheme() === "dark";
  const [user, setUser] = useState({
    username: "",
    email: "",
    image: "",
  });

  const fetchData = async () => {
    const data = await getUser();
    console.log(data);
    
    setUser(data);
  }

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0B0F1A" : "#F4F7FC" },
      ]}
    >
      {/* PROFILE HEADER */}
      <View style={styles.header}>
        <Image
          source={user?.image ? { uri: user.image } : require("../../assets/images/profil-default.jpg")}
          style={styles.avatar}
        />

        <Text style={[styles.name, { color: isDark ? "#fff" : "#1F2D5A" }]}>
          {user?.username}
        </Text>
        <Text style={[styles.email, { color: isDark ? "#9DA5C5" : "#6B7280" }]}>
          {user?.email}
        </Text>

        <TouchableOpacity
          style={[
            styles.editButton,
            { backgroundColor: isDark ? "#000" : "#fff" },
          ]} onPress={() => router.push("../edit-profile")}
        >
          <Text
            style={[
              styles.editButtonText,
              { color: isDark ? "#fff" : "#51A2FF" },
            ]}
          >
            Edit Profil
          </Text>
        </TouchableOpacity>
      </View>

      {/* MENU GROUP 1 */}
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? "#121829" : "#FFFFFF" },
        ]}
      >
        <MenuItem
          label="Ubah Data Kendaraan"
          icon={<MaterialIcons name="settings" size={22} color={isDark ? "#fff" : "#1E293B"} />}
          isDark={isDark}
          onPress={() => router.push("../edit-vehicle")}
        />
      </View>

      {/* MENU GROUP 2 */}
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? "#121829" : "#FFFFFF" },
        ]}
      >
        <MenuItem
          label="Bantuan & Support"
          icon={<Feather name="help-circle" size={22} color={isDark ? "#fff" : "#1E293B"} />}
          isDark={isDark}
          onPress={() => router.push("../help-support")}
        />
        <MenuItem
          label="Tentang SinyalRoda"
          icon={<Ionicons name="information-circle-outline" size={22} color={isDark ? "#fff" : "#1E293B"} />}
          isDark={isDark}
          onPress={() => router.push("../about")}
        />
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity
  style={[
    styles.logoutButton,
    {
      backgroundColor: isDark ? "#4C1D1D" : "#FFE5E5",
      shadowColor: isDark ? "#000" : "#FF6B6B",
    },
  ]}
  onPress={async () => {
    const result = await logout();
    if (result) {
      router.replace("../login"); // pakai replace agar tidak bisa back
    } else {
      Alert.alert("Error", "Gagal logout, coba lagi");
    }
  }}
>
  <Text
    style={[
      styles.logoutText,
      { color: isDark ? "#FFB4B4" : "#E53935" },
    ]}
  >
    Keluar / Logout
  </Text>
</TouchableOpacity>

      {/* VERSION */}
      <Text
        style={[
          styles.version,
          { color: isDark ? "#8B93AF" : "#A0AEC0" },
        ]}
      >
        Version 1.0.2
      </Text>
    </ScrollView>
  );
}

/* COMPONENT MENU ITEM */
type MenuItemProps = {
  label: string;
  rightText?: string;
  icon: React.ReactNode;
  isDark: boolean;
  onPress?: () => void;
};

export const MenuItem = ({ label, rightText, icon, isDark, onPress }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    {icon}

    <Text
      style={[
        styles.menuLabel,
        { color: isDark ? "#E2E6F3" : "#1E293B", marginLeft: 12 },
      ]}
    >
      {label}
    </Text>

    <View style={{ flex: 1 }} />

    {rightText && (
      <Text
        style={[
          styles.rightText,
          { color: isDark ? "#AAB2D0" : "#6B7280" },
        ]}
      >
        {rightText}
      </Text>
    )}

    <Ionicons
      name="chevron-forward"
      size={20}
      color={isDark ? "#AAB2D0" : "#9CA3AF"}
      style={{ marginLeft: 8 }}
    />
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },

  avatar: {
    width: 85,
    height: 85,
    borderRadius: 50,
    marginBottom: 12,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
  },

  email: {
    fontSize: 14,
    marginBottom: 14,
  },

  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  editButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },

  card: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
  },

  rightText: {
    fontSize: 14,
    marginRight: 6,
  },

  logoutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },

  logoutText: {
    fontWeight: "700",
    fontSize: 16,
  },

  version: {
    textAlign: "center",
    marginTop: 25,
    marginBottom: 20,
    fontSize: 12,
  },
});
