'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from './components/StatCard';

// Icons
import { 
  Users, UserPlus, BarChart3, Loader2, 
  Clock, Zap, Coffee, ChevronRight, Activity, BellRing,
  TrendingUp, ArrowUpRight, MoreHorizontal
} from 'lucide-react';

// Single-File UI Components (Importing from your combined file)
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Avatar, AvatarFallback, 
  ScrollArea, Separator 
} from "@/components/ui/dashboard-elements";

// Graphs
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Hooks & Firebase
import { useAppSelector } from '@/app/store/hooks';
import { useAdminAuth } from '@/app/hooks/useAdminAuth';
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';

// Animation & Toast
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Dummy Graph Data
const chartData = [
  { name: 'Mon', attendance: 82 },
  { name: 'Tue', attendance: 88 },
  { name: 'Wed', attendance: 84 },
  { name: 'Thu', attendance: 90 },
  { name: 'Fri', attendance: 84 },
  { name: 'Sat', attendance: 75 },
  { name: 'Sun', attendance: 40 },
];

export default function AdminDashboard() {
  const { user: authUser, loading: authLoading } = useAppSelector((state) => state.auth);
  const { adminData, fetching } = useAdminAuth(authUser, authLoading);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    activeNow: 0,
    attendanceRate: '84%'
  });
  const [activeStaff, setActiveStaff] = useState<any[]>([]);

  useEffect(() => {
    if (!authUser || fetching) return;
    const today = new Date().toISOString().split('T')[0];

    // 1. Notification Listener
    const qNotify = query(collection(db, "attendance"), where("date", "==", today), orderBy("checkIn", "desc"), limit(1));
    const unsubNotify = onSnapshot(qNotify, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.userId !== authUser.uid) showActivityToast(data);
        }
      });
    });

    // 2. Stats & Active Users Logic
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setStats(prev => ({ ...prev, totalEmployees: snap.size }));
    });

    const qLeaves = query(collection(db, "leaves"), where("status", "==", "pending"));
    const unsubLeaves = onSnapshot(qLeaves, (snap) => {
      setStats(prev => ({ ...prev, pendingLeaves: snap.size }));
    });

    const qStatus = query(collection(db, "status"));
    const qAttend = query(collection(db, "attendance"), where("date", "==", today));

    const unsubActivity = onSnapshot(qStatus, (statusSnap) => {
      onSnapshot(qAttend, (attendSnap) => {
        const statuses = statusSnap.docs.map(d => ({ uid: d.id, ...d.data() as any}));
        
        // VERCEL FIX: Explicitly typing the data
        const attendances = attendSnap.docs.map(d => {
            const data = d.data() as { 
                checkIn?: any; 
                checkOut?: any; 
                userId?: string; 
                userName?: string; 
                breakStart?: any; 
                breakEnd?: any 
            };
            return { id: d.id, ...data };
        });
        
        const activeUsers = attendances
          .filter((a: any) => a.checkIn && !a.checkOut && a.userId !== authUser.uid)
          .map(a => {
            const presence = statuses.find(s => (s as any).uid === a.userId);
            return {
              uid: a.userId,
              name: a.userName || "Team Member",
              state: (presence as any)?.state || 'offline',
              onBreak: !!(a.breakStart && !a.breakEnd)
            };
          });
        setActiveStaff(activeUsers);
        setStats(prev => ({ ...prev, activeNow: activeUsers.length }));
      });
    });

    return () => { unsubNotify(); unsubUsers(); unsubLeaves(); unsubActivity(); };
  }, [authUser, fetching]);

  const showActivityToast = (data: any) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in fade-in' : 'animate-out fade-out'} bg-white border border-slate-100 shadow-2xl p-4 rounded-2xl flex items-center gap-4 max-w-sm pointer-events-auto`}>
        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><BellRing size={20} /></div>
        <div>
          <p className="text-xs font-black text-slate-900 uppercase">{data.userName}</p>
          <p className="text-[10px] text-slate-500 font-bold">{data.checkOut ? 'Shift Ended' : 'Clocked In'}</p>
        </div>
      </div>
    ));
  };

  if (authLoading || fetching) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing HQ Data...</p>
    </div>
  );

  return (
    <DashboardLayout activeTab="admin-dashboard">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <Badge variant="success" className="animate-pulse">Live System</Badge>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Command</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Command <span className="text-indigo-600">Center</span></h1>
        </div>
        <Button size="lg" className="rounded-3xl shadow-2xl shadow-indigo-200 gap-2">
          <UserPlus size={18} /> Add Personnel
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Staff", value: stats.totalEmployees, icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Active", value: stats.activeNow, icon: Activity, color: "text-emerald-600 bg-emerald-50" },
          { label: "Leaves", value: stats.pendingLeaves, icon: Clock, color: "text-orange-600 bg-orange-50" },
          { label: "Rate", value: stats.attendanceRate, icon: BarChart3, color: "text-purple-600 bg-purple-50" },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all rounded-4xl">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${s.color}`}><s.icon size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-3xl font-black text-slate-900">{s.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* GRAPH */}
        <Card className="lg:col-span-8 rounded-[3rem] border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8">
            <CardTitle>Attendance Insights</CardTitle>
            <TrendingUp className="text-emerald-500" />
          </CardHeader>
          <CardContent className="h-87.5 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="attendance" stroke="#4f46e5" strokeWidth={4} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LIVE FEED */}
        <Card className="lg:col-span-4 rounded-[3rem] border-none shadow-sm flex flex-col">
          <CardHeader className="p-8"><CardTitle className="text-xl">Staff Presence</CardTitle></CardHeader>
          <ScrollArea className="flex-1 px-8 pb-8">
            <div className="space-y-3">
              {activeStaff.length > 0 ? activeStaff.map((member) => (
                <div key={member.uid} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback>{member.name.substring(0,2).toUpperCase()}</AvatarFallback></Avatar>
                    <div>
                      <p className="text-xs font-black text-slate-900">{member.name}</p>
                      <Badge variant="outline" className="text-[8px] py-0">{member.state}</Badge>
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
              )) : (
                <div className="text-center py-10 opacity-30 italic text-sm">No activity detected</div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl flex justify-between items-center group">
          <div>
            <h3 className="text-xl font-black">Pending Leaves</h3>
            <p className="text-indigo-100 text-sm mt-1">{stats.pendingLeaves} members waiting</p>
          </div>
          <Button variant="secondary" className="rounded-full font-black px-6">Review</Button>
        </div>
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black">Export Logs</h3>
            <p className="text-slate-400 text-sm mt-1">Download monthly data</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center"><ArrowUpRight /></div>
        </div>
      </div>
    </DashboardLayout>
  );
}