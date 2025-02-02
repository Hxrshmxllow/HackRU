import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";


const checkAuth = async () => {
  console.log("Checking authentication..."); 
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ loggedIn: true, role: "rider" }); 
    }, 1000);
  });
};

export default function IndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router || !router.replace) {
      return;
    }
    setTimeout(() => {
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

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  return null; 
}
