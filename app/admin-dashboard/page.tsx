'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Activity, Target, Shield, User } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAppSelector } from '@/app/store/hooks';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({ totalEmployees: 0, pendingLeaves: 0, activeNow: 0 });
  const [activeStaff, setActiveStaff] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    onSnapshot(collection(db, "users"), (snap) => {
      setStats(prev => ({ ...prev, totalEmployees: snap.docs.filter(d => d.id !== user.uid).length }));
    });

    onSnapshot(query(collection(db, "leaves"), where("status", "==", "pending")), (snap) => {
      setStats(prev => ({ ...prev, pendingLeaves: snap.docs.length }));
    });

    const qAttend = query(collection(db, "attendance"), where("date", "==", today));
    onSnapshot(qAttend, (snap) => {
      const active = snap.docs
        .filter(d => d.data().checkIn && !d.data().checkOut && d.data().userId !== user.uid)
        .map(d => ({ id: d.id, name: d.data().userName || "Staff" }));
      setActiveStaff(active);
      setStats(prev => ({ ...prev, activeNow: active.length }));
    });
  }, [user]);

  const navCards = [
    { label: "Staff", value: stats.totalEmployees, icon: Users, color: "from-indigo-500 to-blue-600", path: "/admin-dashboard/users" },
    { label: "Active", value: stats.activeNow, icon: Activity, color: "from-emerald-500 to-teal-600", path: "/admin-dashboard/attendance" },
    { label: "Pending", value: stats.pendingLeaves, icon: Target, color: "from-orange-500 to-amber-600", path: "/admin-dashboard/leaves" },
    { label: "System", value: "98%", icon: Shield, color: "from-violet-500 to-purple-600", path: "/admin-dashboard" },
  ];

  return (
    <DashboardLayout activeTab="admin-dashboard">
      <div className="flex flex-col gap-6 p-1">
        
        {/* HEADER */}
        <div>
            <h1 className="text-3xl font-black text-slate-900">Admin Command Center</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Real-time operational overview</p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-4 gap-6">
          {navCards.map((s, i) => (
            <motion.div whileHover={{ y: -5 }} key={i} onClick={() => router.push(s.path)} 
              className="cursor-pointer bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4`}>
                <s.icon size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{s.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-3 gap-6 h-[400px]">
          
          <div className="col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col">
             <h4 className="font-black text-slate-900">Weekly Performance</h4>
             <div className="flex-1 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{n:20},{n:50},{n:40},{n:80},{n:60},{n:100}]}>
                    <defs>
                      <linearGradient id="colorG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="n" stroke="#6366f1" strokeWidth={4} fill="url(#colorG)" />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="col-span-1 bg-slate-900 rounded-[2.5rem] p-6 flex flex-col text-white shadow-xl">
             <h4 className="font-black mb-6 px-2">Live Staff</h4>
             <div className="flex-1 overflow-y-auto space-y-3">
                {activeStaff.length > 0 ? activeStaff.map((staff) => (
                  <div key={staff.id} className="p-4 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/5">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black">{staff.name}</p>
                      {/* Highlighted Status Check-in */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Check-in</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-slate-500 text-xs py-10 font-bold">No active activity</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}