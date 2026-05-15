'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot, getDoc } from 'firebase/firestore';
import { Clock, Coffee, LogOut, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [status, setStatus] = useState<'idle' | 'checked-in' | 'on-break' | 'loading'>('loading');
  const [actionLoading, setActionLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Date aur Document ID fix
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setMounted(true);
    
    if (!user?.uid) {
        setStatus('idle');
        return;
    }

    const docId = `${user.uid}_${today}`;
    const docRef = doc(db, "attendance", docId);

    console.log("Checking Attendance for:", docId);

    // 1. Pehle ek baar Direct Check karein (Manual Fetch)
    const initialCheck = async () => {
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          updateUIStatus(data);
        } else {
          setStatus('idle');
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setStatus('idle');
      }
    };

    initialCheck();

    // 2. Phir Real-time Listener lagayein
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        updateUIStatus(docSnap.data());
      } else {
        setStatus('idle');
      }
    }, (error) => {
      console.log("Firebase Error:", error);
    });

    return () => unsubscribe();
  }, [user, today]);

  // Status handle karne ka common function
  const updateUIStatus = (data: any) => {
    if (data.checkOut) setStatus('idle');
    else if (data.breakStart && !data.breakEnd) setStatus('on-break');
    else if (data.checkIn) setStatus('checked-in');
    else setStatus('idle');
  };

  const handleAction = async (action: string) => {
    if (!user?.uid) return;
    setActionLoading(true);
    
    const docId = `${user.uid}_${today}`;
    const docRef = doc(db, "attendance", docId);

    try {
      if (action === 'check-in') {
        await setDoc(docRef, {
          userId: user.uid,
          userName: user.name || "Employee",
          date: today,
          checkIn: serverTimestamp(),
          status: 'Present',
          breakStart: null,
          breakEnd: null,
          checkOut: null
        }, { merge: true });
      } 
      else if (action === 'break-start') {
        await updateDoc(docRef, { breakStart: serverTimestamp(), breakEnd: null });
      } 
      else if (action === 'break-end') {
        await updateDoc(docRef, { breakEnd: serverTimestamp() });
      } 
      else if (action === 'check-out') {
        await updateDoc(docRef, { checkOut: serverTimestamp() });
      }
      console.log(`${action} Successful`);
    } catch (err) {
      console.error("Action Failed:", err);
      alert("Error: Check Firebase permissions or connection.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout activeTab="attendance">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daily Attendance</h1>
            <p className="text-slate-500 font-medium mt-1">Status for: <span className="font-bold">{today}</span></p>
          </div>
          
          <div className="flex gap-3">
            {status === 'loading' ? (
              <div className="px-6 py-4 bg-slate-50 rounded-2xl flex items-center gap-2 text-slate-400 font-bold">
                <Loader2 className="animate-spin" size={18} /> Loading...
              </div>
            ) : (
              <div className="flex gap-3">
                {status === 'idle' && (
                  <button onClick={() => handleAction('check-in')} disabled={actionLoading}
                    className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-slate-200">
                    {actionLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />} Check In
                  </button>
                )}

                {status === 'checked-in' && (
                  <>
                    <button onClick={() => handleAction('break-start')} disabled={actionLoading}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2">
                      <Coffee size={18} /> Break
                    </button>
                    <button onClick={() => handleAction('check-out')} disabled={actionLoading}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2">
                      <LogOut size={18} /> Check Out
                    </button>
                  </>
                )}

                {status === 'on-break' && (
                  <button onClick={() => handleAction('break-end')} disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2">
                    <ArrowRight size={18} /> Resume
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- DYNAMIC STATUS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Clock size={24} /></div>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Attendance Status</p>
             <h3 className={`text-2xl font-black mt-1 ${status === 'checked-in' ? 'text-emerald-600' : 'text-slate-900'}`}>
               {status === 'loading' ? 'Checking...' : status === 'idle' ? 'Not Checked In' : status.replace('-', ' ')}
             </h3>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

