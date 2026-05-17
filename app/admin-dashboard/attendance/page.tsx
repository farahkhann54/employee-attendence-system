'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { db } from '@/services/firebase';
import { useAppSelector } from '@/app/store/hooks';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Calendar, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function AdminAttendance() {
  const [logs, setLogs] = useState<any[]>([]);
  const { user: authUser } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const q = query(collection(db, "attendance"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Admin ko attendance list se nikaalne ke liye filter
  const filteredLogs = logs.filter(log => log.userId !== authUser?.uid);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '--:--';
    // Check if it's a Firebase Timestamp or a Date object
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout activeTab="manage-attendance">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Staff Attendance</h1>
          <p className="text-slate-500 font-medium mt-1">Detailed logs of all personnel check-ins and check-outs.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <Calendar className="text-indigo-600" size={18} />
          <span className="font-bold text-sm text-slate-600">{new Date().toLocaleDateString('en-GB')}</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Date</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/30 transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black">
                      <User size={14} />
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight">{log.userName || 'Unknown Member'}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center text-sm font-bold text-slate-500">{log.date}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                    <ArrowDownLeft size={14}/> {formatTime(log.checkIn)}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-rose-500 font-black text-sm">
                    <ArrowUpRight size={14}/> {formatTime(log.checkOut)}
                  </div>
                </td>
                <td className="px-8 py-6">
                  {log.checkOut ? (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-full">Completed</span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase rounded-full animate-pulse">On Duty</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}