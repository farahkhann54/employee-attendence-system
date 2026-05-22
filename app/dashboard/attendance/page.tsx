'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot, getDoc } from 'firebase/firestore';
import { Clock, Coffee, LogOut, CheckCircle, ArrowRight, Loader2, Play, PauseCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AttendancePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [status, setStatus] = useState<'idle' | 'checked-in' | 'on-break' | 'loading'>('loading');
  const [actionLoading, setActionLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setMounted(true);
    if (!user?.uid) { setStatus('idle'); return; }

    const docId = `${user.uid}_${today}`;
    const docRef = doc(db, "attendance", docId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.checkOut) setStatus('idle');
        else if (data.breakStart && !data.breakEnd) setStatus('on-break');
        else if (data.checkIn) setStatus('checked-in');
        else setStatus('idle');
      } else {
        setStatus('idle');
      }
    });

    return () => unsubscribe();
  }, [user, today]);

  const handleAction = async (action: string) => {
    if (!user?.uid) return;
    setActionLoading(true);
    const docRef = doc(db, "attendance", `${user.uid}_${today}`);

    try {
      if (action === 'check-in') {
        await setDoc(docRef, { userId: user.uid, userName: user.name || "Employee", date: today, checkIn: serverTimestamp(), status: 'Present' }, { merge: true });
      } else if (action === 'break-start') {
        await updateDoc(docRef, { breakStart: serverTimestamp(), breakEnd: null });
      } else if (action === 'break-end') {
        await updateDoc(docRef, { breakEnd: serverTimestamp() });
      } else if (action === 'check-out') {
        await updateDoc(docRef, { checkOut: serverTimestamp() });
      }
    } catch (err) {
      console.error("Action Failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout activeTab="attendance">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Attendance Portal</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your daily work shift status</p>
        </div>

        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${status === 'checked-in' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                <Clock size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                <h3 className="text-2xl font-black capitalize text-slate-900">{status.replace('-', ' ')}</h3>
              </div>
            </div>

            <div className="flex gap-3">
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleAction('check-in')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                    <CheckCircle size={20} /> Check In
                  </motion.button>
                )}
                
                {status === 'checked-in' && (
                  <>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleAction('break-start')} className="bg-amber-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-600">
                      <PauseCircle size={20} /> Break
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleAction('check-out')} className="bg-rose-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-600">
                      <LogOut size={20} /> Check Out
                    </motion.button>
                  </>
                )}

                {status === 'on-break' && (
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleAction('break-end')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700">
                    <Play size={20} /> Resume Work
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Informational Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
             <h4 className="font-bold text-slate-900 mb-2">Tips for Attendance</h4>
             <ul className="text-sm text-slate-500 space-y-2 list-disc pl-4">
               <li>Ensure you check in as soon as you start your day.</li>
               <li>Always remember to check out to log your total hours accurately.</li>
               <li>Use the "Break" button to pause your session during lunch.</li>
             </ul>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white flex flex-col justify-center">
             <h4 className="font-bold text-lg">Did you know?</h4>
             <p className="text-indigo-100 text-sm mt-1">Consistent attendance tracking helps you monitor your productivity patterns over time.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}