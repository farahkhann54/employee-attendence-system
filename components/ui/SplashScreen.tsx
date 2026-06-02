'use client';

import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden px-6 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="relative w-full max-w-md rounded-[2.25rem] border border-white/80 bg-white/80 p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-lg shadow-slate-300"
        >
          <ShieldCheck className="h-10 w-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="mt-6 space-y-3"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3" />
            Employee Management System
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Preparing your workspace
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Loading secure session and dashboard state.
          </p>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-sm font-semibold">Loading...</span>
        </div>
      </div>
    </div>
  );
}
