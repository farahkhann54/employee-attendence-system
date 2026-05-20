'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Check, X, Clock, Inbox, History, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [view, setView] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    const leavesRef = collection(db, "leaves");
    const q = view === 'pending' 
      ? query(leavesRef, where("status", "==", "pending"), orderBy("createdAt", "desc"))
      : query(leavesRef, where("status", "in", ["approved", "rejected"]), orderBy("actionedAt", "desc"));

    return onSnapshot(q, (snap) => {
      setLeaves(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [view]);

  const handleStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, "leaves", id), { 
        status: newStatus,
        actionedAt: new Date(),
      });
      toast.success(`Leave ${newStatus} successfully.`);
    } catch {
      toast.error("Action failed.");
    }
  };

  return (
    <DashboardLayout activeTab="manage-leaves">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Leave Operations</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">System Administration Panel</p>
        </div>

        <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200">
          {['pending', 'history'].map((v) => (
            <button key={v} onClick={() => setView(v as any)} 
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {leaves.length > 0 ? (
            leaves.map((leave) => (
              <motion.div layout key={leave.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="group bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between hover:border-indigo-200 transition-colors">
                
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${leave.status === 'pending' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}>
                    {leave.status === 'pending' ? <Clock size={20} /> : <ShieldCheck size={20} />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{leave.userName}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{leave.type}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-[9px] font-bold text-indigo-500 uppercase">{leave.startDate} to {leave.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <p className="text-xs font-medium text-slate-500 max-w-sm truncate hidden md:block italic">"{leave.reason}"</p>
                  
                  {view === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleStatus(leave.id, 'rejected')} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
                        <X size={16} />
                      </button>
                      <button onClick={() => handleStatus(leave.id, 'approved')} className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors">
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-1.5 rounded-lg bg-slate-100 text-[10px] font-black uppercase text-slate-500">
                      {leave.status}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-slate-300 text-xs font-black uppercase tracking-widest">No entries found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}