'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query, where, type Unsubscribe } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, ArrowRight, Shield, Target, User, Users } from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';

type ActiveStaff = {
  id: string;
  name: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({ totalEmployees: 0, pendingLeaves: 0, activeNow: 0 });
  const [activeStaff, setActiveStaff] = useState<ActiveStaff[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const today = new Date().toISOString().split('T')[0];
    const unsubscribers: Unsubscribe[] = [];

    unsubscribers.push(
      onSnapshot(collection(db, 'users'), (snap) => {
        setStats((prev) => ({ ...prev, totalEmployees: snap.docs.filter((entry) => entry.id !== user.uid).length }));
      })
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'leaves'), where('status', '==', 'pending')), (snap) => {
        setStats((prev) => ({ ...prev, pendingLeaves: snap.docs.length }));
      })
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'attendance'), where('date', '==', today)), (snap) => {
        const active = snap.docs
          .filter((entry) => entry.data().checkIn && !entry.data().checkOut && entry.data().userId !== user.uid)
          .map((entry) => ({ id: entry.id, name: entry.data().userName || 'Staff' }));

        setActiveStaff(active);
        setStats((prev) => ({ ...prev, activeNow: active.length }));
      })
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user]);

  const navCards = useMemo(
    () => [
      { label: 'Employees', value: stats.totalEmployees, icon: Users, color: 'from-indigo-500 to-violet-600', path: '/admin-dashboard/users' },
      { label: 'Active now', value: stats.activeNow, icon: Activity, color: 'from-emerald-500 to-teal-600', path: '/admin-dashboard/attendance' },
      { label: 'Pending leaves', value: stats.pendingLeaves, icon: Target, color: 'from-amber-500 to-orange-600', path: '/admin-dashboard/leaves' },
      { label: 'System health', value: '98%', icon: Shield, color: 'from-slate-700 to-slate-950', path: '/admin-dashboard' },
    ],
    [stats.activeNow, stats.pendingLeaves, stats.totalEmployees]
  );

  return (
    <DashboardLayout activeTab="admin-dashboard">
      <div className="flex flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/60 bg-white/95 p-6 text-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.10),transparent_20%)]" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-indigo-700">
                  Live control
                </div>
                <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-slate-400">Admin overview</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Command Center</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Keep an eye on the workforce, track pending requests, and move into operational views from a polished central hub.
                </p>
              </div>

              <button
                onClick={() => router.push('/admin-dashboard/users')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition-all hover:bg-slate-800"
              >
                Open employee list
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {navCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.button
                key={card.label}
                whileHover={{ y: -4 }}
                onClick={() => router.push(card.path)}
                className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5 text-left shadow-[0_16px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                  <Icon size={20} />
                </div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-slate-400">{card.label}</p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{card.value}</h3>
                <p className="mt-2 text-sm text-slate-500">Real-time metric {index + 1}</p>
              </motion.button>
            );
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Performance</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Weekly trend</h2>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                Updated live
              </div>
            </div>

            <div className="mt-5 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{ n: 18 }, { n: 42 }, { n: 37 }, { n: 71 }, { n: 63 }, { n: 94 }, { n: 88 }]}>
                  <defs>
                    <linearGradient id="adminTrendGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="n" stroke="#4f46e5" strokeWidth={4} fill="url(#adminTrendGlow)" />
                  <Tooltip contentStyle={{ borderRadius: '18px', border: 'none', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04 }}
            className="rounded-[2rem] border border-slate-950 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/45">Live staff</p>
                <h2 className="mt-1 text-xl font-black">Currently active</h2>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/70">
                {activeStaff.length} online
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {activeStaff.length > 0 ? (
                activeStaff.map((staff, index) => (
                  <motion.div
                    key={staff.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="flex items-center gap-4 rounded-[1.3rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{staff.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-emerald-300">Checked in</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-[1.3rem] border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm text-white/55">
                  No active activity right now.
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </DashboardLayout>
  );
}