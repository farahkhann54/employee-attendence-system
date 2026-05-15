'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAppSelector } from '@/app/store/hooks';
import { Loader2, Activity, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar, AvatarFallback } from "@/components/ui/dashboard-elements";

export default function UserDashboard() {
  const { user: authUser, loading: authLoading } = useAppSelector((state) => state.auth);
  const [activeStaff, setActiveStaff] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!authUser) return;

    const unsubActivity = onSnapshot(query(collection(db, "status")), (statusSnap) => {
      onSnapshot(query(collection(db, "attendance"), where("date", "==", today)), (attendSnap) => {
        const statuses = statusSnap.docs.map(d => ({ uid: d.id, ...(d.data() as any) }));
        const attendances = attendSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        
        const activeList: any[] = [];
        attendances.forEach(attendance => {
          if (attendance.checkIn && !attendance.checkOut && attendance.userId !== authUser.uid) {
            const presence = statuses.find(s => s.uid === attendance.userId);
            activeList.push({
              uid: attendance.userId,
              name: attendance.userName || "Colleague",
              presenceState: presence?.state || 'offline', // FIXED TYPE ERROR
              onBreak: !!(attendance.breakStart && !attendance.breakEnd)
            });
          }
        });
        setActiveStaff(activeList);
      });
    });

    return () => unsubActivity();
  }, [authUser, today]);

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">Personal <span className="text-indigo-600">Dashboard</span></h1>
        <p className="text-slate-500 font-medium">Welcome back, {authUser?.displayName || 'User'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm p-10 bg-indigo-600 text-white">
          <h2 className="text-2xl font-black mb-2">Ready to work?</h2>
          <p className="text-indigo-100 mb-8">Your shift metrics are being tracked in real-time.</p>
          <div className="flex gap-4">
             <Badge className="bg-white/20 text-white border-none px-4 py-2">Shift: Day</Badge>
             <Badge className="bg-white/20 text-white border-none px-4 py-2">Status: Active</Badge>
          </div>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className="text-lg flex items-center gap-2"><Zap className="text-indigo-600" size={18}/> Active Now</CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            {activeStaff.length > 0 ? activeStaff.map((m) => (
              <div key={m.uid} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8"><AvatarFallback>{m.name.substring(0,2)}</AvatarFallback></Avatar>
                  <span className="text-xs font-bold text-slate-700">{m.name}</span>
                </div>
                <Badge variant="success" className="text-[8px]">{m.presenceState}</Badge>
              </div>
            )) : (
              <p className="text-center text-xs text-slate-400 py-10 italic">No colleagues online</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}