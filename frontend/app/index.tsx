// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Langsung arahkan ke file splash.tsx
  return <Redirect href="/splash" />;
}