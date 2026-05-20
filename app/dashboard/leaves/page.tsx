'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { Send, Loader2, Calendar, Clock, CheckCircle, XCircle, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeavesPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isSaving, setIsSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ reason: "", startDate: "", endDate: "", type: "Sick Leave" });

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
    await addDoc(collection(db, "leaves"), { 
        userId: user.uid, 
        userName: user.name, 
        ...formData, 
        status: "pending", 
        createdAt: serverTimestamp() 
    });
    
    setIsSaving(false);
    setFormData({ reason: "", startDate: "", endDate: "", type: "Sick Leave" });
    
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
    
    // Smooth scroll to history section
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
  };

  const getStatusStyles = (status: string) => {
    if (status === 'approved') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (status === 'rejected') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  return (
    <DashboardLayout activeTab="leaves">
      {/* SUCCESS POPUP */}
      <AnimatePresence>
        {showPopup && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
            className="fixed top-32 right-10 bg-white p-6 rounded-3xl shadow-2xl border border-emerald-100 flex items-center gap-4 z-50">
            <CheckCircle2 className="text-emerald-500" size={30} />
            <div>
              <h4 className="font-black text-slate-900">Submitted!</h4>
              <p className="text-xs font-bold text-emerald-600">Application successfully sent</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* FORM SECTION */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="mb-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><FileText size={24} /></div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Apply for Leave</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submit your request below</p>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 ml-2 uppercase tracking-widest">Type of Leave</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none"
                  value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option>Sick Leave</option> <option>Casual Leave</option> <option>Emergency Leave</option>
                </select>
              </div>

              <div className="flex gap-4">
                 <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 ml-2 uppercase tracking-widest">Start</label>
                    <input type="date" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none"
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})} value={formData.startDate} />
                 </div>
                 <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 ml-2 uppercase tracking-widest">End</label>
                    <input type="date" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none"
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})} value={formData.endDate} />
                 </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black text-slate-400 ml-2 uppercase tracking-widest">Reason</label>
                <textarea required rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none"
                  placeholder="Explain your reason..." value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})} />
              </div>

              <button disabled={isSaving} className="md:col-span-2 bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Submit Application</>}
              </button>
           </form>
        </div>

        {/* LIST SECTION */}
        <div ref={listRef}> 
          <h2 className="text-xl font-black text-slate-900 mb-6 px-2">History</h2>
          <div className="space-y-4">
            {leaveHistory.map((leave, index) => (
              <motion.div 
                key={leave.id}
                initial={index === 0 ? { backgroundColor: "#fffbeb" } : {}}
                animate={index === 0 ? { backgroundColor: "#ffffff" } : {}}
                transition={{ duration: 3 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between"
              >
                 <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${getStatusStyles(leave.status)}`}>
                      {leave.status === 'approved' ? <CheckCircle size={24} /> : leave.status === 'rejected' ? <XCircle size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{leave.type}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{leave.startDate} to {leave.endDate}</p>
                    </div>
                 </div>
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(leave.status)}`}>
                    {leave.status}
                 </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}