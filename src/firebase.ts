import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import getFirestore

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5pajhx8R9D7p9pHFxniUe8PtRW1q_duQ",
  authDomain: "academic-planner-83ee8.firebaseapp.com",
  projectId: "academic-planner-83ee8",
  storageBucket: "academic-planner-83ee8.firebasestorage.app",
  messagingSenderId: "827416469311",
  appId: "1:827416469311:web:9ef9c94f3610e12a427d8a",
  measurementId: "G-FRCFBCTT77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { auth, db }; // Export auth and db
