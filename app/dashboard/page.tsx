'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowRight, Clock3, LayoutDashboard, ShieldCheck, Users, Zap, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';
import { usePresence } from '../hooks/usePresence';

type LiveStaff = {
  uid: string;
  name?: string;
};

const formatMinutes = (minutes: number) => {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

const COLORS = ['#0EA5E9', '#EC4899', '#22C55E', '#F59E0B', '#EF4444', '#A855F7'];
const CHART_COLORS = {
  present: '#06B6D4',
  absent: '#EF4444',
  onLeave: '#F59E0B',
  lateCheckin: '#8B5CF6',
  bar1: '#6366F1',
  bar2: '#F97316',
  bar3: '#EC4899',
  bar4: '#22C55E',
};

export default function MainDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  usePresence();

  const [currentStatus, setCurrentStatus] = useState<'idle' | 'active' | 'break'>('idle');
  const [shiftDuration, setShiftDuration] = useState('00h 00m');
  const [liveStaff, setLiveStaff] = useState<LiveStaff[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, onLeave: 0, lateCheckin: 0 });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const today = new Date().toISOString().split('T')[0];

    const unsubMyStatus = onSnapshot(doc(db, 'attendance', `${user.uid}_${today}`), (snap) => {
      if (!snap.exists()) {
        setCurrentStatus('idle');
        setShiftDuration('00h 00m');
        return;
      }

      const data = snap.data();
      if (data.checkOut) {
        setCurrentStatus('idle');
        setShiftDuration('00h 00m');
      } else if (data.breakStart && !data.breakEnd) {
        setCurrentStatus('break');
      } else if (data.checkIn) {
        setCurrentStatus('active');
        const diff = Date.now() - data.checkIn.toDate().getTime();
        setShiftDuration(formatMinutes(diff / 60000));
      }
    });

    const unsubLive = onSnapshot(collection(db, 'status'), () => {
      getDocs(collection(db, 'attendance')).then((attendanceSnap) => {
        getDocs(collection(db, 'users')).then((userSnap) => {
          const active = userSnap.docs
            .filter((entry) => attendanceSnap.docs.some((item) => item.data().userId === entry.id && item.data().date === today && !item.data().checkOut))
            .map((entry) => {
              const data = entry.data() as any;
              return { uid: entry.id, name: data.name };
            });

          active.sort((a, b) => (a.uid === user.uid ? -1 : b.uid === user.uid ? 1 : 0));
          setLiveStaff(active);
        });
      });

      // Fetch attendance statistics
      getDocs(collection(db, 'attendance')).then((snap) => {
        let present = 0, absent = 0, onLeave = 0, lateCheckin = 0;
        const days = new Map<string, number>();

        snap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'present') present++;
          else if (data.status === 'absent') absent++;
          else if (data.status === 'leave') onLeave++;
          if (data.lateCheckIn) lateCheckin++;

          const dateKey = data.date || new Date().toISOString().split('T')[0];
          days.set(dateKey, (days.get(dateKey) || 0) + (data.checkIn ? 1 : 0));
        });

        setAttendanceStats({ present, absent, onLeave, lateCheckin });

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const key = date.toISOString().split('T')[0];
          return {
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
            present: days.get(key) || 0,
            date: key,
          };
        });

        setWeeklyData(last7Days);
      });
    });

    return () => {
      unsubMyStatus();
      unsubLive();
    };
  }, [user]);

  const pieData = useMemo(() => {
    const total = Object.values(attendanceStats).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return [
      { name: 'Present', value: attendanceStats.present },
      { name: 'Absent', value: attendanceStats.absent },
      { name: 'On Leave', value: attendanceStats.onLeave },
      { name: 'Late Check-in', value: attendanceStats.lateCheckin },
    ].filter(item => item.value > 0);
  }, [attendanceStats]);

  const heroStats = useMemo(
    () => [
      { label: 'Status', value: currentStatus === 'active' ? 'Active' : currentStatus === 'break' ? 'On break' : 'Idle', icon: LayoutDashboard, tone: 'from-cyan-500 via-blue-500 to-blue-600', color: 'text-white', subtext: 'Current' },
      { label: 'Shift Time', value: shiftDuration, icon: Clock3, tone: 'from-purple-500 via-purple-600 to-purple-700', color: 'text-white', subtext: 'Today' },
      { label: 'Live Staff', value: String(liveStaff.length).padStart(2, '0'), icon: Users, tone: 'from-emerald-400 via-emerald-500 to-teal-600', color: 'text-white', subtext: 'Online' },
      { label: 'Total', value: (attendanceStats.present + attendanceStats.absent + attendanceStats.onLeave).toString(), icon: ShieldCheck, tone: 'from-orange-400 via-orange-500 to-red-500', color: 'text-white', subtext: 'Attendance' },
    ],
    [currentStatus, liveStaff.length, shiftDuration, attendanceStats]
  );

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="flex flex-col gap-6">
        {/* Hero Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {heroStats.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${item.tone} p-6 text-white shadow-xl transition-all hover:shadow-2xl`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-3xl" />
                <div className="relative z-10 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-white/75">{item.label}</p>
                      <h3 className="mt-2 text-4xl font-black tracking-tight">{item.value}</h3>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-white/70">{item.subtext}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Sections */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white via-slate-50/50 to-slate-50 p-6 shadow-lg sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Quick Overview</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Your attendance details</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Shift Duration</p>
              <h3 className="mt-2 text-3xl font-black text-slate-950">{shiftDuration}</h3>
              <p className="mt-2 text-xs text-slate-500">Current shift</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Current Status</p>
              <h3 className={`mt-2 text-3xl font-black capitalize ${currentStatus === 'active' ? 'text-cyan-600' : currentStatus === 'break' ? 'text-purple-600' : 'text-slate-600'}`}>
                {currentStatus}
              </h3>
              <p className="mt-2 text-xs text-slate-500">Mode</p>
            </motion.div>
          </div>

          <button
            onClick={() => router.push('/dashboard/attendance')}
            className="mt-4 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-slate-800 hover:to-slate-700"
          >
            Manage Attendance
            <ArrowRight className="h-5 w-5" />
          </button>
        </section>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white via-slate-50/50 to-slate-50 p-6 shadow-lg sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Weekly Attendance
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">Last 7 days</h2>
              </div>
            </div>

            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={weeklyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(15,23,42,0.4)" style={{ fontSize: '12px', fontWeight: 600 }} />
                  <YAxis stroke="rgba(15,23,42,0.4)" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', background: 'rgba(255,255,255,0.98)', boxShadow: '0 10px 30px rgba(15,23,42,0.15)' }}
                    cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                    formatter={(value) => [value, 'Present']}
                  />
                  <Bar dataKey="present" fill={CHART_COLORS.bar1} radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500">
                <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                No attendance data available yet.
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white via-slate-50/50 to-slate-50 p-6 shadow-lg sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Attendance Distribution
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">Overall status</h2>
              </div>
            </div>

            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', background: 'rgba(255,255,255,0.98)', boxShadow: '0 10px 30px rgba(15,23,42,0.15)' }}
                    formatter={(value) => [value, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500">
                <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                No attendance data available yet.
              </div>
            )}
          </motion.section>
        </div>

        {/* Live Activity & Control Panel */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white via-slate-50/50 to-slate-50 p-6 shadow-lg sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Live Activity</p>
                <h2 className="mt-2 text-xl font-black text-slate-950">Personnel online now</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(52,211,153,0.14)]" />
                Live Sync
              </div>
            </div>

            <div className="space-y-2">
              {liveStaff.length > 0 ? (
                liveStaff.map((member, index) => (
                  <motion.div
                    key={member.uid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition-all ${member.uid === user?.uid ? 'border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${member.uid === user?.uid ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700'}`}>
                        {member.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          {member.name || 'Team member'}
                          {member.uid === user?.uid && <span className="ml-2 rounded-full bg-cyan-100 px-2 py-0.5 text-[0.6rem] font-bold text-cyan-700">(You)</span>}
                        </p>
                        <p className="text-xs text-slate-500">Checked in</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-2.5 py-1 text-[0.6rem] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  No one is active yet.
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-6 text-white shadow-lg sm:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative z-10 flex flex-col justify-between gap-6">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-white/70">Control Panel</p>
                <h2 className="mt-2 text-lg font-black tracking-tight">Quick Access</h2>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Manage your attendance, breaks, and checkout with a single click.
                </p>
              </div>

              <button
                onClick={() => router.push('/dashboard/attendance')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-purple-700 shadow-lg transition-all hover:bg-purple-50"
              >
                Open Attendance
                <Zap className="h-4.5 w-4.5" />
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </DashboardLayout>
  );
}
