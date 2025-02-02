import { Image, StyleSheet, Platform, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRef, useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MapViewDirections from "react-native-maps-directions";
import { Stack, useRouter } from "expo-router";

export default function HomeScreen() {
  const [expandedRideId, setExpandedRideId] = useState(null);
  const [rideRequests, setRideRequests] = useState([]); // Store ride requests from Firestore
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const [userNames, setUserNames] = useState({}); // Store user names for quick lookup
  const [addresses, setAddresses] = useState({}); // Store fetched addresses
  const [, forceUpdate] = useState();
  const [refresh, setRefresh] = useState(0);
  const router = useRouter();
  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyB_UyBdjsm2HAGiD4c-0DKdRqv1tjyqS04`
      );
      const data = await response.json();
  
      if (data.status === "OK") {
        const formattedAddress = data.results[0].formatted_address;
        const addressComponents = data.results[0].address_components;
        let streetName = "Unknown";
        for (let component of addressComponents) {
            if (component.types.includes("route")) {
                streetName = component.long_name;
                break;
            }
        }
        return streetName;
      } else {
        console.error("Geocoding API Error:", data.status);
        return "Unknown location";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Unknown location";
    }
  };

  useEffect(() => {
    const fetchRideRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "rideRequests"));
        const rides = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setRideRequests(rides);
  
        // Fetch user names
        const names = {};
        for (const ride of rides) {
          const userDoc = await getUserInfo(ride.userId);
          if (userDoc) {
            names[ride.userId] = `${userDoc.firstName} ${userDoc.lastName}`;
          }
        }
        setUserNames(names);
  
        // ✅ Automatically call handleExpandRide for each ride
        for (const ride of rides) {
          await handleExpandRide(ride);
        }
  
        setLoading(false);
  
      } catch (error) {
        console.error("Error fetching ride requests:", error.message);
        setLoading(false);
      }
    };
  
    fetchRideRequests();
  }, []);

  const getUserInfo = async (userId) => {
    try {
      let userRef = doc(db, "riders", userId);
      let userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        userRef = doc(db, "drivers", userId);
        userSnap = await getDoc(userRef);
      }
      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      console.error("Error fetching user info:", error.message);
      return null;
    }
  };

  const handleExpandRide = async (ride) => {
    const rideId = ride.id;

    if (!addresses[rideId]) {
        console.log("Fetching address for ride:", rideId);

        const pickupAddress = await getAddressFromCoordinates(
            ride.startLocation.latitude,
            ride.startLocation.longitude
        );
        const dropoffAddress = await getAddressFromCoordinates(
            ride.endLocation.latitude,
            ride.endLocation.longitude
        );

        setAddresses(prev => ({
            ...prev,
            [rideId]: { pickup: pickupAddress, dropoff: dropoffAddress },
        }));

        setRefresh(prev => prev + 1); // 🔄 Forces a re-render
    }
};

  return (
    <>
      <Stack.Screen options={{ headerShown: false }}/> 
      <View style={styles.container}>
        <View style={styles.topContainer}></View>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>View Ride Requests</Text>
        </View>

        {/* Show loading indicator while fetching rides */}
        {loading ? <ActivityIndicator size="large" color="#cc0033" /> : null}

        <View style={styles.availableRidesContainer}>
          {rideRequests.map((ride) => (
            <TouchableOpacity 
              key={ride.id} 
              onPress={() => setExpandedRideId(expandedRideId === ride.id ? null : ride.id)} 
              activeOpacity={0.7}
            >
              <View style={[styles.rideContainer, expandedRideId === ride.id && styles.expandedContainer]}>
                <View style={styles.toprow}>
                <Text style={styles.name}>{userNames[ride.userId] || "Unknown User"}</Text>
                  <Text style={styles.time}>{new Date(ride.timestamp?.seconds * 1000).toLocaleString()}</Text>
                </View>
                <View style={styles.bottomrow}>
                <Text style={styles.pickup}>
                  Pickup: {addresses[ride.id] ? addresses[ride.id].pickup : "Fetching..."}
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="black"/>
                <Text style={styles.dropoff}>
                  Dropoff: {addresses[ride.id] ? addresses[ride.id].dropoff : "Fetching..."}
                </Text>
                </View>

                {/* Expand to show map */}
                {expandedRideId === ride.id && (
                  <View style={styles.details}>
                    <MapView
                      ref={mapRef}
                      provider="google"
                      style={styles.map}
                      initialRegion={{
                        latitude: ride.startLocation.latitude,
                        longitude: ride.startLocation.longitude,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                      }}
                    >
                      <Marker coordinate={ride.startLocation} title="Start Location" />
                      <Marker coordinate={ride.endLocation} title="Destination" />
                      <MapViewDirections
                        origin={ride.startLocation}
                        destination={ride.endLocation}
                        apikey={"AIzaSyB_UyBdjsm2HAGiD4c-0DKdRqv1tjyqS04"}
                        strokeWidth={4}
                        strokeColor="blue"
                        onReady={(result) => {
                          forceUpdate({});
                        }}
                        onError={(errorMessage) => {
                          console.error("Directions API Error:", errorMessage);
                        }}
                      />
                    </MapView>
                    <View style={styles.ridesBottomContainer}>
                      <Text style={styles.durationText}>ETA: {ride.duration} min</Text>
                      <Text style={styles.costText}>Cost: ${ride.cost.toFixed(2)}</Text>
                      <TouchableOpacity 
                      onPress={() => {
                        console.log("Ride Selected:", ride.id);

                        router.replace({
                          pathname: "/(driver)/route",
                          params: {
                            startLat: ride.startLocation.latitude,
                            startLng: ride.startLocation.longitude,
                            endLat: ride.endLocation.latitude,
                            endLng: ride.endLocation.longitude
                          }
                        });
                      }} 
                      style={styles.continueButton}
                    >
                      <Text style={styles.buttonText}>Accept Ride</Text>
                    </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
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
  welcomeContainer: {
    top: 20,
    width: "85%",
    height: 50,
    alignSelf: "center",
    borderRadius: 40,
    justifyContent: "center"
  },
  welcomeText: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20
  },
  availableRidesContainer: {
    top: 20,
    width: "85%",
    height: "70%",
    alignSelf: "center",
  },
  rideContainer: {
    top: 10,
    width: "100%",
    height: 120,
    alignSelf: "center",
    backgroundColor: "lightgray",
    borderRadius: 30,
    padding: 20,
    marginVertical: 10,
    overflow: "hidden",
  },
  name:{
  },
  toprow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
  },
  bottomrow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginTop: 40
  },
  pickup: {
    fontWeight: "bold"
  },
  dropoff: {
    fontWeight: "bold"
  }, details: {
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
  },
  expandedContainer: {
    height: 450,
  },
  map: {
    marginTop: 10,
    width: "85%",
    height: 250,
    alignSelf: "center",
    borderRadius: 30,
    marginBottom: 30,
  },
  durationText: {
    alignSelf: "center",
    fontWeight: "bold"
  },
  bottomContainer: {
    bottom: 0,
    width: "100%",
    height: 110,
    backgroundColor: "#CC0033"
  },
  ridesBottomContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  continueButton: {
    backgroundColor: '#CC0033', 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: "white",
    fontWeight: "bold"
  }
});
