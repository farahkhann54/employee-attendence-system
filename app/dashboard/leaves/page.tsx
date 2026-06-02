'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Clock, CheckCircle, XCircle, X, ChevronRight, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_STYLES: Record<string, { badge: string; icon: string; ring: string }> = {
  approved: { badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-600', ring: 'bg-emerald-50' },
  rejected: { badge: 'bg-rose-100 text-rose-700', icon: 'text-rose-600', ring: 'bg-rose-50' },
  pending: { badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600', ring: 'bg-amber-50' },
};

const statusStyle = (status: string) => STATUS_STYLES[status] || STATUS_STYLES.pending;

const StatusIcon = ({ status, size = 16 }: { status: string; size?: number }) => {
  if (status === 'approved') return <CheckCircle size={size} />;
  if (status === 'rejected') return <XCircle size={size} />;
  return <Clock size={size} />;
};

export default function LeavesPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isSaving, setIsSaving] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [formData, setFormData] = useState({ reason: "", startDate: "", endDate: "", type: "Sick Leave" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "leaves"), where("userId", "==", user.uid));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tb - ta;
        });
        setLeaveHistory(items);
      },
      (error) => console.error("Failed to load leaves:", error),
    );
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "leaves", editingId), { ...formData });
      } else {
        await addDoc(collection(db, "leaves"), { userId: user.uid, userName: user.name, ...formData, status: "pending", createdAt: serverTimestamp() });
      }
      setEditingId(null);
      setFormData({ reason: "", startDate: "", endDate: "", type: "Sick Leave" });
    } catch (error) {
      console.error("Failed to submit leave:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (leave: any) => {
    if (leave.status !== 'pending') return;
    setSelectedLeave(null);
    setEditingId(leave.id);
    setFormData({ reason: leave.reason, startDate: leave.startDate, endDate: leave.endDate, type: leave.type });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
  const labelClass = "mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400";

  return (
    <DashboardLayout activeTab="leaves">
      {/* Detail slide-over */}
      <AnimatePresence>
        {selectedLeave && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm" onClick={() => setSelectedLeave(null)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.25 }} onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-md overflow-y-auto bg-white p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Leave Details</h2>
                <button onClick={() => setSelectedLeave(null)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
              </div>
              <div className="space-y-5">
                <div className={`flex items-center gap-3 rounded-2xl p-4 ${statusStyle(selectedLeave.status).ring}`}>
                  <span className={statusStyle(selectedLeave.status).icon}><StatusIcon status={selectedLeave.status} size={22} /></span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                    <p className={`text-sm font-black uppercase ${statusStyle(selectedLeave.status).icon}`}>{selectedLeave.status}</p>
                  </div>
                </div>
                <div><label className={labelClass}>Type</label><p className="font-bold text-slate-900">{selectedLeave.type}</p></div>
                <div><label className={labelClass}>Duration</label><p className="font-bold text-slate-900">{selectedLeave.startDate} — {selectedLeave.endDate}</p></div>
                <div><label className={labelClass}>Reason</label><p className="font-medium leading-relaxed text-slate-600">{selectedLeave.reason}</p></div>

                {selectedLeave.status === 'pending' && (
                  <button onClick={() => handleEditClick(selectedLeave)} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white transition-all hover:bg-slate-800">Edit Request</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Leave Management</h1>
          <p className="mt-1 font-medium text-slate-500">Request time off and track the status of your requests.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className={`rounded-3xl border p-6 shadow-sm transition-all sm:p-7 ${editingId ? 'border-indigo-200 bg-indigo-50/60' : 'border-slate-200 bg-white'}`}>
            <h2 className="mb-5 text-lg font-black text-slate-900">{editingId ? "Update Request" : "New Leave Request"}</h2>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Leave Type</label>
                <select className={inputClass} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                  <option>Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>From</label>
                  <input type="date" required className={inputClass} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} value={formData.startDate} />
                </div>
                <div>
                  <label className={labelClass}>To</label>
                  <input type="date" required className={inputClass} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} value={formData.endDate} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Reason</label>
                <textarea required rows={3} className={inputClass} placeholder="Briefly describe your reason..." value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
              </div>

              <div className="flex items-center gap-3">
                <button disabled={isSaving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 disabled:opacity-60">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save Changes" : "Submit Request"}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setFormData({ reason: "", startDate: "", endDate: "", type: "Sick Leave" }); }} className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* History */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Your Requests</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{leaveHistory.length} total</span>
            </div>

            {leaveHistory.length > 0 ? (
              <div className="space-y-2">
                {leaveHistory.map((leave) => (
                  <div key={leave.id} onClick={() => setSelectedLeave(leave)} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 transition-colors hover:border-slate-200 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusStyle(leave.status).ring} ${statusStyle(leave.status).icon}`}>
                        <StatusIcon status={leave.status} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{leave.type}</p>
                        <p className="text-[11px] font-semibold text-slate-400">{leave.startDate} → {leave.endDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wide ${statusStyle(leave.status).badge}`}>{leave.status}</span>
                      <ChevronRight className="text-slate-300" size={18} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-14 text-center">
                <Inbox className="mb-3 h-9 w-9 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">No leave requests yet</p>
                <p className="mt-1 text-xs text-slate-400">Submit your first request using the form.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
