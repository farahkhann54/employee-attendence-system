'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { setLoading, setUser } from '../store/(auth)/authSlice';
import { useAppDispatch } from '../store/hooks';
import { UserProfile } from '@/types/auth-types'; // Ensure correct path

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginError, setLoginError] = useState<string | null>(null);

  const resolveRoleFromEmail = (email: string | null) => {
    return email?.toLowerCase() === "clark@admin.com" ? "admin" : "employee";
  };

  const performLogin = async (email: string, password: string) => {
    setLoginError(null);
    dispatch(setLoading(true));
    try {
      // 1. Firebase Auth SignIn
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Fetch User Data from Firestore
      const snap = await getDoc(doc(db, "users", uid));
      
      if (!snap.exists()) {
        // The hardcoded admin (clark@admin.com) has no profile doc — log straight into the
        // admin dashboard. Other new accounts go through profile completion first.
        const role = resolveRoleFromEmail(userCredential.user.email || email);
        const isAdmin = role === 'admin';
        dispatch(setUser({
          uid,
          email: userCredential.user.email || email,
          name: isAdmin ? 'Admin' : undefined,
          role,
          isProfileComplete: isAdmin,
        }));
        router.replace(isAdmin ? '/admin-dashboard' : '/profile');
        return;
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

    } catch (error: unknown) {
      let msg = "Unable to sign in right now. Please try again.";
      const code = error instanceof FirebaseError ? error.code : '';

      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        msg = "No account found for this email. Please sign up first.";
      }
      if (code === 'auth/wrong-password') {
        msg = "Incorrect password. Please try again.";
      }
      if (code === 'auth/too-many-requests') {
        msg = "Too many attempts. Please wait a moment and try again.";
      }
      setLoginError(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { performLogin, loginError, clearLoginError: () => setLoginError(null) };
}