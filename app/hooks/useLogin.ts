'use client';

import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { setLoading, setUser } from '../store/(auth)/authSlice';
import { useAppDispatch } from '../store/hooks';
import { UserProfile } from '@/types/auth-types'; // Ensure correct path

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const performLogin = async (email: string, password: string) => {
    dispatch(setLoading(true));
    try {
      // 1. Firebase Auth SignIn
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Fetch User Data from Firestore
      const snap = await getDoc(doc(db, "users", uid));
      
      if (!snap.exists()) {
        throw new Error("No record found. Please sign up first.");
      }

      // Casting to UserProfile to avoid TypeScript errors
      const userData = snap.data() as UserProfile;

      // 🔥 FIX: Manual assignment of uid to ensure it matches UserProfile type expectations
      dispatch(setUser({ 
        ...userData, 
        uid: uid // explicitly passing uid here to fix the spread type mismatch
      }));
      
      // 3. Smart Routing Logic
      if (!userData.isProfileComplete) {
        router.replace('/profile');
      } else {
        const target = userData.role === 'admin' ? '/admin-dashboard' : '/dashboard';
        router.replace(target);
      }

    } catch (error: any) {
      let msg = error.message;
      if (error.code === 'auth/user-not-found') msg = "Pehle signup karein, account nahi mila.";
      if (error.code === 'auth/wrong-password') msg = "Password galat hai.";
      alert("Login Error: " + msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { performLogin };
}