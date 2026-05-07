"use client";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function AdminOverview() {
  const [stats, setStats] = useState({ total: 0, late: 0, present: 0 });

  useEffect(() => {
    // Clean code: Markers and cite labels removed
    const today = new Date().toISOString().split("T")[0];
    const q = query(collection(db, "attendance"), where("date", "==", today));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const logs = snap.docs.map(d => d.data());
      setStats({
        total: logs.length,
        late: logs.filter((l: any) => l.status === "late").length,
        present: logs.filter((l: any) => l.status === "present").length
      });
    });

    return () => unsubscribe();
  }, []);

  const cardStyle = "bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group hover:scale-105 duration-300";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Total Active Card */}
      <div className={cardStyle}>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Total Active</p>
        <p className="text-5xl font-black text-indigo-600">{stats.total}</p>
        <div className="mt-6 w-full h-1.5 bg-indigo-50 rounded-full overflow-hidden">
          <div className="h-full w-full bg-indigo-600"></div>
        </div>
      </div>

      {/* On Time Card */}
      <div className={cardStyle}>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">On Time</p>
        <p className="text-5xl font-black text-emerald-600">{stats.present}</p>
        <div className="mt-6 w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
          <div className="h-full w-full bg-emerald-600"></div>
        </div>
      </div>

      {/* Late Arrivals Card */}
      <div className={cardStyle}>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Late Arrivals</p>
        <p className="text-5xl font-black text-rose-600">{stats.late}</p>
        <div className="mt-6 w-full h-1.5 bg-rose-50 rounded-full overflow-hidden">
          <div className="h-full w-full bg-rose-600"></div>
        </div>
      </div>
    </div>
  );
}