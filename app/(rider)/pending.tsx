import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { Stack, useRouter } from "expo-router";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PendingScreen() {
    const router = useRouter();
    const [rideStatus, setRideStatus] = useState("Request Pending");
    const [rideRequestId, setRideRequestId] = useState(null); 

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return; // Ensure user is logged in

        const rideRequestsRef = collection(db, "rideRequests");

        // Listen for ride request status updates in real time
        const unsubscribe = onSnapshot(rideRequestsRef, (snapshot) => {
            snapshot.forEach((docSnapshot) => {
                const rideData = docSnapshot.data();
                if (rideData.userId === user.uid) {
                    setRideStatus(rideData.status);
                    setRideRequestId(docSnapshot.id); // Store the ride request ID
                }
            });
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut(); 
            router.replace("/(auth)/login"); 
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <>
        <Stack.Screen options={{ headerShown: false }}/> 
        <View style={styles.container}>
            <View style={styles.topContainer}></View>
            <View style={styles.middleContainer}>
                {rideStatus === "Request Accepted" ? (
                    <>
                        <Text style={styles.middleText}>
                            Your ride is confirmed. Your driver is on the way!
                        </Text>
                        <TouchableOpacity 
                            style={styles.paymentButton} 
                            onPress={() => router.replace("/(rider)/payment")}
                        >
                            <Text style={styles.buttonText}>Continue to Payment</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={styles.middleText}>
                        Your Ride Request is still pending. Looking for available driver.
                    </Text>
                )}
            </View>
            <View style={styles.bottomContainer}>
                <TouchableOpacity onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={40} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace("/(rider)/payment")}>
                    <MaterialCommunityIcons name="home" size={40} color="white" />
                </TouchableOpacity>
            </View>
        </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ffffff",
        height: "100%",
        width: "100%"
    },
    topContainer: {
        top: 0,
        width: "100%",
        height: 110,
        backgroundColor: "#CC0033"
    },
    middleContainer:{
        top: 0,
        width: "80%",
        height: "77%",
        backgroundColor: "#ffffff",
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    bottomContainer: {
        top: 0,
        width: "100%",
        height: 110,
        backgroundColor: "#CC0033",
        flexDirection: 'row', 
        justifyContent: 'space-between',
        padding: 20
    },
    middleText: {
        alignSelf: "center",
        fontWeight: "bold",
        fontSize: 20,
        textAlign: "center",
        marginBottom: 10
    },
    paymentButton: {
        backgroundColor: "#CC0033",
        padding: 15,
        borderRadius: 10,
        marginTop: 20
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18
    }
});
