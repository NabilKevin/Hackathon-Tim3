import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";
import { Path, Svg } from "react-native-svg";

export default function AboutSinyalRodaScreen() {
    const isDark = useColorScheme() === "dark";

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
                    Tentang SinyalRoda
                </Text>

                <View style={{ width: 26 }} />
            </View>

            {/* LOGO & TITLE */}
            <View style={styles.centerContent}>
                <View
                    style={[
                        styles.logoContainer,
                        { backgroundColor: isDark ? "#1e293b" : "#e2e8f0" },
                    ]}
                >
                    <Svg width="46" height="48" viewBox="0 0 46 48" fill="none" >
                        <Path d="M6 24C6 26.3638 6.44618 28.7044 7.31308 30.8883C8.17997 33.0722 9.4506 35.0565 11.0524 36.7279C12.6542 38.3994 14.5558 39.7252 16.6487 40.6298C18.7416 41.5344 20.9847 42 23.25 42C25.5153 42 27.7584 41.5344 29.8513 40.6298C31.9442 39.7252 33.8458 38.3994 35.4476 36.7279C37.0494 35.0565 38.32 33.0722 39.1869 30.8883C40.0538 28.7044 40.5 26.3638 40.5 24C40.5 21.6362 40.0538 19.2956 39.1869 17.1117C38.32 14.9278 37.0494 12.9435 35.4476 11.2721C33.8458 9.60062 31.9442 8.27475 29.8513 7.37017C27.7584 6.46558 25.5153 6 23.25 6C20.9847 6 18.7416 6.46558 16.6487 7.37017C14.5558 8.27475 12.6542 9.60062 11.0524 11.2721C9.4506 12.9435 8.17997 14.9278 7.31308 17.1117C6.44618 19.2956 6 21.6362 6 24Z" stroke="#2F80ED" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <Path d="M13.6667 24C13.6667 26.6522 14.6763 29.1957 16.4736 31.0711M13.6667 24C13.6667 21.3478 14.6763 18.8043 16.4736 16.9289M13.6667 24H6M16.4736 31.0711C18.2708 32.9464 20.7083 34 23.25 34M16.4736 31.0711L11.0523 36.728M23.25 34C25.7917 34 28.2292 32.9464 30.0264 31.0711M23.25 34V42M30.0264 31.0711C31.8237 29.1957 32.8333 26.6522 32.8333 24M30.0264 31.0711L35.4477 36.728M32.8333 24C32.8333 21.3478 31.8237 18.8043 30.0264 16.9289M32.8333 24H40.5M30.0264 16.9289C28.2292 15.0536 25.7917 14 23.25 14M30.0264 16.9289L35.4477 11.272M23.25 14C20.7083 14 18.2708 15.0536 16.4736 16.9289M23.25 14V6M16.4736 16.9289L11.0523 11.272" stroke="#2F80ED" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </Svg>
                </View>

                <Text
                    style={[
                        styles.appName,
                        { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                >
                    Sinyal<Text style={{ color: "#3B82F6" }}>Roda</Text>
                </Text>

                <Text
                    style={[
                        styles.appSubtitle,
                        { color: isDark ? "#CBD5E1" : "#475569" },
                    ]}
                >
                    Aplikasi Monitoring & Manajemen Kendaraan Anda
                </Text>
            </View>

            {/* DESCRIPTION */}
            <View style={[styles.card, { backgroundColor: isDark ? "#121829" : "#FFFFFF" }]}>
                <Text
                    style={[
                        styles.descText,
                        { color: isDark ? "#E2E8F0" : "#334155" },
                    ]}
                >
                    SinyalRoda adalah aplikasi yang dirancang untuk membantu Anda memantau
                    kondisi kendaraan dengan lebih mudah. Dengan berbagai fitur seperti monitoring
                    GPS, kondisi mesin, bahan bakar, hingga pengingat servis, aplikasi ini dibuat
                    untuk meningkatkan kenyamanan berkendara Anda.
                </Text>
            </View>

            {/* FEATURE LIST */}
            <Text style={[styles.sectionTitle, { color: isDark ? "#e2e8f0" : "#334155" }]}>
                Fitur Utama
            </Text>

            <View style={[styles.card, { backgroundColor: isDark ? "#121829" : "#FFFFFF" }]}>
                <FeatureItem
                    icon={<Ionicons name="navigate-circle-outline" size={22} color={isDark ? "#fff" : "#1E293B"} />}
                    text="Tracking GPS Kendaraan"
                    isDark={isDark}
                />
                <FeatureItem
                    icon={<MaterialCommunityIcons name="fuel" size={22} color={isDark ? "#fff" : "#1E293B"} />}
                    text="Monitoring Level Bahan Bakar"
                    isDark={isDark}
                />
                <FeatureItem
                    icon={<Ionicons name="speedometer-outline" size={22} color={isDark ? "#fff" : "#1E293B"} />}
                    text="Informasi Kesehatan Mesin"
                    isDark={isDark}
                />
                <FeatureItem
                    icon={<MaterialIcons name="build" size={22} color={isDark ? "#fff" : "#1E293B"} />}
                    text="Pengingat Servis dan Perawatan"
                    isDark={isDark}
                />
            </View>

            {/* APP INFO */}
            <Text style={[styles.sectionTitle, { color: isDark ? "#e2e8f0" : "#334155" }]}>
                Informasi Aplikasi
            </Text>

            <View style={[styles.card, { backgroundColor: isDark ? "#121829" : "#FFFFFF" }]}>
                <InfoItem label="Versi Aplikasi" value="1.0.0" isDark={isDark} />
                <InfoItem label="Developer" value="Team SinyalRoda" isDark={isDark} />
                <InfoItem label="Website" value="www.sinyalroda.app" isDark={isDark} />
            </View>

            {/* CONTACT DEVELOPER */}
            <Text style={[styles.sectionTitle, { color: isDark ? "#e2e8f0" : "#334155" }]}>
                Kontak Developer
            </Text>

            <View style={[styles.card, { backgroundColor: isDark ? "#121829" : "#FFFFFF" }]}>
                <FeatureItem
                    icon={<Ionicons name="mail-outline" size={22} color={isDark ? "#fff" : "#1E293B"} />}
                    text="support@sinyalroda.app"
                    isDark={isDark}
                />
                <FeatureItem
                    icon={<Ionicons name="logo-github" size={22} color={isDark ? "#fff" : "#1E293B"} />}
                    text="github.com/sinyalroda"
                    isDark={isDark}
                />
            </View>
        </ScrollView>
    );
}

/* Feature Component */
const FeatureItem = ({
    icon,
    text,
    isDark,
}: {
    icon: React.ReactNode;
    text: string;
    isDark: boolean;
}) => (
    <View style={styles.featureItem}>
        {icon}
        <Text style={[styles.featureText, { color: isDark ? "#E2E8F0" : "#334155" }]}>
            {text}
        </Text>
    </View>
);

/* Info Row Component */
const InfoItem = ({
    label,
    value,
    isDark,
}: {
    label: string;
    value: string;
    isDark: boolean;
}) => (
    <View style={styles.infoItem}>
        <Text style={[styles.infoLabel, { color: isDark ? "#94A3B8" : "#64748B" }]}>
            {label}
        </Text>
        <Text style={[styles.infoValue, { color: isDark ? "#E2E8F0" : "#334155" }]}>
            {value}
        </Text>
    </View>
);

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
    centerContent: {
        alignItems: "center",
        marginBottom: 20,
    },
    logoContainer: {
        width: 76,
        height: 76,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        marginBottom: 10,
    },
    appName: {
        fontSize: 26,
        fontWeight: "800",
    },
    appSubtitle: {
        marginTop: 4,
        fontSize: 14,
        marginBottom: 20,
    },
    card: {
        width: "100%",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 20,
    },
    descText: {
        fontSize: 15,
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 10,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        gap: 12,
    },
    featureText: {
        fontSize: 15,
        fontWeight: "500",
    },
    infoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "600",
    },
});
