import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCG79RqjZXnkNJCY9epsFYZKpazZWox1P4",
  authDomain: "rulate-3ab77.firebaseapp.com",
  projectId: "rulate-3ab77",
  storageBucket: "rulate-3ab77.firebasestorage.app",
  messagingSenderId: "430150519907",
  appId: "1:430150519907:web:9c6e55bcd65d2a34f53c56",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app); 

export { auth, db };