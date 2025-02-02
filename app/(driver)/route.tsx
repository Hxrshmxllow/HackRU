import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { View, StyleSheet,TouchableOpacity, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRef, useState, useEffect } from "react";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";

export default function Route() {
    const mapRef = useRef(null);
    const { startLat, startLng, endLat, endLng } = useLocalSearchParams(); // ✅ Get ride data
    const [enRouteToPickup, setEnRouteToPickup] = useState(true); 
    const [driverLocation, setDriverLocation] = useState(null);
    useEffect(() => {
        const getDriverLocation = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                
                if (status !== "granted") {
                    console.error("Permission to access location was denied");
                    return;
                }
        
                let location = await Location.getCurrentPositionAsync({});
                setDriverLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
        
            } catch (error) {
                console.error("Error fetching location:", error);
            }
        };

        getDriverLocation();

        // Update location every 5 seconds
        const locationInterval = setInterval(getDriverLocation, 5000);

        return () => clearInterval(locationInterval);
    }, []);

    return (
        <>
        <Stack.Screen options={{ headerShown: false }}/>
        <View style={styles.container}>
            <View style={styles.topContainer}></View>
            <View style={styles.mapContainer}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: enRouteToPickup ? driverLocation?.latitude || parseFloat(startLat) : parseFloat(startLat),
                    longitude: enRouteToPickup ? driverLocation?.longitude || parseFloat(startLng) : parseFloat(startLng),
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
            >
                {/* Markers */}
                <Marker coordinate={{ latitude: parseFloat(startLat), longitude: parseFloat(startLng) }} title="Pickup Location" />
                <Marker coordinate={{ latitude: parseFloat(endLat), longitude: parseFloat(endLng) }} title="Dropoff Location" />

                {/* Show Driver's Real-time Location */}
                {driverLocation && (
                    <Marker coordinate={driverLocation} title="Your Location" pinColor="blue" />
                )}

                {/* Show Route: Driver → Pickup OR Pickup → Dropoff */}
                <MapViewDirections
                    origin={enRouteToPickup ? driverLocation : { latitude: parseFloat(startLat), longitude: parseFloat(startLng) }}
                    destination={enRouteToPickup ? { latitude: parseFloat(startLat), longitude: parseFloat(startLng) } : { latitude: parseFloat(endLat), longitude: parseFloat(endLng) }}
                    apikey={"AIzaSyB_UyBdjsm2HAGiD4c-0DKdRqv1tjyqS04"}
                    strokeWidth={4}
                    strokeColor="blue"
                />
            </MapView>
            <TouchableOpacity 
                onPress={() => setEnRouteToPickup(false)} 
                style={styles.continueButton}
            >
                <Text style={styles.buttonText}>{enRouteToPickup ? "Picked Up" : "Complete Ride"}</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.bottomContainer}></View>
        </View>
        </>
    );
}


const styles = StyleSheet.create({
    container: {
      backgroundColor: "ffffff",
    },
    topContainer: {
      top: 0,
      width: "100%",
      height: 110,
      backgroundColor: "#CC0033"
    },
    bottomContainer: {
        top: 80,
        width: "100%",
        height: 110,
        backgroundColor: "#CC0033"
      },
    mapContainer: {
        top: 0,
        width: "100%",
        height: "71%",
    },
    continueButton: {
        top: 0,
        width: "100%",
        height: 80,
        backgroundColor: "lightgray",
        justifyContent: "center"
    },
    buttonText: {
        alignSelf: "center",
        fontSize: 17,
        fontWeight: "bold",
        color: "#CC0033"
    },
    map: {
        alignSelf: "center",
        width: "100%",
        height: "100%",
    }
}
)