import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [routerReady, setRouterReady] = useState(false);
  useEffect(() => {
    if (!router || !router.replace) {
      console.warn("🚨 Router is not ready yet!");
      return;
    }
    setTimeout(() => {
      router.replace("/(auth)/login"); 
    }, 100); 

    setLoading(false);
  }, []); 

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      <Stack.Screen name="(driver)/home" />
      <Stack.Screen name="(rider)/home" />
      <Stack.Screen name="(driver)/route" />
    </Stack>
  );
}
