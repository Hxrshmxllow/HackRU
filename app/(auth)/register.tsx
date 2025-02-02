import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; 

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [RUID, setRUID] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState('rider'); 
  const [licensePlate, setLicensePlate] = useState('');
  const [carModel, setCarModel] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName || !RUID) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    if (userType === "driver" && (!licensePlate || !carModel)) {
      Alert.alert("Error", "Please enter your car details.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const collectionName = userType === "driver" ? "drivers" : "riders";
      await setDoc(doc(db, collectionName, user.uid), {
        email,
        firstName,
        lastName,
        RUID,
        userType,
        ...(userType === "driver" && { licensePlate, carModel }), 
        createdAt: new Date(),
      });

      Alert.alert("Success", `Account created successfully as a ${userType}!`);
      router.replace(userType === "rider" ? "/(rider)/home" : "/(driver)/home");
    } catch (error) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.userTypeContainer}>
        <TouchableOpacity 
          style={[styles.userTypeButton, userType === 'rider' && styles.selectedButton]} 
          onPress={() => setUserType('rider')}
        >
          <Text style={[styles.userTypeText, userType === 'rider' && styles.selectedText]}>Rider</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.userTypeButton, userType === 'driver' && styles.selectedButton]} 
          onPress={() => setUserType('driver')}
        >
          <Text style={[styles.userTypeText, userType === 'driver' && styles.selectedText]}>Driver</Text>
        </TouchableOpacity>
      </View>

      <TextInput placeholder="Your Rutgers Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput placeholder="RUID" style={styles.input} value={RUID} onChangeText={setRUID} keyboardType="numeric" autoCapitalize="none" />
      <TextInput placeholder="First Name" style={styles.input} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
      <TextInput placeholder="Last Name" style={styles.input} value={lastName} onChangeText={setLastName} autoCapitalize="words" />

      {userType === "driver" && (
        <>
          <TextInput placeholder="License Plate" style={styles.input} value={licensePlate} onChangeText={setLicensePlate} autoCapitalize="characters" />
          <TextInput placeholder="Car Model (e.g., Toyota Corolla)" style={styles.input} value={carModel} onChangeText={setCarModel} autoCapitalize="words" />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.link}>Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff', marginBottom: 10 },
  button: { backgroundColor: '#cc0033', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 15, color: '#cc0033' },
  userTypeContainer: { flexDirection: 'row', marginBottom: 10 },
  userTypeButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#cc0033', borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  selectedButton: { 
    backgroundColor: 'rgba(194, 23, 46, 0.56)', 
    borderColor: '#cc0033', 
  },
  userTypeText: { fontSize: 16, fontWeight: 'bold', color: '#cc0033' },
});

