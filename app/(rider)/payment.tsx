import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { Stack } from "expo-router";

const PaymentScreen: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "applepay">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayment = () => {
    if (paymentMethod === "card" && (cardNumber.length < 16 || cvv.length < 3)) {
      Alert.alert("❌ Invalid Card Details", "Please check and try again.");
      return;
    }
    Alert.alert("✅ Payment Successful!", "Your ride is confirmed.");
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }}/> 
    <View style={styles.container}>
      <View style={styles.topContainer}></View>
      <View style={styles.middleContainer}>
      <Text style={styles.title}>Pay for Your Ride</Text>

{/* Payment Method Selection */}
<View style={styles.paymentMethods}>
  <TouchableOpacity
    style={[styles.methodButton, paymentMethod === "card" && styles.activeButton]}
    onPress={() => setPaymentMethod("card")}
  >
    <Text style={[styles.methodText, paymentMethod === "card" && styles.activeText]}>
      💳 Credit/Debit Card
    </Text>
  </TouchableOpacity>
  {Platform.OS === "ios" && (
    <TouchableOpacity
      style={[styles.methodButton, paymentMethod === "applepay" && styles.activeButton]}
      onPress={() => setPaymentMethod("applepay")}
    >
      <Text style={[styles.methodText, paymentMethod === "applepay" && styles.activeText]}>
       Apple Pay
      </Text>
    </TouchableOpacity>
  )}
</View>

{/* Card Payment Input Fields */}
{paymentMethod === "card" && (
  <View style={styles.cardDetails}>
    <Text style={styles.label}>Card Number</Text>
    <TextInput
      style={styles.input}
      placeholder="1234 5678 9101 1121"
      keyboardType="numeric"
      value={cardNumber}
      onChangeText={(text) => setCardNumber(text.replace(/\D/, ""))}
      maxLength={16}
    />

    <View style={styles.cardRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Expiry Date</Text>
        <TextInput
          style={styles.input}
          placeholder="MM/YY"
          keyboardType="numeric"
          value={expiryDate}
          onChangeText={setExpiryDate}
          maxLength={5}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>CVV</Text>
        <TextInput
          style={styles.input}
          placeholder="123"
          keyboardType="numeric"
          secureTextEntry
          value={cvv}
          onChangeText={(text) => setCvv(text.replace(/\D/, ""))}
          maxLength={3}
        />
      </View>
    </View>
  </View>
)}

{/* Payment Button */}
<TouchableOpacity style={styles.payButton} onPress={handlePayment}>
  <Text style={styles.payButtonText}>
    {paymentMethod === "card" ? "Pay with Card" : "Pay with Apple Pay"}
  </Text>
</TouchableOpacity>
      </View>
      <View style={styles.bottomContainer}></View>
    </View>
    </>
  );
};

// **Styled in TypeScript (TSX)**
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
  },
  middleContainer: {
    justifyContent: "center",
    alignSelf: "center",
    width: "90%",
    height: "75%"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 20,
    alignSelf: "center"
  },
  paymentMethods: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "center",
  },
  methodButton: {
    padding: 12,
    margin: 5,
    borderWidth: 1,
    borderColor: "#d32f2f",
    backgroundColor: "white",
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: "#d32f2f",
  },
  methodText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "bold",
  },
  activeText: {
    color: "white",
  },
  cardDetails: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#d6d6d6",
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  payButton: {
    backgroundColor: "#d32f2f",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  payButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  topContainer: {
    top: 0,
    width: "100%",
    height: 110,
    backgroundColor: "#CC0033"
  },
  bottomContainer: {
    bottom: 0,
    width: "100%",
    height: 110,
    backgroundColor: "#CC0033"
  },
});

export default PaymentScreen;
