import React from 'react';

export function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition font-medium ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-gray-50'}`}>
      {icon} <span>{label}</span>
    </div>
  );
}

export function EmployeeStatCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: number, subtext: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase">{label}</p>
          <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase border-t pt-4">{subtext}</p>
    </div>
  );
}