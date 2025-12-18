import { storageurl } from "@/services/api"; // Pastikan import ini ada
import { getToken, getUser, updateUser } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
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

  // State Loading
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // State Data User
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);
  
  // State Password (Opsional)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State untuk melacak apakah gambar diganti
  const [isNewImage, setIsNewImage] = useState(false);

  // 1. Ambil Foto dari Galeri
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Profile biasanya kotak/bulat
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setIsNewImage(true); // Tandai gambar baru
    }
  };

  // 2. Ambil Data User Saat Ini
  const fetchData = async () => {
    try {
      setInitialLoading(true);
      const userData = await getUser();
      
      setUsername(userData.username);
      setEmail(userData.email);

      // Handle Gambar Lama dari Server
      const photoPath = userData.photo_profile || userData.image; // Sesuaikan dengan response API

      if (photoPath) {
        // Cek apakah URL absolut atau relatif
        const fullPath = photoPath.startsWith('http') 
            ? photoPath 
            : `${storageurl}${photoPath}`;
        setImage(fullPath);
      }

    } catch (error) {
      console.log("Error fetching user:", error);
      Alert.alert("Gagal", "Tidak dapat mengambil data profil.");
    } finally {
      setInitialLoading(false);
    }
  }

  // 3. Simpan Perubahan
  const handleSave = async () => {
    const token = await getToken();
    if (!token) return Alert.alert("Error", "Sesi berakhir, silakan login ulang.");

    // Validasi Dasar
    if (!username || !email) {
      Alert.alert("Validasi", "Username dan Email wajib diisi!");
      return;
    }

    // Validasi Password (hanya jika diisi)
    if (newPassword || confirmPassword) {
       if (!oldPassword) return Alert.alert("Validasi", "Masukkan password lama untuk mengubah password.");
       if (newPassword !== confirmPassword) return Alert.alert("Validasi", "Password baru tidak cocok.");
    }

    try {
      setLoading(true);
      const formData = new FormData();

      // Method Spoofing untuk Backend (Agar terbaca sebagai PUT walaupun POST multipart)
      formData.append("_method", "PUT");

      formData.append("username", username);
      formData.append("email", email);

      // Append password hanya jika diubah
      if (newPassword) {
        formData.append("current_password", oldPassword);
        formData.append("password", newPassword);
        formData.append("password_confirmation", confirmPassword);
      }

      // Append Gambar HANYA jika user menggantinya
      if (isNewImage && image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || "");
        // Pastikan MIME type valid
        const getMimeType = (fname: string) => {
            if (fname.endsWith('.png')) return 'image/png';
            if (fname.endsWith('.webp')) return 'image/webp';
            return 'image/jpeg';
        };
        const type = getMimeType(filename || "");

        // Sesuaikan nama field dengan backend (sesuai request Anda sebelumnya 'photo_profile')
        formData.append('photo_profile', { 
          uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
          name: filename || "profile.jpg",
          type: type,
        } as any);
      }
      
      // Kirim ke Backend
      await updateUser(token, formData);

      Alert.alert("Berhasil", "Profil berhasil diperbarui!", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (error: any) {
      console.error("Update Profile Error:", error.response?.data);
      
      let message = "Terjadi kesalahan saat memperbarui profil.";
      if (error.response?.data?.message) {
         message = error.response.data.message;
      }
      // Handle error validasi spesifik (misal email duplikat)
      if (error.response?.data?.errors) {
         const firstError = Object.values(error.response.data.errors)[0];
         if (Array.isArray(firstError)) message = firstError[0] as string;
      }

      Alert.alert("Gagal", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (initialLoading) {
    return (
        <View style={[styles.center, {backgroundColor: isDark ? "#0f172a" : "#f8fafc"}]}>
            <ActivityIndicator size="large" color="#2563EB" />
        </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      }}
      contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
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

        <Text style={[styles.headerTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>
          Edit Profil
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Foto Profil */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={pickImage} style={{ position: 'relative' }}>
            {image ? (
                <Image
                source={{ uri: image }}
                style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    borderWidth: 2,
                    borderColor: isDark ? '#334155' : '#e2e8f0'
                }}
                />
            ) : (
                <View style={[styles.placeholderImage, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                    <Ionicons name="person" size={40} color={isDark ? '#94a3b8' : '#64748b'} />
                </View>
            )}
            
            {/* Icon Camera Kecil */}
            <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={14} color="white" />
            </View>
        </TouchableOpacity>
        <Text style={[styles.changePhotoText, { color: '#2563EB' }]}>Ubah Foto</Text>
      </View>

      {/* FORM DATA DIRI */}
      <Text style={[styles.sectionTitle, { color: isDark ? "#e2e8f0" : "#334155" }]}>
        Data Diri
      </Text>
      <InputField label="Username" value={username} onChange={setUsername} />
      <InputField label="Email" value={email} onChange={setEmail} keyboardType="email-address" />

      {/* FORM PASSWORD */}
      <Text style={[styles.sectionTitle, { color: isDark ? "#e2e8f0" : "#334155", marginTop: 10 }]}>
        Keamanan (Opsional)
      </Text>
      
      <InputField
        label="Password Lama"
        value={oldPassword}
        onChange={setOldPassword}
        placeholder="Isi jika ingin ganti password"
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
        label="Konfirmasi Password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="•••••••"
        secure
      />

      {/* SAVE BUTTON */}
      <TouchableOpacity 
        style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]} 
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color="#FFFFFF" />
        ) : (
            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
        )}
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
      <Text style={[styles.label, { color: isDark ? "#94a3b8" : "#64748b" }]}>
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
        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
        keyboardType={keyboardType}
        secureTextEntry={secure}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
    marginTop: 5,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white'
  },
  changePhotoText: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    marginTop: 25,
    backgroundColor: "#2563EB", // Warna Solid untuk Primary Action
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});