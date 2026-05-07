"use client";
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";

export default function EmployeeList() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => d.data()));
    });
  }, []);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50">
        <h2 className="text-xl font-black text-slate-800">Team Directory [cite: 29]</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">
        {users.map((u, i) => (
          <div key={i} className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm">{u.email[0].toUpperCase()}</div>
            <div>
              <p className="font-bold text-slate-800">{u.email} [cite: 53]</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{u.role} [cite: 54]</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}