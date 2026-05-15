'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot, doc, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresence } from '../../hooks/usePresence'; 
import { 
  Zap, Clock, Coffee, Users, Radio, 
  ChevronRight, Moon, ShieldCheck, Activity, Monitor
} from 'lucide-react';

export default function MainDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  
  // Background Presence (Tab tracking)
  usePresence(); 

  const [mounted, setMounted] = useState(false);
  const [leaveCount, setLeaveCount] = useState(0);
  const [presentDays, setPresentDays] = useState(0);
  const [currentStatus, setCurrentStatus] = useState<'idle' | 'active' | 'break'>('idle');
  const [shiftDuration, setShiftDuration] = useState('00h 00m');
  
  const [liveStaff, setLiveStaff] = useState<any[]>([]);
  const [offlineStaff, setOfflineStaff] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    // 1. My Personal Session Listener (For timer and UI)
    const unsubMyStatus = onSnapshot(doc(db, "attendance", `${user.uid}_${today}`), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.checkOut) {
          setCurrentStatus('idle');
          setShiftDuration('00h 00m');
        } else if (data.breakStart && !data.breakEnd) {
          setCurrentStatus('break');
        } else if (data.checkIn) {
          setCurrentStatus('active');
          const startTime = data.checkIn.toDate();
          const updateTimer = () => {
            const diff = new Date().getTime() - startTime.getTime();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setShiftDuration(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`);
          };
          updateTimer();
          const id = setInterval(updateTimer, 60000);
          return () => clearInterval(id);
        }
      } else {
        setCurrentStatus('idle');
        setShiftDuration('00h 00m');
      }
    });

    // 2. 🔥 FULLY REACTIVE SYNC: Status + Attendance + Users
    const syncLiveBoard = () => {
      const qStatus = query(collection(db, "status"));
      const qAttend = query(collection(db, "attendance"), where("date", "==", today));

      // First, get all users (static reference for names/roles)
      const fetchUsersAndListen = async () => {
        const allUsersSnap = await getDocs(collection(db, "users"));
        const allUsers = allUsersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));

        // Now listen to Statuses and Attendance simultaneously
        return onSnapshot(qStatus, (statusSnap) => {
          onSnapshot(qAttend, (attendSnap) => {
            const statuses = statusSnap.docs.map(d => ({ uid: d.id, state: (d.data() as any).state, ...d.data() }));
            const attendances = attendSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const activeList: any[] = [];
            const offlineList: any[] = [];

            allUsers.forEach((u: any) => {
              const presence = statuses.find((s: any) => s.uid === u.uid);
              const attendance = attendances.find((a: any) => 
                a.userId === u.uid && a.checkIn && !a.checkOut
              );

              if (attendance) {
                activeList.push({
                  ...u,
                  presenceState: presence?.state || 'offline',
                  onBreak: !!((attendance as any).breakStart && !(attendance as any).breakEnd)
                });
              } else {
                offlineList.push(u);
              }
            });

            // Sorting: YOU > ADMIN > REST
            const sortedActive = activeList.sort((a, b) => {
              if (a.uid === user.uid) return -1;
              if (b.uid === user.uid) return 1;
              if (a.role === 'admin' && b.role !== 'admin') return -1;
              return 0;
            });

            setLiveStaff(sortedActive);
            setOfflineStaff(offlineList);
          });
        });
      };

      const unsubPromise = fetchUsersAndListen();
      return () => unsubPromise.then(unsub => unsub?.());
    };

    const unsubLive = syncLiveBoard();
    const unsubCount = onSnapshot(query(collection(db, "attendance"), where("userId", "==", user.uid)), (snap) => setPresentDays(snap.docs.length));
    const unsubLeaves = onSnapshot(query(collection(db, "leaves"), where("userId", "==", user.uid)), (snap) => setLeaveCount(snap.docs.length));

    return () => { 
      unsubMyStatus(); unsubCount(); unsubLeaves(); unsubLive();
    };
  }, [user]);

  if (!mounted) return null;

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20 px-4">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">System Live</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Welcome, <span className="text-indigo-600">{user?.name?.split(' ')[0]}</span>
            </h1>
          </div>
          
          {currentStatus !== 'idle' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 bg-white border border-slate-200 p-2 rounded-3xl shadow-xl">
              <div className={`pl-6 pr-4 py-3 rounded-2xl flex items-center gap-4 ${currentStatus === 'active' ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white'}`}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">Session Running</span>
                  <span className="text-2xl font-black tabular-nums leading-none">{shiftDuration}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                   {currentStatus === 'active' ? <Zap size={20} /> : <Coffee size={20} />}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-10">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Attendance', val: presentDays, unit: 'Days', icon: <Activity size={16}/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Leaves', val: leaveCount, unit: 'Used', icon: <Moon size={16}/>, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Security', val: 'Active', unit: 'SSL', icon: <ShieldCheck size={16}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Server', val: 'Optimal', unit: '99%', icon: <Monitor size={16}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className={`w-8 h-8 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <h3 className="text-xl font-black text-slate-900">{s.val} <span className="text-sm font-bold text-slate-400">{s.unit}</span></h3>
                </div>
              ))}
            </div>

            {/* LIVE PERSONNEL LIST */}
            <section className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personnel Live</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time hub synchronization</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {liveStaff.length > 0 ? liveStaff.map((member) => (
                    <motion.div 
                      layout key={member.uid}
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      className={`p-6 rounded-[2.5rem] border flex items-center justify-between transition-all ${
                        member.uid === user?.uid ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' :
                        member.role === 'admin' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border ${
                            member.uid === user?.uid ? 'bg-indigo-600 text-white border-transparent' :
                            member.role === 'admin' ? 'bg-white text-indigo-600 border-indigo-100' : 'bg-white text-slate-900 border-slate-200'
                          }`}>
                            {member.name?.substring(0, 2).toUpperCase()}
                          </div>
                          
                          {/* Online/Away Indicator */}
                          <div className={`absolute -top-1 -right-1 w-4 h-4 border-4 ${member.uid === user?.uid ? 'border-slate-900' : 'border-white'} rounded-full ${
                              member.presenceState === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-black tracking-tight ${member.uid === user?.uid ? 'text-white' : 'text-slate-900'}`}>{member.name}</p>
                            {member.uid === user?.uid && <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black">YOU</span>}
                            {member.role === 'admin' && member.uid !== user?.uid && <span className="text-[8px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black">ADMIN</span>}
                          </div>
                          <div className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${member.uid === user?.uid ? 'text-slate-400' : 'text-slate-500'}`}>
                            {member.onBreak ? (
                              <span className="flex items-center gap-1 text-amber-500 font-black italic"><Coffee size={10}/> In Break</span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <div className={`w-1 h-1 rounded-full ${member.presenceState === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {member.presenceState === 'online' ? 'Working' : 'Away from Tab'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                        <p className="text-slate-300 font-black italic uppercase tracking-widest text-xs">No active staff currently</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* OFFLINE LIST */}
            <section className="bg-slate-50/30 rounded-[3rem] border border-dashed border-slate-200 p-10">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 text-center opacity-60">Currently Offline</h3>
               <div className="flex flex-wrap justify-center gap-8 opacity-40">
                  {offlineStaff.map((m) => (
                    <div key={m.uid} className="flex flex-col items-center gap-3 grayscale">
                       <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center border border-slate-200 text-slate-400 font-bold text-lg shadow-sm">
                          {m.name?.substring(0, 1)}
                       </div>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{m.name?.split(' ')[0]}</span>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          {/* SIDEBAR: ACTIONS */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/30 blur-[60px] rounded-full -mr-10 -mt-10" />
                <div className="relative z-10">
                   <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                      <ShieldCheck size={24} />
                   </div>
                   <h2 className="text-2xl font-black mb-4 leading-tight">Attendance<br/>Terminal</h2>
                   <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">Clock in/out or manage your breaks. All sessions are logged in real-time.</p>
                   <button onClick={() => window.location.href='/dashboard/attendance'} className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all active:scale-95">
                      {currentStatus === 'idle' ? 'Check In' : 'Manage Session'} <ChevronRight size={16} />
                   </button>
                </div>
             </div>

             <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-2 h-2 rounded-full bg-indigo-600" />
                   <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em]">Operational News</h4>
                </div>
                <div className="space-y-8">
                   {[
                     { time: 'System', msg: 'Real-time Reactive Sync enabled.' },
                     { time: 'Staff', msg: 'Break & Check-out visibility active.' },
                   ].map((news, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-slate-100 border border-slate-200 mt-1.5" />
                        <div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{news.time}</span>
                          <p className="text-xs font-bold text-slate-600 leading-snug">{news.msg}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}