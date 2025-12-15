import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // const notificationListener = useRef<Notifications.Subscription | null>(null);
  // const responseListener = useRef<Notifications.Subscription | null>(null);

  // useEffect(() => {
  //   registerForPushNotificationsAsync();

  //   notificationListener.current =
  //     Notifications.addNotificationReceivedListener(notification => {
  //       console.log("🔔 NOTIF MASUK:", notification);
  //     });

  //   responseListener.current =
  //     Notifications.addNotificationResponseReceivedListener(response => {
  //       console.log("👉 NOTIF DI KLIK:", response);
  //     });

  //   return () => {
  //     notificationListener.current?.remove();
  //     responseListener.current?.remove();
  //   };
  // }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar
          style={isDark ? "light" : "dark"}
          translucent
          animated
        />

        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDark ? "black" : "white"
          }}
        >
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="splash" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
            </Stack>
          </ThemeProvider>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
