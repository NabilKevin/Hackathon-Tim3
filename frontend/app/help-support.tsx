import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    LayoutAnimation,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    useColorScheme,
    View,
} from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HelpSupportScreen() {
  const isDark = useColorScheme() === "dark";

  const [message, setMessage] = useState("");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqList = [
    {
      q: "Bagaimana cara menambahkan kendaraan?",
      a: "Anda dapat menambah kendaraan melalui menu 'Tambah Kendaraan' pada halaman Akun atau Beranda.",
    },
    {
      q: "Bagaimana cara mengubah tema aplikasi?",
      a: "Buka halaman Akun, pilih menu Tema Aplikasi, lalu pilih Dark atau Light.",
    },
    {
      q: "Data saya tidak tersimpan, bagaimana solusinya?",
      a: "Pastikan koneksi internet stabil. Jika masih gagal, coba ulang atau hubungi Support.",
    },
  ];

  const sendFeedback = () => {
    if (!message.trim()) {
      alert("Tulis pesan terlebih dahulu.");
      return;
    }

    console.log("PESAN SUPPORT:", message);
    alert("Pesan Anda sudah dikirim!");
    setMessage("");
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* HEADER */}
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
          Bantuan & Support
        </Text>

        <View style={{ width: 26 }} />
      </View>

      {/* FAQ */}
      <Text style={[styles.sectionTitle, { color: isDark ? "#e2e8f0" : "#334155" }]}>
        Frequently Asked Questions (FAQ)
      </Text>

      <View style={[styles.card, { backgroundColor: isDark ? "#1f263eff" : "#FFFFFF" }]}>
        {faqList.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.faqItem}
              onPress={() => toggleFAQ(index)}
            >
              <Text
                style={[
                  styles.faqQuestion,
                  { color: isDark ? "#fff" : "#1E293B" },
                ]}
              >
                {item.q}
              </Text>

              <Ionicons
              style={{ marginLeft:-20 }}
                name={openFAQ === index ? "chevron-up" : "chevron-down"}
                size={20}
                color={isDark ? "#94a3b8" : "#64748b"}
              />
            </TouchableOpacity>

            {openFAQ === index && (
              <Text
                style={[
                  styles.faqAnswer,
                  { color: isDark ? "#cbd5e1" : "#475569" },
                ]}
              >
                {item.a}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* CONTACT SUPPORT */}
      <Text style={[styles.sectionTitle, { color: isDark ? "#e2e8f0" : "#334155" }]}>
        Kontak Support
      </Text>

      <View style={[styles.card, { backgroundColor: isDark ? "#1f263eff" : "#FFFFFF" }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Linking.openURL("mailto:support@sinyalroda.app")}
        >
          <Ionicons
            name="mail-outline"
            size={22}
            color={isDark ? "#fff" : "#1E293B"}
          />
          <Text style={[styles.menuLabel, { color: isDark ? "#fff" : "#1E293B" }]}>
            Email Support
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Linking.openURL("https://wa.me/6281234567890")}
        >
          <Ionicons
            name="logo-whatsapp"
            size={23}
            color={isDark ? "#fff" : "#1E293B"}
          />
          <Text style={[styles.menuLabel, { color: isDark ? "#fff" : "#1E293B" }]}>
            WhatsApp Support
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEND FEEDBACK */}
      <Text style={[styles.sectionTitle, { color: isDark ? "#e2e8f0" : "#334155" }]}>
        Kirim Pesan ke Support
      </Text>

      <TextInput
        style={[
          styles.textArea,
          {
            backgroundColor: isDark ? "#1e293b" : "#e2e8f0",
            color: isDark ? "#fff" : "#000",
          },
        ]}
        value={message}
        onChangeText={setMessage}
        placeholder="Tulis pesan Anda di sini..."
        placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
        multiline
      />

      <TouchableOpacity style={styles.sendButton} onPress={sendFeedback}>
        <Text style={styles.sendButtonText}>Kirim Pesan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  card: {
    width: "100%",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 20,
  },
  faqItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
  },
  faqAnswer: {
    fontSize: 14,
    marginBottom: 10,
    paddingHorizontal: 4,
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  textArea: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    height: 130,
    textAlignVertical: "top",
  },
  sendButton: {
    marginTop: 15,
    backgroundColor: "#51A2FF20",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#51A2FF",
    fontSize: 16,
    fontWeight: "700",
  },
});
