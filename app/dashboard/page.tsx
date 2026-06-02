"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  TrendingUp,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppSelector } from "@/app/store/hooks";
import { db } from "@/services/firebase";
import { usePresence } from "../hooks/usePresence";

type AttendanceRecord = {
  id: string;
  date: string;
  checkIn?: any;
  checkOut?: any;
  lateCheckIn?: boolean;
  status?: string;
};

const formatDuration = (ms: number) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const formatTime = (timestamp: any) => {
  if (!timestamp) return "--:--";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Single indigo-based accent palette + semantic status tones.
const PIE_COLORS = {
  onTime: "#4f46e5", // indigo-600 (present, on time)
  late: "#f59e0b", // amber-500 (late)
  leave: "#64748b", // slate-500 (on leave)
};

export default function MainDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  usePresence();

  const [currentStatus, setCurrentStatus] = useState<"idle" | "active" | "break">("idle");
  const [checkInAt, setCheckInAt] = useState<number | null>(null);
  const [bankedMs, setBankedMs] = useState(0);
  const [shiftDuration, setShiftDuration] = useState("0h 0m");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [approvedLeaves, setApprovedLeaves] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    const today = new Date().toISOString().split("T")[0];

    const unsubMyStatus = onSnapshot(
      doc(db, "attendance", `${user.uid}_${today}`),
      (snap) => {
        if (!snap.exists()) {
          setCurrentStatus("idle");
          setCheckInAt(null);
          setBankedMs(0);
          return;
        }

        const data = snap.data();
        setBankedMs(typeof data.workedMs === "number" ? data.workedMs : 0);
        if (data.checkOut) {
          setCurrentStatus("idle");
          setCheckInAt(null);
        } else if (data.breakStart && !data.breakEnd) {
          setCurrentStatus("break");
          setCheckInAt(data.checkIn ? data.checkIn.toDate().getTime() : null);
        } else if (data.checkIn) {
          setCurrentStatus("active");
          setCheckInAt(data.checkIn.toDate().getTime());
        } else {
          setCurrentStatus("idle");
          setCheckInAt(null);
        }
      },
    );

    // Only this employee's own attendance history.
    const unsubMine = onSnapshot(
      query(collection(db, "attendance"), where("userId", "==", user.uid)),
      (snap) => {
        const mine = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AttendanceRecord[];
        mine.sort((a, b) => (a.date < b.date ? 1 : -1));
        setRecords(mine);
      },
    );

    // Only this employee's approved leaves (filter client-side to avoid a composite index).
    const unsubLeaves = onSnapshot(
      query(collection(db, "leaves"), where("userId", "==", user.uid)),
      (snap) => setApprovedLeaves(snap.docs.filter((d) => d.data().status === "approved").length),
      (error) => console.error("Failed to load leaves:", error),
    );

    return () => {
      unsubMyStatus();
      unsubMine();
      unsubLeaves();
    };
  }, [user]);

  // Shift timer = hours banked today + the currently running session (accumulates across check-ins).
  useEffect(() => {
    const compute = () => {
      const live = checkInAt != null ? Date.now() - checkInAt : 0;
      setShiftDuration(formatDuration(bankedMs + live));
    };
    compute();
    if (checkInAt == null) return; // not running -> show banked total, no ticking
    const intervalId = setInterval(compute, 1000);
    return () => clearInterval(intervalId);
  }, [checkInAt, bankedMs]);

  const stats = useMemo(() => {
    const present = records.filter((r) => r.checkIn).length;
    const late = records.filter((r) => r.lateCheckIn).length;
    const onTime = Math.max(0, present - late);
    return { present, late, onTime };
  }, [records]);

  const pieData = useMemo(() => {
    return [
      { name: "On time", value: stats.onTime, key: "onTime" as const },
      { name: "Late", value: stats.late, key: "late" as const },
      { name: "On leave", value: approvedLeaves, key: "leave" as const },
    ].filter((item) => item.value > 0);
  }, [stats, approvedLeaves]);

  const weeklyData = useMemo(() => {
    const presentDates = new Set(records.filter((r) => r.checkIn).map((r) => r.date));
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const key = date.toISOString().split("T")[0];
      return {
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
        present: presentDates.has(key) ? 1 : 0,
      };
    });
  }, [records]);

  const recentActivity = useMemo(() => records.slice(0, 5), [records]);

  const heroStats = useMemo(
    () => [
      {
        label: "Status",
        value:
          currentStatus === "active"
            ? "Active"
            : currentStatus === "break"
              ? "On break"
              : "Idle",
        icon: LayoutDashboard,
        subtext: "Right now",
      },
      {
        label: "Shift Time",
        value: shiftDuration,
        icon: Clock3,
        subtext: "Today",
      },
      {
        label: "Days Present",
        value: String(stats.present).padStart(2, "0"),
        icon: CheckCircle2,
        subtext: "All time",
      },
      {
        label: "Approved Leaves",
        value: String(approvedLeaves).padStart(2, "0"),
        icon: CalendarDays,
        subtext: "All time",
      },
    ],
    [currentStatus, shiftDuration, stats.present, approvedLeaves],
  );

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="flex flex-col gap-6">
        {/* Hero stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {heroStats.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </p>
                    <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                      {item.value}
                    </h3>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-400">{item.subtext}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick overview */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
              Quick Overview
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Your attendance details</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                Shift Duration
              </p>
              <h3 className="mt-2 text-3xl font-black text-slate-950">{shiftDuration}</h3>
              <p className="mt-2 text-xs text-slate-500">Current shift</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                Current Status
              </p>
              <h3
                className={`mt-2 text-3xl font-black capitalize ${
                  currentStatus === "active"
                    ? "text-emerald-600"
                    : currentStatus === "break"
                      ? "text-amber-600"
                      : "text-slate-500"
                }`}
              >
                {currentStatus}
              </h3>
              <p className="mt-2 text-xs text-slate-500">Mode</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/attendance")}
            className="mt-4 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800"
          >
            Manage Attendance
            <ArrowRight className="h-5 w-5" />
          </button>
        </section>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                <TrendingUp className="h-4 w-4" /> My Weekly Attendance
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950">Last 7 days</h2>
            </div>

            {records.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={weeklyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(15,23,42,0.4)" style={{ fontSize: "12px", fontWeight: 600 }} />
                  <YAxis allowDecimals={false} stroke="rgba(15,23,42,0.4)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      background: "rgba(255,255,255,0.98)",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.15)",
                    }}
                    cursor={{ fill: "rgba(79,70,229,0.08)" }}
                    formatter={(value) => [value ? "Present" : "Absent", "Status"]}
                  />
                  <Bar dataKey="present" fill="#4f46e5" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500">
                <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                No attendance data yet. Check in to get started.
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                <Calendar className="h-4 w-4" /> My Attendance Breakdown
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950">Overall status</h2>
            </div>

            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    innerRadius={60}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.key} fill={PIE_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      background: "rgba(255,255,255,0.98)",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.15)",
                    }}
                    formatter={(value) => [value, "Count"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500">
                <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                No attendance data yet.
              </div>
            )}
          </section>
        </div>

        {/* Recent activity + quick access */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <div className="mb-6">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                Recent Activity
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950">Your last check-ins</h2>
            </div>

            <div className="space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-all hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-950">{record.date}</p>
                        <p className="text-xs text-slate-500">
                          In {formatTime(record.checkIn)} · Out {formatTime(record.checkOut)}
                        </p>
                      </div>
                    </div>
                    {record.checkOut ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.6rem] font-bold uppercase text-slate-500">
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[0.6rem] font-bold uppercase text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        On duty
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  <CalendarDays className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  No activity yet.
                </div>
              )}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-indigo-700 bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white shadow-lg sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative z-10 flex flex-col justify-between gap-6">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-white/70">
                  Quick Access
                </p>
                <h2 className="mt-2 text-lg font-black tracking-tight">Manage your day</h2>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Check in, take a break, or check out in a single click.
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard/attendance")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50"
              >
                Open Attendance
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
