'use client';
import { useEffect } from 'react';
import { db } from '@/services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAppSelector } from '@/app/store/hooks';

export function usePresence() {
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;

    const userStatusRef = doc(db, 'status', user.uid);

    const updateStatus = (state: 'online' | 'idle' | 'offline') => {
      setDoc(userStatusRef, {
        state: state,
        lastChanged: serverTimestamp(),
      }, { merge: true });
    };

    const handleVisibilityChange = () => {
      // Jab tab switch ho to 'idle', wapis aayein to 'online'
      updateStatus(document.visibilityState === 'visible' ? 'online' : 'idle');
    };

    // Initial Online
    updateStatus('online');

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', () => updateStatus('offline'));

    return () => {
      updateStatus('offline');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);
}