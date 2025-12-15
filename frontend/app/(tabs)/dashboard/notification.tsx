import { getToken } from "@/services/auth";
import { getNotification } from "@/services/notification";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTERS = ["All", "Security", "Service", "System", "Warning"] as const;

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const [activeFilter, setActiveFilter] = useState("All");
  const [data, setData] = useState([])

  const fetchData = async () => {
    const token = await getToken();
    if (token) {
      try {
        const response = await getNotification(token, activeFilter.toLowerCase());
        console.log(response);
        
        const d = activeFilter === "All"
          ? response
          : response.filter((item: any) => item.type === activeFilter.toLowerCase())
        setData(d);
      } catch (error: any) {
        console.log(error.response.data);
      }
    } else {
      Alert.alert("Error", "Token tidak ditemukan");
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [activeFilter]);

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
        data={data}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            ]}
          >
            <View style={styles.cardRow}>
              <View style={styles.iconWrapper}><Ionicons name="construct-outline" size={22} color="#3B82F6" /> </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: isDark ? "#E5E7EB" : "#0F172A" }]}>
                  {item.title}
                </Text>
                <Text style={styles.message}>{item.excerpt}</Text>
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
