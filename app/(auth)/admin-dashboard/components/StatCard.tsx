import { AdminStatProps } from '@/types/admin-types';
import React from 'react';

export function StatCard({ icon, label, value, trend }: AdminStatProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between mb-4">
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  );
}