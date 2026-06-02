'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { db } from '@/services/firebase';
import { useAppSelector } from '@/app/store/hooks';
import { collection, onSnapshot } from 'firebase/firestore';
import { FileText, Clock, CalendarDays, User } from 'lucide-react';

type Report = {
  id: string;
  userId?: string;
  userName?: string;
  date?: string;
  report?: string;
  checkIn?: any;
  checkOut?: any;
  reportedAt?: any;
  workedMs?: number;
};

const formatTime = (timestamp: any) => {
  if (!timestamp) return '--:--';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatHours = (ms?: number) => {
  if (!ms || ms <= 0) return null;
  const totalMinutes = Math.floor(ms / 60000);
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
};

const toMillis = (value: any) =>
  value?.toMillis ? value.toMillis() : value ? new Date(value).getTime() : 0;

export default function AdminReports() {
  const { user: authUser } = useAppSelector((state) => state.auth);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'attendance'),
      (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Report)
          .filter((entry) => entry.report && entry.report.trim().length > 0);
        setReports(items);
      },
      (error) => console.error('Failed to load reports:', error),
    );
    return () => unsub();
  }, []);

  const visibleReports = useMemo(
    () =>
      reports
        .filter((entry) => entry.userId !== authUser?.uid)
        .sort((a, b) => toMillis(b.reportedAt) - toMillis(a.reportedAt)),
    [reports, authUser?.uid],
  );

  return (
    <DashboardLayout activeTab="manage-reports">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Daily Reports</h1>
          <p className="mt-1 font-medium text-slate-500">
            End-of-day work summaries submitted by your team at check out.
          </p>
        </div>

        {visibleReports.length > 0 ? (
          <div className="space-y-4">
            {visibleReports.map((entry) => (
              <div
                key={entry.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 sm:p-7"
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 font-black text-indigo-600">
                      {entry.userName?.substring(0, 2).toUpperCase() || <User size={18} />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{entry.userName || 'Unknown Member'}</p>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <CalendarDays size={12} /> {entry.date || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                    <Clock size={14} className="text-indigo-500" />
                    <span className="text-emerald-600">In {formatTime(entry.checkIn)}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-rose-500">Out {formatTime(entry.checkOut)}</span>
                    {formatHours(entry.workedMs) && (
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[0.65rem] font-black text-indigo-600">
                        {formatHours(entry.workedMs)} total
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <FileText size={18} className="mt-0.5 shrink-0 text-slate-300" />
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{entry.report}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
            <FileText className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-500">No reports submitted yet</p>
            <p className="mt-1 text-xs text-slate-400">Reports appear here once employees check out and submit them.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
