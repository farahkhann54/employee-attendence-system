import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAi0UjbmuvkADp9Sl1LG05cIhDqrFnWC8Y",
  authDomain: "employee-attendence-syst-71968.firebaseapp.com",
  projectId: "employee-attendence-syst-71968",
  storageBucket: "employee-attendence-syst-71968.firebasestorage.app",
  messagingSenderId: "186842098953",
  appId: "1:186842098953:web:7a1cf88105266b657cf7d8"
};

// Next.js mein hot reloading ke waqt app ko baar baar initialize hone se rokne ke liye:
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Services ko export karein taakay baqi components mein use ho sakein
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;