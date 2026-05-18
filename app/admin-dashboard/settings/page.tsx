'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { Settings, Shield, Bell, User, Lock, Save } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <DashboardLayout activeTab="settings">
      <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your administrative preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Navigation Menu */}
        <div className="lg:col-span-4 space-y-4">
           {[
             { label: 'General Profile', icon: <User size={18}/>, active: true },
             { label: 'Security & Access', icon: <Lock size={18}/>, active: false },
             { label: 'Notifications', icon: <Bell size={18}/>, active: false },
             { label: 'Admin Permissions', icon: <Shield size={18}/>, active: false },
           ].map((item, i) => (
             <button key={i} className={`w-full flex items-center gap-4 px-6 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${item.active ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
                {item.icon} {item.label}
             </button>
           ))}
        </div>

        {/* Right: Form Area */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
           <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full bg-slate-50 border border-transparent focus:border-indigo-500 px-6 py-4 rounded-2xl outline-none font-bold text-slate-900 transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Admin Email</label>
                  <input type="email" defaultValue={user?.email} disabled className="w-full bg-slate-100 border border-transparent px-6 py-4 rounded-2xl font-bold text-slate-400 cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                 <h3 className="font-black text-slate-900 tracking-tight">Security Level</h3>
                 <p className="text-xs text-slate-400 font-medium">As an administrator, your account is protected by high-level encryption.</p>
                 <div className="flex items-center gap-4 mt-4">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="w-[90%] h-full bg-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase">90% Secure</span>
                 </div>
              </div>

              <div className="pt-10 flex justify-end">
                 <button className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                    <Save size={18} /> Update Settings
                 </button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}