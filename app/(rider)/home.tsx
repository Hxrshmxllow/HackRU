import { Image, StyleSheet, Platform, View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";
import { useRef, useState, useEffect } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Stack } from "expo-router";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; 
import { GeoPoint } from "firebase/firestore"; 

export default function HomeScreen() {
  const origin = { latitude: 40.5006, longitude: -74.4474 }; 
  const [destination, setDestination] = useState(null);
  const [duration, setDuration] = useState(null);
  const mapRef = useRef(null);
  const [, forceUpdate] = useState();
  useEffect(() => {
    if (mapRef.current && destination) {
      mapRef.current.fitToCoordinates([origin, destination], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } 
    forceUpdate({});
  }, [destination]);
  const handleRideRequest = async () => {
    if (!destination) {
      Alert.alert("Destination is required!");
      return;
    }
  
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("User not authenticated!");
      return;
    }
  
    try {
      const rideData = {
        userId: user.uid,
        startLocation: new GeoPoint(origin.latitude, origin.longitude),
        endLocation: new GeoPoint(destination.latitude, destination.longitude),
        timestamp: serverTimestamp(), 
        cost: 1 + Math.round(duration) * 0.5, 
        duration: Math.round(duration),
      };
  
      const rideRef = await addDoc(collection(db, "rideRequests"), rideData);
      console.log("Ride request added with ID:", rideRef.id);
    } catch (error) {
      console.error("Error adding ride request:", error.message);
    }
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }}/> 
    <View style={styles.container}>
      <View style={styles.topContainer}></View>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete 
            placeholder="Where to?"
            fetchDetails={true}
            onPress={(data, details = null) => {
            if (details) {
                setDestination({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                });
            }
            }}
            query={{
              key: "AIzaSyB_UyBdjsm2HAGiD4c-0DKdRqv1tjyqS04",
              language: "en",
            }}
            styles={{
                container: {
                  flex: 1, 
                  position: "absolute",
                  top: 0, 
                  left: 0,
                  right: 0,
                  backgroundColor: "transparent",
                  zIndex: 10,
                },
                textInputContainer: {
                  width: "100%",
                  backgroundColor: "transparent", 
                },
                textInput: {
                  flex: 1,
                  height: 50,
                  fontSize: 16,
                  paddingHorizontal: 15,
                  borderRadius: 10,
                  backgroundColor: "transparent", 
                },
                listView: {
                  backgroundColor: "transparent", 
                },
              }}
        />
      </View>
      <View style={styles.mapContainer}>
      <MapView
        ref={mapRef} 
        provider="google"
        style={styles.map}
        initialRegion={{
          latitude: 40.5006,
          longitude: -74.4474,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <Marker coordinate={origin} title="Start Location" />
        <Marker coordinate={destination} title="Destination" />
        <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={"AIzaSyB_UyBdjsm2HAGiD4c-0DKdRqv1tjyqS04"}
          strokeWidth={4}
          strokeColor="blue"
          onReady={(result) => {
            console.log("Route found!");
            setDuration(result.duration);
          }}
          onError={(errorMessage) => {
            console.error("Directions API Error:", errorMessage);
          }}
        />
      </MapView>
      </View>
      <View style={styles.costContainer}>
          <Text style={styles.time}>
            Estimated Travel Time: {Math.round(duration)} mins
          </Text>
      </View>
      <TouchableOpacity 
        style={styles.continueContainer} 
        onPress={handleRideRequest}
      >
        <Text style={styles.buttonText}>See Available Commuters</Text>
      </TouchableOpacity>
      <View style={styles.bottomContainer}></View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "ffffff",
    height: "100%",
    width: "100%"
  },
  topContainer: {
    top: 0,
    width: "100%",
    height: 110,
    backgroundColor: "#CC0033"
  },
  searchContainer: { 
    top: 20,
    width: "85%",
    height: 50,
    backgroundColor: "lightgray",
    alignSelf: "center",
    borderRadius: 50,
  },
  mapContainer: {
    top: 50,
    width: "85%",
    height: 300,
    backgroundColor: "lightgray",
    alignSelf: "center",
    borderRadius: 30,
  },
  map: {
    width: "100%",
    height: "100%",
    alignSelf: "center",
    borderRadius: 30,
  },
  costContainer: {
    top: 80,
    width: "85%",
    height: 100,
    backgroundColor: "lightgray",
    alignSelf: "center", 
    borderRadius: 30,
    justifyContent: "center",
  },
  continueContainer: {
    top: 110,
    width: "85%",
    height: 100,
    backgroundColor: "#CC0033",
    alignSelf: "center",
    borderRadius: 30,
    justifyContent: "center"
  },
  time: {
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold"
  },
  buttonText: {
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff"
  },
  bottomContainer: {
    top: 120,
    width: "100%",
    height: 110,
    backgroundColor: "#CC0033"
  },
});
