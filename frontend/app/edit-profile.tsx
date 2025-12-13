import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

export default function EditProfileScreen() {
  const isDark = useColorScheme() === "dark";

  const [username, setUsername] = useState("Handika"); // contoh default
  const [email, setEmail] = useState("handika@mail.com");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!username || !email) {
      alert("Username dan Email wajib diisi!");
      return;
    }

    if (newPassword || confirmPassword || oldPassword) {
      if (!oldPassword) return alert("Masukkan password lama!");
      if (newPassword !== confirmPassword)
        return alert("Password baru dan konfirmasi tidak sama!");
    }

    const payload = {
      username,
      email,
      updatePassword: newPassword ? true : false,
      oldPassword,
      newPassword,
      image,
    };

    console.log("DATA UPDATE PROFIL:", payload);
    alert("Profil berhasil diperbarui!");
    router.back();
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={isDark ? "#E2E8F0" : "#334155"}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? "#F1F5F9" : "#0F172A" },
          ]}
        >
          Edit Profil
        </Text>

        <View style={{ width: 26 }} />
      </View>

      {/* Upload Foto Profil */}
      <Text style={[styles.label, { color: isDark ? "#e2e8f0" : "#334155" }]}>
        Foto Profil
      </Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>Pilih Foto</Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            alignSelf: "center",
            marginTop: 10,
          }}
        />
      )}

      {/* FORM */}
      <InputField label="Username" value={username} onChange={setUsername} />
      <InputField label="Email" value={email} onChange={setEmail} keyboardType="email-address" />

      {/* PASSWORD SECTION */}
      <Text
        style={[
          styles.label,
          { marginTop: 16, color: isDark ? "#e2e8f0" : "#334155" },
        ]}
      >
        Ubah Password (opsional)
      </Text>

      <InputField
        label="Password Lama"
        value={oldPassword}
        onChange={setOldPassword}
        placeholder="•••••••"
        secure
      />

      <InputField
        label="Password Baru"
        value={newPassword}
        onChange={setNewPassword}
        placeholder="•••••••"
        secure
      />

      <InputField
        label="Konfirmasi Password Baru"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="•••••••"
        secure
      />

      {/* SAVE BUTTON */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* Reusable Input Component */
type InputProps = {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
  secure?: boolean;
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  secure,
}: InputProps) => {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={[
          styles.label,
          { color: isDark ? "#e2e8f0" : "#334155" },
        ]}
      >
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e293b" : "#e2e8f0",
            color: isDark ? "white" : "black",
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
        keyboardType={keyboardType}
        secureTextEntry={secure}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 25,
    backgroundColor: "#51a2ff10",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#51A2FF",
    fontSize: 16,
    fontWeight: "700",
  },
});
