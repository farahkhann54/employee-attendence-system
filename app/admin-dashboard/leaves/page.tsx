'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Check, X, Clock, CalendarDays, AlertCircle, History, Inbox, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [view, setView] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    const leavesRef = collection(db, "leaves");
    
    const q = view === 'pending' 
      ? query(
          leavesRef, 
          where("status", "==", "pending"),
          orderBy("createdAt", "desc")
        )
      : query(
          leavesRef, 
          where("status", "in", ["approved", "rejected"]),
          orderBy("actionedAt", "desc")
        );

    const unsub = onSnapshot(q, (snap) => {
      setLeaves(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Firestore Query Error:", error);
    });

    return () => unsub();
  }, [view]);

  const handleStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const leaveRef = doc(db, "leaves", id);
      
      await updateDoc(leaveRef, { 
        status: newStatus,
        actionedAt: new Date(),
        isPending: false
      });

      toast.success(`Request ${newStatus} ho gayi!`);
    } catch (e) {
      toast.error("Status update fail ho gaya.");
    }
  };

  return (
    <DashboardLayout activeTab="manage-leaves">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Leave {view === 'pending' ? 'Requests' : 'Archive'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {view === 'pending' ? 'Manage new requests.' : 'Review past decisions.'}
          </p>
        </div>

        <div className="bg-slate-100 p-1.5 rounded-3xl flex items-center shadow-inner">
          <button 
            onClick={() => setView('pending')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Inbox size={14} /> Pending
          </button>
          <button 
            onClick={() => setView('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <History size={14} /> History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {leaves.length > 0 ? (
            leaves.map((leave) => (
              <motion.div 
                layout
                key={leave.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner ${
                    leave.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                    leave.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {leave.status === 'approved' ? <Check size={28}/> : leave.status === 'rejected' ? <X size={28}/> : <Clock size={28} />}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{leave.userName}</h4>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black uppercase rounded-full">{leave.type}</span>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-full">{leave.startDate} - {leave.endDate}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-3 font-medium italic">"{leave.reason}"</p>
                  </div>
                </div>

                {view === 'pending' ? (
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleStatus(leave.id, 'rejected')} className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-600 hover:text-white transition-all">Reject</button>
                    <button onClick={() => handleStatus(leave.id, 'approved')} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center gap-2">Approve <ChevronRight size={14}/></button>
                  </div>
                ) : (
                  <div className="text-right px-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Decision Date</p>
                    <p className="text-xs font-bold text-slate-500">{leave.actionedAt?.toDate ? leave.actionedAt.toDate().toLocaleDateString() : 'N/A'}</p>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
               <p className="text-slate-300 font-black text-xs uppercase tracking-widest">No {view} requests found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}