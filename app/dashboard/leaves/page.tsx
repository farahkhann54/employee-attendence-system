'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Clock, CheckCircle, XCircle, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const q = query(collection(db, "leaves"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setLeaveHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    if (editingId) {
      await updateDoc(doc(db, "leaves", editingId), { ...formData });
    } else {
      await addDoc(collection(db, "leaves"), { userId: user.uid, userName: user.name, ...formData, status: "pending", createdAt: serverTimestamp() });
    }
    setIsSaving(false);
    setEditingId(null);
    setFormData({ reason: "", startDate: "", endDate: "", type: "Sick Leave" });
  };

  const handleEditClick = (leave: any) => {
    // PREVENT EDITING IF NOT PENDING
    if (leave.status !== 'pending') return;
    
    setSelectedLeave(null);
    setEditingId(leave.id);
    setFormData({ reason: leave.reason, startDate: leave.startDate, endDate: leave.endDate, type: leave.type });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <DashboardLayout activeTab="leaves">
      {/* Detail Slide-Over Panel */}
      <AnimatePresence>
        {selectedLeave && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex justify-end">
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto">
              <button onClick={() => setSelectedLeave(null)} className="mb-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-6">Leave Details</h2>
              <div className="space-y-6">
                <div><label className="text-[10px] uppercase font-bold text-slate-400">Type</label><p className="font-bold">{selectedLeave.type}</p></div>
                <div><label className="text-[10px] uppercase font-bold text-slate-400">Duration</label><p className="font-bold">{selectedLeave.startDate} — {selectedLeave.endDate}</p></div>
                <div><label className="text-[10px] uppercase font-bold text-slate-400">Reason</label><p className="font-bold text-slate-600 leading-relaxed">{selectedLeave.reason}</p></div>
                <div><label className="text-[10px] uppercase font-bold text-slate-400">Status</label><div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-black uppercase">{selectedLeave.status}</div></div>
                
                {/* CONDITIONAL EDIT BUTTON */}
                {selectedLeave.status === 'pending' && (
                  <button onClick={() => handleEditClick(selectedLeave)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Edit Request</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className={`p-6 rounded-2xl border transition-all ${editingId ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
          <h2 className="font-black mb-4">{editingId ? "Update Request" : "New Leave Request"}</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
             <select className="col-span-2 bg-white text-sm font-bold p-3 rounded-xl border border-slate-200" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option>Sick Leave</option><option>Casual Leave</option><option>Emergency</option>
             </select>
             <input type="date" required className="bg-white text-sm font-bold p-3 rounded-xl border border-slate-200" onChange={(e) => setFormData({...formData, startDate: e.target.value})} value={formData.startDate} />
             <input type="date" required className="bg-white text-sm font-bold p-3 rounded-xl border border-slate-200" onChange={(e) => setFormData({...formData, endDate: e.target.value})} value={formData.endDate} />
          </div>
          <textarea required rows={2} className="w-full bg-white text-sm font-bold p-3 rounded-xl border border-slate-200 mb-3" placeholder="Reason..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
          <button className={`w-full py-3 rounded-xl font-black text-xs uppercase ${editingId ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
            {isSaving ? <Loader2 className="animate-spin" /> : <>{editingId ? "Save Changes" : "Submit"}</>}
          </button>
        </form>

        {/* History */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {leaveHistory.map((leave) => (
            <div key={leave.id} onClick={() => setSelectedLeave(leave)} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${leave.status === 'approved' ? 'bg-emerald-100' : leave.status === 'rejected' ? 'bg-rose-100' : 'bg-amber-100'}`}>
                   {leave.status === 'approved' ? <CheckCircle size={16} /> : leave.status === 'rejected' ? <XCircle size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <p className="font-black text-sm">{leave.type}</p>
                  <p className="text-[10px] font-bold text-slate-400">{leave.startDate} to {leave.endDate}</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}