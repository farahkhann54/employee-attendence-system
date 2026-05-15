'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Users, UserPlus, BarChart3, Loader2, 
  Clock, Zap, Coffee, ChevronRight, Activity, BellRing,
  TrendingUp, ArrowUpRight, MoreHorizontal
} from 'lucide-react';

// Shadcn Components (Assumed installed)
import { 
  Button, Card, CardHeader, CardTitle, CardContent, 
  Avatar, AvatarFallback, ScrollArea, Badge, Separator, 
  CardDescription
} from "@/components/ui/dashboard-elements";
// Recharts for Data Visualization
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useAppSelector } from '@/app/store/hooks';
import { useAdminAuth } from '@/app/hooks/useAdminAuth';
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Dummy Data for Graph (In real app, you can fetch this from Firestore)
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

    // 1. NOTIFICATIONS LISTENER (Functionality unchanged)
    const qNotify = query(collection(db, "attendance"), where("date", "==", today), orderBy("checkIn", "desc"), limit(1));
    const unsubNotify = onSnapshot(qNotify, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.userId !== authUser.uid) showActivityToast(data);
        }
      });
    });

    // 2. STATS & ACTIVE USERS (Functionality unchanged)
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
        const statuses = statusSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
        const attendances = attendSnap.docs.map(d => ({ id: d.id, ...d.data() }));
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
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border-l-4 border-indigo-600 shadow-2xl p-4 rounded-xl flex items-center gap-4 max-w-sm pointer-events-auto"
      >
        <BellRing className="text-indigo-600" size={20} />
        <div>
          <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">{data.userName}</p>
          <p className="text-[10px] text-slate-500">{data.checkOut ? 'Shift Completed' : 'Clocked In'}</p>
        </div>
      </motion.div>
    ), { duration: 4000 });
  };

  if (authLoading || fetching) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Secure Access Granted</span>
    </div>
  );

  return (
    <DashboardLayout activeTab="admin-dashboard">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <Badge variant="outline" className="mb-3 border-indigo-100 text-indigo-600 bg-indigo-50/50 uppercase tracking-widest text-[9px] px-3 py-1">
            System Operational
          </Badge>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Command <span className="text-indigo-600">Center</span></h1>
          <p className="text-slate-500 font-medium mt-1">Real-time oversight of {stats.totalEmployees} personnel.</p>
        </div>
        
        <Button className="rounded-2xl h-14 px-8 bg-slate-900 shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all font-bold tracking-tight">
          <UserPlus className="mr-2 h-5 w-5" /> Add New Member
        </Button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Staff", value: stats.totalEmployees, icon: Users, color: "bg-indigo-50 text-indigo-600", trend: "System" },
          { label: "Live Now", value: stats.activeNow, icon: Activity, color: "bg-emerald-50 text-emerald-600", trend: "Active" },
          { label: "Leaves", value: stats.pendingLeaves, icon: Clock, color: "bg-orange-50 text-orange-600", trend: "Action" },
          { label: "Efficiency", value: stats.attendanceRate, icon: BarChart3, color: "bg-purple-50 text-purple-600", trend: "+2.4%" },
        ].map((item, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <Badge variant="secondary" className="bg-slate-50 text-slate-500 text-[10px] font-bold">{item.trend}</Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                  <h2 className="text-3xl font-black text-slate-900 mt-1">{item.value}</h2>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* GRAPH SECTION */}
        <Card className="lg:col-span-8 rounded-[2.5rem] border-none shadow-sm p-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-xl font-bold">Attendance Trends</CardTitle>
              <CardDescription>Weekly productivity metrics</CardDescription>
            </div>
            <TrendingUp className="text-emerald-500 h-5 w-5" />
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="attendance" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAttend)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LIVE ACTIVITY LIST */}
        <Card className="lg:col-span-4 rounded-[2.5rem] border-none shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              Live Feed <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </CardTitle>
            <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal size={20}/></Button>
          </CardHeader>
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {activeStaff.length > 0 ? activeStaff.map((member) => (
                  <motion.div 
                    layout key={member.uid}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-white text-[10px] font-black">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{member.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {member.onBreak ? (
                            <span className="text-[8px] font-bold text-amber-500 uppercase flex items-center gap-1"><Coffee size={8}/> Break</span>
                          ) : (
                            <span className={`text-[8px] font-bold uppercase flex items-center gap-1 ${member.state === 'online' ? 'text-emerald-500' : 'text-slate-400'}`}>
                              <Zap size={8}/> {member.state}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </motion.div>
                )) : (
                  <div className="py-10 text-center flex flex-col items-center opacity-40">
                    <Users className="text-slate-300 mb-2" size={32} />
                    <p className="text-[10px] font-bold uppercase tracking-tighter">Quiet right now</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* QUICK ACTIONS FOOTER */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[2rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100 flex justify-between items-center group cursor-pointer overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-lg font-bold">Leave Management</h3>
            <p className="text-indigo-100 text-xs mt-1">Review {stats.pendingLeaves} pending applications</p>
          </div>
          <Button 
            onClick={() => window.location.href='/admin-dashboard/leaves'}
            className="rounded-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-6 relative z-10"
          >
            Review <ChevronRight size={16} />
          </Button>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform">
             <Clock size={120} />
          </div>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm p-8 flex justify-between items-center group cursor-pointer hover:bg-slate-900 hover:text-white transition-all">
          <div>
            <h3 className="text-lg font-bold">Organization Logs</h3>
            <p className="text-slate-400 text-xs mt-1 group-hover:text-slate-400 transition-colors">Download monthly attendance reports</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
            <ArrowUpRight size={20} className="text-slate-900 group-hover:text-white" />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}