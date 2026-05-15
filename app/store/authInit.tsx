'use client'
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { onAuthStateChanged } from "firebase/auth";
import { setLoading, setUser } from "./(auth)/authSlice";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserProfile } from "@/types/auth-types";
import { usePresence } from "../hooks/usePresence";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  usePresence();

  useEffect(() => {
    // onAuthStateChanged listener start ho raha hai
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      dispatch(setLoading(true));

      if (firebaseUser) {
        try {
          // 1. Pehle Firestore se user ka pura data (role, status) uthao
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (snap.exists()) {
            const userData = snap.data() as UserProfile;
            // 2. Redux mein pura profile set karo
            dispatch(setUser({
              ...userData,
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              
            }));
          } else {
            // Agar Firestore mein data nahi hai (sirf auth hai)
            dispatch(setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                role: 'employee',
                isProfileComplete: false
            }));
          }
        } catch (error) {
          console.error("Auth Init Error:", error);
          dispatch(setUser(null));
        }
      } else {
        // User logged out hai
        dispatch(setUser(null));
      }
      
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}