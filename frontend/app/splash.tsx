import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, useColorScheme, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function Splash() {
  const theme = useColorScheme();
  const isDark = theme === "dark";

  // Animasi tiga dot
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Loop animasi dot
    Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Cek token login
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // Ada token, langsung ke home
          router.replace("/(tabs)/dashboard");
        } else {
          // Tidak ada token, ke login
          router.replace("/login");
        }
      } catch (err) {
        console.log("Error cek token:", err);
        router.replace("/login");
      }
    };

    // Delay sedikit untuk splash animation
    const timer = setTimeout(() => {
      checkLogin();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0d0d0d" : "#FFFFFF" },
      ]}
    >
      {/* SVG Logo */}
      <Svg width="103" height="102" viewBox="0 0 103 102" fill="none">
        <Path
          d="M12.875 51C12.875 56.0231 13.8741 60.9969 15.8152 65.6376C17.7562 70.2783 20.6013 74.495 24.188 78.0468C27.7747 81.5987 32.0327 84.4162 36.7189 86.3384C41.4051 88.2606 46.4277 89.25 51.5 89.25C56.5723 89.25 61.5949 88.2606 66.2811 86.3384C70.9673 84.4162 75.2253 81.5987 78.812 78.0468C82.3987 74.495 85.2438 70.2783 87.1848 65.6376C89.1259 60.9969 90.125 56.0231 90.125 51C90.125 45.9769 89.1259 41.0031 87.1848 36.3624C85.2438 31.7217 82.3987 27.505 78.812 23.9532C75.2253 20.4013 70.9673 17.5839 66.2811 15.6616C61.5949 13.7394 56.5723 12.75 51.5 12.75C46.4277 12.75 41.4051 13.7394 36.7189 15.6616C32.0327 17.5839 27.7747 20.4013 24.188 23.9532C20.6013 27.505 17.7562 31.7217 15.8152 36.3624C13.8741 41.0031 12.875 45.9769 12.875 51Z"
          stroke={isDark ? "#6CA8FF" : "#2F80ED"}
          strokeWidth="1.5"
        />
        <Path
          d="M30.0417 51C30.0417 56.6359 32.3024 62.0409 36.3267 66.026M30.0417 51C30.0417 45.3641 32.3024 39.9591 36.3267 35.974M30.0417 51H12.875M36.3267 66.026C40.3509 70.0112 45.8089 72.25 51.5 72.25M36.3267 66.026L24.1878 78.047M51.5 72.25C57.1911 72.25 62.6491 70.0112 66.6733 66.026M51.5 72.25V89.25M66.6733 66.026C70.6975 62.0409 72.9583 56.6359 72.9583 51M66.6733 66.026L78.8122 78.047M72.9583 51C72.9583 45.3641 70.6975 39.9591 66.6733 35.974M72.9583 51H90.125M66.6733 35.974C62.6491 31.9888 57.1911 29.75 51.5 29.75M66.6733 35.974L78.8122 23.953M51.5 29.75C45.8089 29.75 40.3509 31.9888 36.3267 35.974M51.5 29.75V12.75M36.3267 35.974L24.1878 23.953"
          stroke={isDark ? "#6CA8FF" : "#2F80ED"}
          strokeWidth="1.5"
        />
      </Svg>

      <Text style={[styles.title, { color: isDark ? "#E5E7EB" : "#1F2D5A" }]}>
        Sinyal<Text style={{ color: "#3B82F6" }}>Roda</Text>
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
        Sistem untuk perawatan kendaraan Anda
      </Text>

      {/* Tiga dot animasi */}
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.dot, { backgroundColor: isDark ? "#6CA8FF" : "#51A2FF", opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { backgroundColor: isDark ? "#6CA8FF" : "#51A2FF", opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { backgroundColor: isDark ? "#6CA8FF" : "#51A2FF", opacity: dot3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", marginTop: 10 },
  subtitle: { marginTop: 8, marginBottom: 20, fontSize: 14 },
  loadingContainer: { flexDirection: "row", gap: 10, marginTop: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
