'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '../../../components/ui/AuthCard';
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLogin } from '@/app/hooks/useLogin';
import { useAppSelector } from '@/app/store/hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { performLogin, loginError, clearLoginError } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTopError, setShowTopError] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (!user.isProfileComplete) {
        router.replace('/profile');
      } else {
        router.replace(user.role === 'admin' ? '/admin-dashboard' : '/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  useEffect(() => {
    if (!loginError) return;

    setShowTopError(true);
    const hideTimer = window.setTimeout(() => setShowTopError(false), 2600);
    return () => window.clearTimeout(hideTimer);
  }, [loginError]);

  if (loading || user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.12),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="h-screen px-4 py-4 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.06),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      {loginError && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md rounded-2xl border border-rose-200 bg-white shadow-xl p-4 transition-opacity duration-700 ${
            showTopError ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-rose-100 p-2 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-700">Login failed</p>
              <p className="text-sm text-slate-600 mt-1">{loginError}</p>
            </div>
          </div>
        </div>
      )}

      <AuthCard
        variant="slate"
        badgeText="Secure Access"
        leftTitle="Employee Management System"
        leftSubtitle="Clean attendance, leave tracking, employee profiles, and admin control in one professional workspace."
        headerSubtitle="Welcome back"
        headerTitle="Sign in to continue"
        bottomText="Use your work email and password to open the dashboard."
      >
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Email</label>
            <Input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (loginError) clearLoginError();
              }}
              type="email"
              placeholder="name@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Password</label>
            <Input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (loginError) clearLoginError();
              }}
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <Button type="submit" className="w-full rounded-2xl h-12 text-sm font-semibold">
            Sign In <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-4 text-sm flex items-center justify-between">
          <p className="text-slate-500">New here?</p>
          <Link href="/signup" className="font-semibold text-slate-900 hover:underline">Create an account</Link>
        </div>
      </AuthCard>
    </div>
  );
}