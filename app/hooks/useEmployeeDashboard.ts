import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { UserData, DashboardStats } from '@/types/employee-types';

export function useEmployeeDashboard(authUser: any, authLoading: boolean) {
  const router = useRouter();
  const [employeeData, setEmployeeData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ presentDays: 0, pendingTasks: 0, leaves: 0 });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.replace('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', authUser.uid));
        if (snap.exists()) {
          const data = snap.data() as UserData;
          if (data.role === 'admin') {
            router.replace('/admin-dashboard');
            return;
          }
          if (!data.isProfileComplete) {
            router.replace('/profile');
            return;
          }

          setEmployeeData(data);

          const attendQuery = query(collection(db, 'attendance'), where('userId', '==', authUser.uid));
          const leaveQuery = query(collection(db, 'leaves'), where('userId', '==', authUser.uid));
          const [attendSnap, leaveSnap] = await Promise.all([getDocs(attendQuery), getDocs(leaveQuery)]);

          setStats({ presentDays: attendSnap.size, pendingTasks: 5, leaves: leaveSnap.size });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [authUser, authLoading, router]);

  return { employeeData, stats, fetching };
}
