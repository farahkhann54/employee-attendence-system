'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from './components/StatCard';
import { 
  Users, UserPlus, BarChart3, Loader2, 
  Clock, Zap, Coffee, ChevronRight, Activity, BellRing,
  TrendingUp, ArrowUpRight
} from 'lucide-react';

import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Avatar, AvatarFallback, 
  ScrollArea
} from "@/components/ui/dashboard-elements";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppSelector } from '@/app/store/hooks';
import { useAdminAuth } from '@/app/hooks/useAdminAuth';
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

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

    const qNotify = query(collection(db, "attendance"), where("date", "==", today), orderBy("checkIn", "desc"), limit(1));
    const unsubNotify = onSnapshot(qNotify, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.userId !== authUser.uid) showActivityToast(data);
        }
      });
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setStats(prev => ({ ...prev, totalEmployees: snap.size }));
    });

    const qLeaves = query(collection(db, "leaves"), where("status", "==", "pending"));
    const unsubLeaves = onSnapshot(qLeaves, (snap) => {
      setStats(prev => ({ ...prev, pendingLeaves: snap.size }));
    });

    const unsubActivity = onSnapshot(query(collection(db, "status")), (statusSnap) => {
      onSnapshot(query(collection(db, "attendance"), where("date", "==", today)), (attendSnap) => {
        const statuses = statusSnap.docs.map(d => ({ uid: d.id, ...(d.data() as any) }));
        const attendances = attendSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        
        const activeUsers = attendances
          .filter(a => a.checkIn && !a.checkOut && a.userId !== authUser.uid)
          .map(a => {
            const presence = statuses.find(s => s.uid === a.userId);
            return {
              uid: a.userId,
              name: a.userName || "Team Member",
              state: presence?.state || 'offline',
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
      <div className="bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-100">
        <BellRing className="text-indigo-600" />
        <div>
          <p className="text-xs font-black uppercase">{data.userName}</p>
          <p className="text-[10px] text-slate-500">{data.checkOut ? 'Shift Ended' : 'Clocked In'}</p>
        </div>
      </div>
    ));
  };

  if (authLoading || fetching) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <DashboardLayout activeTab="admin-dashboard">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">Command <span className="text-indigo-600">Center</span></h1>
        <Button className="rounded-2xl shadow-xl gap-2"><UserPlus size={18}/> Add Staff</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Users className="text-indigo-600"/>} label="Total Staff" value={stats.totalEmployees.toString()} trend="Global" />
        <StatCard icon={<Activity className="text-emerald-600"/>} label="Live Now" value={stats.activeNow.toString()} trend="Active" />
        <StatCard icon={<Clock className="text-orange-500"/>} label="Pending" value={stats.pendingLeaves.toString()} trend="Leaves" />
        <StatCard icon={<BarChart3 className="text-purple-600"/>} label="Efficiency" value={stats.attendanceRate} trend="+2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8">
            <CardTitle>Attendance Insights</CardTitle>
            <TrendingUp className="text-emerald-500" />
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                <Area type="monotone" dataKey="attendance" stroke="#4f46e5" strokeWidth={4} fillOpacity={0.1} fill="#4f46e5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 rounded-[2.5rem] border-none shadow-sm">
          <CardHeader className="p-8"><CardTitle className="text-xl">Presence</CardTitle></CardHeader>
          <ScrollArea className="h-[350px] px-8 pb-8">
            <div className="space-y-3">
              {activeStaff.map((m) => (
                <div key={m.uid} className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback>{m.name.substring(0,2)}</AvatarFallback></Avatar>
                    <p className="text-xs font-black">{m.name}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </DashboardLayout>
  );
}