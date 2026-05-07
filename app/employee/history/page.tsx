"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

export default function History() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "attendance"), where("userId", "==", auth.currentUser.uid), orderBy("date", "desc"));
    return onSnapshot(q, (snap) => setLogs(snap.docs.map(d => d.data())));
  }, []);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <tr><th className="px-8 py-5">Date</th><th className="px-8 py-5">In/Out</th><th className="px-8 py-5 text-right">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-50 font-medium">
          {logs.map((log, i) => (
            <tr key={i} className="hover:bg-slate-50/50">
              <td className="px-8 py-6 text-slate-700">{log.date} [cite: 64]</td>
              <td className="px-8 py-6 text-slate-400 text-sm italic">Tracked Session [cite: 25]</td>
              <td className="px-8 py-6 text-right">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${log.status === 'late' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                  {log.status} [cite: 63]
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}