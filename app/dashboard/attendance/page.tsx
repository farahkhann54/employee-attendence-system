'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Clock, LogOut, CheckCircle, Loader2, Play, PauseCircle, Lightbulb, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Status = 'idle' | 'checked-in' | 'on-break' | 'loading';

const formatDuration = (ms: number) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const STATUS_LABEL: Record<Status, string> = {
  idle: 'Idle',
  'checked-in': 'Checked In',
  'on-break': 'On Break',
  loading: 'Loading',
};

export default function AttendancePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [status, setStatus] = useState<Status>('loading');
  const [actionLoading, setActionLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null); // current running session start (ms)
  const [bankedMs, setBankedMs] = useState(0); // hours already accumulated today from finished sessions
  const [elapsed, setElapsed] = useState('0h 0m');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setMounted(true);
    if (!user?.uid) { setStatus('idle'); return; }

    const docRef = doc(db, "attendance", `${user.uid}_${today}`);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBankedMs(typeof data.workedMs === 'number' ? data.workedMs : 0);

        if (data.checkOut) {
          setStatus('idle');
          setSessionStart(null);
        } else if (data.breakStart && !data.breakEnd) {
          setStatus('on-break');
          setSessionStart(data.checkIn ? data.checkIn.toDate().getTime() : null);
        } else if (data.checkIn) {
          setStatus('checked-in');
          setSessionStart(data.checkIn.toDate().getTime());
        } else {
          setStatus('idle');
          setSessionStart(null);
        }
      } else {
        setStatus('idle');
        setSessionStart(null);
        setBankedMs(0);
      }
    });

    return () => unsubscribe();
  }, [user, today]);

  // Live timer = hours already banked today + the currently running session.
  useEffect(() => {
    const compute = () => {
      const live = sessionStart != null ? Date.now() - sessionStart : 0;
      setElapsed(formatDuration(bankedMs + live));
    };
    compute();
    if (sessionStart == null) return; // not running -> show the banked total, no ticking
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [sessionStart, bankedMs]);

  const handleAction = async (action: string) => {
    if (!user?.uid) return;
    setActionLoading(true);
    const docRef = doc(db, "attendance", `${user.uid}_${today}`);

    try {
      if (action === 'check-in') {
        // Reset checkOut/break fields so a fresh session starts (allows re-check-in same day).
        await setDoc(
          docRef,
          {
            userId: user.uid,
            userName: user.name || "Employee",
            date: today,
            checkIn: serverTimestamp(),
            checkOut: null,
            breakStart: null,
            breakEnd: null,
            status: 'Present',
          },
          { merge: true },
        );
      } else if (action === 'break-start') {
        await updateDoc(docRef, { breakStart: serverTimestamp(), breakEnd: null });
      } else if (action === 'break-end') {
        await updateDoc(docRef, { breakEnd: serverTimestamp() });
      }
    } catch (err) {
      console.error("Action Failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Check out + submit the daily report (sent to admin) in one step.
  const handleCheckoutWithReport = async () => {
    if (!user?.uid || !reportText.trim()) return;
    setActionLoading(true);
    try {
      const sessionMs = sessionStart != null ? Date.now() - sessionStart : 0;
      await updateDoc(doc(db, "attendance", `${user.uid}_${today}`), {
        checkOut: serverTimestamp(),
        workedMs: bankedMs + sessionMs, // accumulate this session into the day's total
        report: reportText.trim(),
        reportedAt: serverTimestamp(),
      });
      setShowReportModal(false);
      setReportText('');
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!mounted) return null;

  const isCheckedIn = status === 'checked-in';
  const isOnBreak = status === 'on-break';
  const isActiveSession = isCheckedIn || isOnBreak;

  return (
    <DashboardLayout activeTab="attendance">
      {/* Daily report modal (shown on check out) */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => !actionLoading && setShowReportModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Daily Report</h2>
                    <p className="text-xs font-medium text-slate-500">Summarize today&apos;s work before checking out.</p>
                  </div>
                </div>
                <button onClick={() => !actionLoading && setShowReportModal(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <textarea
                autoFocus
                rows={6}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="What did you work on today? List tasks completed, progress, and any blockers..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

              <div className="mt-5 flex items-center justify-end gap-3">
                <button onClick={() => setShowReportModal(false)} disabled={actionLoading} className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 disabled:opacity-60">
                  Cancel
                </button>
                <button onClick={handleCheckoutWithReport} disabled={actionLoading || !reportText.trim()} className="flex items-center gap-2 rounded-2xl bg-rose-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-rose-600 disabled:opacity-50">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  Submit &amp; Check Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Attendance Portal</h1>
          <p className="mt-1 font-medium text-slate-500">Manage your daily work shift status.</p>
        </div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-5">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${isCheckedIn ? 'bg-emerald-50 text-emerald-600' : isOnBreak ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                <Clock size={32} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</p>
                <h3 className="text-3xl font-black text-slate-900">{STATUS_LABEL[status]}</h3>
                {(isActiveSession || bankedMs > 0) && (
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Today&apos;s hours: <span className="font-black text-indigo-600">{elapsed}</span>
                    {isActiveSession && <span className="ml-2 text-xs font-bold text-emerald-600">• running</span>}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.button key="in" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} disabled={actionLoading} onClick={() => handleAction('check-in')} className="flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-60">
                    {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />} Check In
                  </motion.button>
                )}

                {isCheckedIn && (
                  <React.Fragment key="active">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} disabled={actionLoading} onClick={() => handleAction('break-start')} className="flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 font-bold text-white transition-colors hover:bg-amber-600 disabled:opacity-60">
                      <PauseCircle size={20} /> Break
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} disabled={actionLoading} onClick={() => setShowReportModal(true)} className="flex items-center gap-2 rounded-2xl bg-rose-500 px-6 py-4 font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-60">
                      <LogOut size={20} /> Check Out
                    </motion.button>
                  </React.Fragment>
                )}

                {isOnBreak && (
                  <motion.button key="resume" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} disabled={actionLoading} onClick={() => handleAction('break-end')} className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60">
                    <Play size={20} /> Resume Work
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Info grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="mb-3 font-black text-slate-900">Tips for Attendance</h4>
            <ul className="space-y-2 pl-5 text-sm text-slate-500 [list-style:disc]">
              <li>Check in as soon as you start your day.</li>
              <li>Always check out to log your total hours accurately.</li>
              <li>Use the &quot;Break&quot; button to pause your session during lunch.</li>
            </ul>
          </div>
          <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white shadow-sm">
            <Lightbulb className="mb-2 h-6 w-6 text-indigo-200" />
            <h4 className="text-lg font-bold">Did you know?</h4>
            <p className="mt-1 text-sm text-indigo-100">Consistent attendance tracking helps you monitor your productivity patterns over time.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
