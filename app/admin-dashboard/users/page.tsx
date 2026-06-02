"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { db } from "@/services/firebase";
import { useAppSelector } from "@/app/store/hooks"; // Added this
import { collection, onSnapshot } from "firebase/firestore";
import { Mail, Briefcase, Calendar, Search } from "lucide-react";

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user: authUser } = useAppSelector((state) => state.auth); // Added this

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((doc) => ({ id: doc.id, uid: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const filteredUsers = users.filter(u => 
    (u.uid !== authUser?.uid && u.id !== authUser?.uid) && ( 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <DashboardLayout activeTab="manage-users">
      <div className="mb-10 flex max-w-6xl mx-auto flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Personnel Directory
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage and monitor all team members.
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl sm:w-80 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/85 rounded-[2.5rem] border border-white/70 overflow-hidden shadow-sm backdrop-blur-xl max-w-6xl mx-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role & Dept</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-8 py-16 text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-300">No employees found</p>
                </td>
              </tr>
            )}
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                      {user.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-sm text-slate-700 uppercase tracking-tighter">
                    {user.role || "Member"}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Briefcase size={12} /> {user.jobField || "General"}
                  </p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-600 tracking-tight flex items-center gap-1">
                    <Calendar size={14} />
                    {user.createdAt?.toDate
                      ? user.createdAt.toDate().toLocaleDateString()
                      : user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}