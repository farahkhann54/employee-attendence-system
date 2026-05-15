import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { AdminData } from '@/types/admin-types';

export function useAdminAuth(authUser: any, authLoading: boolean) {
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.replace('/login');
      return;
    }

    const verifyAdmin = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', authUser.uid));
        if (!snap.exists()) {
          router.replace('/profile');
          return;
        }

        const data = snap.data() as AdminData;

        if (data.role !== 'admin') {
          router.replace('/dashboard');
          return;
        }

        if (!data.isProfileComplete) {
          router.replace('/profile');
          return;
        }

        setAdminData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    verifyAdmin();
  }, [authUser, authLoading, router]);

  return { adminData, fetching };
}
