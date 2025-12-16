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
            {/* Cukup begini saja, screen akan auto-detect */}
            <Stack screenOptions={{ headerShown: false }}>
              {/* Opsional: definisikan screen hanya jika butuh config khusus.
                 Jika semua headerShown: false, children di bawah ini bisa dihapus 
                 dan biarkan tag <Stack ... /> menutup sendiri.
               */}
              <Stack.Screen name="index" />

              {/* Pastikan Splash tidak ada headernya */}
              <Stack.Screen name="splash" options={{ headerShown: false }} />

              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </ThemeProvider>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
