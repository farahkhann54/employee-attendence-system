'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';
import { collection, onSnapshot, doc, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { usePresence } from '../hooks/usePresence';
import { Zap, ChevronRight, LayoutDashboard, Target, Users, ShieldCheck } from 'lucide-react';

export default function MainDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  usePresence();
  
  const [mounted, setMounted] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'idle' | 'active' | 'break'>('idle');
  const [shiftDuration, setShiftDuration] = useState('00h 00m');
  const [liveStaff, setLiveStaff] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    const unsubMyStatus = onSnapshot(doc(db, "attendance", `${user.uid}_${today}`), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.checkOut) setCurrentStatus('idle');
        else if (data.breakStart && !data.breakEnd) setCurrentStatus('break');
        else if (data.checkIn) {
          setCurrentStatus('active');
          const diff = new Date().getTime() - data.checkIn.toDate().getTime();
          setShiftDuration(`${Math.floor(diff/3600000)}h ${Math.floor((diff%3600000)/60000)}m`);
        }
      }
    });

    const unsubLive = onSnapshot(collection(db, "status"), () => {
      getDocs(collection(db, "attendance")).then(attendSnap => {
        getDocs(collection(db, "users")).then(userSnap => {
          const active = userSnap.docs
            .map(d => ({ uid: d.id, ...d.data() }))
            .filter(u => attendSnap.docs.some(a => a.data().userId === u.uid && a.data().date === today && !a.data().checkOut));
          
          active.sort((a, b) => (a.uid === user.uid ? -1 : b.uid === user.uid ? 1 : 0));
          setLiveStaff(active);
        });
      });
    });

    return () => { unsubMyStatus(); unsubLive(); };
  }, [user]);

  if (!mounted) return null;

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="h-[calc(100vh-100px)] flex flex-col gap-6 p-1">
        
        {/* VIBRANT HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 text-white">
           <div className="relative z-10 flex justify-between items-end">
              <div>
                 <h1 className="text-4xl font-black tracking-tighter">Hello, {user?.name?.split(' ')[0]}!</h1>
                 <p className="text-indigo-100 font-medium mt-2 opacity-80">Welcome to your high-performance operations hub.</p>
              </div>
              {currentStatus !== 'idle' && (
                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-4">
                  <Zap className="text-yellow-300" size={20} />
                  <div>
                    <p className="text-[9px] uppercase font-bold opacity-70">Active Session</p>
                    <p className="font-black text-lg">{shiftDuration}</p>
                  </div>
                </div>
              )}
           </div>
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* MAIN GRID */}
        <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
          
          <div className="col-span-2 flex flex-col gap-6 min-h-0">
            {/* STATS */}
            <div className="grid grid-cols-4 gap-4">
              {[ {label:'Attendance', val:'Sync', icon:LayoutDashboard, c:'from-blue-500'}, {label:'Leaves', val:'Manage', icon:Target, c:'from-rose-500'}, {label:'Status', val:'Online', icon:Users, c:'from-emerald-500'}, {label:'Security', val:'Safe', icon:ShieldCheck, c:'from-violet-500'}].map((s, i) => (
                <div key={i} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className={`w-10 h-10 mb-4 rounded-xl bg-gradient-to-br ${s.c} to-slate-900 flex items-center justify-center text-white`}>
                    <s.icon size={18} />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <h3 className="text-lg font-black text-slate-900">{s.val}</h3>
                </div>
              ))}
            </div>

            {/* LIVE LIST */}
            <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col min-h-0 shadow-sm">
              <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Personnel Live
              </h4>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {liveStaff.map((m) => (
                  <div key={m.uid} className={`p-4 rounded-2xl flex items-center justify-between transition-all ${m.uid === user?.uid ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${m.uid === user?.uid ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                      <p className="font-bold text-sm">{m.name} {m.uid === user?.uid && <span className="ml-2 text-[9px] bg-white text-indigo-600 px-2 py-0.5 rounded-lg">YOU</span>}</p>
                    </div>
                    <div className="text-[10px] font-black uppercase opacity-60">Status: Active</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TERMINAL */}
          <div className="col-span-1 bg-slate-900 rounded-[2.5rem] p-8 flex flex-col text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex-1">
                <h2 className="text-2xl font-black mb-1">Control<br/>Terminal</h2>
                <p className="text-slate-400 text-xs mb-8">Manage your shift operations.</p>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                   <p className="text-[10px] uppercase font-black text-slate-400">System Status</p>
                   <p className="text-xl font-black text-emerald-400 mt-1">{currentStatus.toUpperCase()}</p>
                </div>
             </div>
             <button 
                onClick={() => router.push('/dashboard/attendance')} 
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-lg"
             >
                Manage Session <ChevronRight size={16} />
             </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}