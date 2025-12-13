import { Stack } from "expo-router";

export default function VehiclesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="service-schedule" />
      <Stack.Screen name="vehicles" />
    </Stack>
  );
}