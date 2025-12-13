import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from "expo-router";
import { StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";

export default function Login() {

  const theme = useColorScheme();
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0D0D0D" : "#FFFFFF" },
      ]}
    >

      <Text
        style={[
          styles.title,
          { color: isDark ? "#E5E7EB" : "#1F2D5A" },
        ]}
      >
        Selamat Datang
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: isDark ? "#9CA3AF" : "#6B7280" },
        ]}
      >
        Masuk untuk mengakses fitur dan pemantauan kendaraan Anda
      </Text>

      {/* Input Email */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? "#E5E7EB" : "#374151" }]}>
          Email
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#F9FAFB",
              borderColor: isDark ? "#3A3A3A" : "#E5E7EB",
              color: isDark ? "#FFFFFF" : "#111827",
            },
          ]}
          placeholder="contoh@sinyalroda.id"
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        />
      </View>

      {/* Input Password */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? "#E5E7EB" : "#374151" }]}>
          Kata Sandi
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#F9FAFB",
              borderColor: isDark ? "#3A3A3A" : "#E5E7EB",
              color: isDark ? "#FFFFFF" : "#111827",
            },
          ]}
          secureTextEntry
          placeholder="Masukkan Kata Sandi"
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        />
      </View>

      {/* Tombol Login */}
      <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/dashboard")}>
        <Text style={styles.primaryBtnText}>Masuk Sekarang</Text>
      </TouchableOpacity>

      {/* Garis atau teks "Atau Masuk Dengan" */}
      <Text
        style={[
          styles.or,
          { color: isDark ? "#9CA3AF" : "#6B7280" },
        ]}
      >
        Atau masuk dengan
      </Text>

      {/* Tombol Google & Apple */}
      <View style={styles.socialRow}>

        {/* Google Button */}
        <TouchableOpacity
          style={[
            styles.socialButton,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
              borderColor: isDark ? "#3A3A3A" : "#E5E7EB",
            },
          ]}
        >
          <AntDesign name="google" size={24} color={isDark ? "#FFFFFF" : "black"} />
          <Text style={{ color: isDark ? "#E5E7EB" : "#111827", marginTop: 4 }}>Google</Text>
        </TouchableOpacity>

        {/* Apple Button */}
        <TouchableOpacity
          style={[
            styles.socialButton,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
              borderColor: isDark ? "#3A3A3A" : "#E5E7EB",
            },
          ]}
        >
          <MaterialIcons name="apple" size={24} color={isDark ? "#FFFFFF" : "black"} />
          <Text style={{ color: isDark ? "#E5E7EB" : "#111827", marginTop: 4 }}>Apple</Text>
        </TouchableOpacity>

      </View>

      {/* Footer */}
      <Text
        style={[
          styles.footerText,
          { color: isDark ? "#9CA3AF" : "#6B7280" },
        ]}
      >
        Belum punya akun?{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/register")}
        >
          Daftar disini
        </Text>
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  or: {
    textAlign: "center",
    marginVertical: 16,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  footerText: {
    textAlign: "center",
    marginTop: 16,
  },
  link: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});
