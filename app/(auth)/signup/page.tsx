'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, UserPlus, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/app/store/hooks';
import { useSignup } from '@/app/hooks/useSignup';
import { SignupForm } from './components/SignupForm';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { registerUser } = useSignup();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === 'admin' ? '/admin-dashboard' : '/dashboard');
    }
  }, [user, loading, router]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    registerUser(email, password);
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl"
      >
        <div className="grid lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between p-12 bg-emerald-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.16),transparent_30%)]" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white/75">
                <ShieldCheck className="h-4 w-4" /> Create Access
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tight">Join the workspace</h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
                  Create your account and start using attendance, leave, and profile tools in a clean professional dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 lg:p-12">
            <div className="mb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Get started</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Create your account</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">Use a work email and secure password to begin.</p>
            </div>

            <SignupForm setEmail={setEmail} setPassword={setPassword} onSubmit={handleSignup} />

            <div className="mt-8 flex items-center justify-between gap-4 text-sm">
              <p className="text-slate-500">Already have an account?</p>
              <Link href="/login" className="font-semibold text-slate-950 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}