import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/services/firebase';
import { useAppDispatch } from '../store/hooks';
import { logout, setLoading } from '../store/(auth)/authSlice';

export function useSignup() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const registerUser = async (email: string, password: string) => {
    setSignupError(null);
    setSignupSuccess(false);
    dispatch(setLoading(true));
    try {
      // 1. Create Auth user only. Profile document is created after profile completion.
      await createUserWithEmailAndPassword(auth, email, password);

      // 2. Force logout (Firebase auto-logs in on signup)
      await signOut(auth); 
      dispatch(logout()); 

      setSignupSuccess(true);
      window.setTimeout(() => {
        router.replace('/login?signup=success');
      }, 2800);

    } catch (err: unknown) {
      let msg = "Unable to complete signup right now. Please try again.";
      const code = err instanceof FirebaseError ? err.code : '';

      if (code === 'auth/email-already-in-use') {
        msg = "This email already exists. Please login instead.";
      } else if (code === 'auth/invalid-email') {
        msg = "Please enter a valid email address.";
      } else if (code === 'auth/weak-password') {
        msg = "Password is too weak. Use at least 6 characters.";
      }
      setSignupError(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    registerUser,
    signupError,
    signupSuccess,
    clearSignupError: () => setSignupError(null),
  };
}