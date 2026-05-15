import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { useAppDispatch } from '../store/hooks';
import { logout, setLoading } from '../store/(auth)/authSlice';

export function useSignup() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const registerUser = async (email: string, password: string) => {
    dispatch(setLoading(true));
    try {
      // 1. Create Auth User
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      const role = email.toLowerCase() === "admin@gmail.com" ? "admin" : "employee";
      
      const userData = {
        uid: res.user.uid,
        email: email.toLowerCase(),
        role: role,
        isProfileComplete: false,
        createdAt: new Date().toISOString()
      };

      // 2. Save in Firestore
      await setDoc(doc(db, "users", res.user.uid), userData);

      // 3. Force Logout (Firebase auto-logs in on signup)
      await signOut(auth); 
      dispatch(logout()); 
      
      alert("Registration Successful! Please login to continue.");
      router.replace('/login');

    } catch (err: any) {
      alert("Signup Error: " + err.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { registerUser };
}