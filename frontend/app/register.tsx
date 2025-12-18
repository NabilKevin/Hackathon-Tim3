import { api } from "@/services/api";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function Register() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !passwordConfirmation) {
      Alert.alert("Error", "Semua field wajib diisi");
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert("Error", "Konfirmasi password tidak sama");
      return;
    }

    try {
      setLoading(true);

      // Pastikan endpoint sesuai dengan backend Anda
      await api.post("/register", {
        username,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      Alert.alert(
        "Berhasil",
        "Registrasi berhasil, silakan login",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        // Handle jika error object atau array
        const messages = Object.values(errors)
          .flat()
          .join("\n");

        Alert.alert("Validasi Gagal", messages);
      } else {
        Alert.alert(
          "Gagal",
          error.response?.data?.message || "Terjadi kesalahan server"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#FFFFFF" },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: isDark ? "#F8FAFC" : "#000" },
        ]}
      >
        Registrasi
      </Text>

      {/* Input Username */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? "#CBD5E1" : "#374151" }]}>
          Username
        </Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#F9FAFB",
              color: isDark ? "#F1F5F9" : "#111827",
              borderColor: isDark ? "#334155" : "#E5E7EB",
            },
          ]}
          placeholder="Masukkan Username"
          placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
        />
      </View>

      {/* Input Email */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? "#CBD5E1" : "#374151" }]}>
          Email
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#F9FAFB",
              color: isDark ? "#F1F5F9" : "#111827",
              borderColor: isDark ? "#334155" : "#E5E7EB",
            },
          ]}
          placeholder="contoh@sinyalroda.id"
          placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
        />
      </View>

      {/* Input Password */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? "#CBD5E1" : "#374151" }]}>
          Kata Sandi
        </Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#F9FAFB",
              color: isDark ? "#F1F5F9" : "#111827",
              borderColor: isDark ? "#334155" : "#E5E7EB",
            },
          ]}
          placeholder="Kata Sandi"
          placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
        />
      </View>

      {/* Input Confirm Password */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? "#CBD5E1" : "#374151" }]}>
          Konfirmasi Kata Sandi
        </Text>
        <TextInput
          secureTextEntry
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#F9FAFB",
              color: isDark ? "#F1F5F9" : "#111827",
              borderColor: isDark ? "#334155" : "#E5E7EB",
            },
          ]}
          placeholder="Konfirmasi Kata Sandi"
          placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
        />
      </View>

      {/* Tombol Register */}
      <TouchableOpacity 
        style={[styles.primaryBtn, { opacity: loading ? 0.7 : 1 }]} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
           <ActivityIndicator color="#fff" />
        ) : (
           <Text style={styles.primaryBtnText}>Daftar</Text>
        )}
      </TouchableOpacity>

      <Text
        style={[
          styles.footerText,
          { color: isDark ? "#94A3B8" : "#6B7280" },
        ]}
      >
        Sudah punya akun?{" "}
        <Text
          style={[styles.link, { color: isDark ? "#60A5FA" : "#3B82F6" }]}
          onPress={() => router.push("/login")}
        >
          Login
        </Text>
      </Text>

      <Text
        style={[
          styles.or,
          { color: isDark ? "#94A3B8" : "#6B7280" },
        ]}
      >
        Atau masuk dengan
      </Text>

      <View style={styles.socialRow}>
        <TouchableOpacity
          style={[
            styles.socialButton,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E5E7EB",
            },
          ]}
        >
          <AntDesign
            name="google"
            size={24}
            color={isDark ? "#F8FAFC" : "black"}
          />
          <Text style={{ color: isDark ? "#E2E8F0" : "#000", marginLeft: 8 }}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.socialButton,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E5E7EB",
            },
          ]}
        >
          <MaterialIcons
            name="apple"
            size={24}
            color={isDark ? "#F8FAFC" : "black"}
          />
          <Text style={{ color: isDark ? "#E2E8F0" : "#000", marginLeft: 8 }}>Apple</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
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
    marginTop: 20,
    marginBottom: 12,
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
    flexDirection: 'row', // Agar icon dan text sejajar
    justifyContent: 'center',
  },
  footerText: {
    textAlign: "center",
    marginTop: 16,
  },
  link: {
    fontWeight: "600",
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});