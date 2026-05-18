'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useLogin } from '@/app/hooks/useLogin';
import { useAppSelector } from '@/app/store/hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { performLogin } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === 'admin' ? '/admin-dashboard' : '/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_40%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl"
      >
        <div className="grid lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-950 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.14),_transparent_30%)]" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
                <ShieldCheck className="h-4 w-4" /> Secure Access
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tight">Employee Management System</h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
                  Clean attendance, leave tracking, employee profiles, and admin control in one professional workspace.
                </p>
              </div>
            </div>
            <div className="relative flex items-center gap-3 text-white/60 text-xs font-semibold uppercase tracking-[0.3em]">
              <span className="h-px w-10 bg-white/20" /> Smart. Secure. Scalable.
            </div>
          </div>

          <div className="p-8 sm:p-10 lg:p-12">
            <div className="mb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Welcome back</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Sign in to continue</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">Use your work email and password to open the dashboard.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@company.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Password</label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter your password" required />
              </div>
              <Button type="submit" className="w-full rounded-2xl h-12 text-sm font-semibold">
                Sign In <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-8 flex items-center justify-between gap-4 text-sm">
              <p className="text-slate-500">New here?</p>
              <Link href="/signup" className="font-semibold text-slate-950 hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}