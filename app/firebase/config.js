// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Auth ke liye import
import { getFirestore } from "firebase/firestore"; // Firestore ke liye import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAi0UjbmuvkADp9Sl1LG05cIhDqrFnWC8Y",
  authDomain: "employee-attendence-syst-71968.firebaseapp.com",
  projectId: "employee-attendence-syst-71968",
  storageBucket: "employee-attendence-syst-71968.firebasestorage.app",
  messagingSenderId: "186842098953",
  appId: "1:186842098953:web:7a1cf88105266b657cf7d8"
};

// Initialize Firebase (Next.js/SSR safe way)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Auth aur DB ko initialize karen
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;