'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { CalendarDays, ChevronRight, Clock3, LayoutDashboard, LogOut, Settings, ShieldCheck, Sparkles, Users } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { logout } from '@/app/store/(auth)/authSlice';
import { auth } from '@/services/firebase';
import UserAvatar from '@/components/ui/UserAvatar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

type MenuItem = {
  id: string;
  label: string;
  shortLabel: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

export default function DashboardLayout({ children, activeTab }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && user && !user.isProfileComplete) {
      router.replace('/profile');
    }
  }, [loading, router, user]);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logout());
    router.replace('/login');
  };

  const isAdmin = user?.role === 'admin';
  const currentUserName = user?.name || 'User';

  const menuItems = useMemo<MenuItem[]>(() => {
    return isAdmin
      ? [
          { id: 'admin-dashboard', label: 'Command Center', shortLabel: 'Home', icon: ShieldCheck, path: '/admin-dashboard' },
          { id: 'manage-users', label: 'Employees', shortLabel: 'People', icon: Users, path: '/admin-dashboard/users' },
          { id: 'manage-attendance', label: 'Attendance', shortLabel: 'Time', icon: Clock3, path: '/admin-dashboard/attendance' },
          { id: 'manage-leaves', label: 'Leaves', shortLabel: 'Leave', icon: CalendarDays, path: '/admin-dashboard/leaves' },
          { id: 'settings', label: 'Settings', shortLabel: 'Prefs', icon: Settings, path: '/admin-dashboard/settings' },
        ]
      : [
          { id: 'dashboard', label: 'Workspace', shortLabel: 'Workspace', icon: LayoutDashboard, path: '/dashboard' },
          { id: 'attendance', label: 'Attendance', shortLabel: 'Time', icon: Clock3, path: '/dashboard/attendance' },
          { id: 'leaves', label: 'Leaves', shortLabel: 'Leave', icon: CalendarDays, path: '/dashboard/leaves' },
          { id: 'settings', label: 'Settings', shortLabel: 'Prefs', icon: Settings, path: '/dashboard/settings' },
        ];
  }, [isAdmin]);

  const currentSection = menuItems.find((item) => activeTab === item.id || pathname === item.path) || menuItems[0];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium backdrop-blur-xl">
          <Sparkles className="h-5 w-5 animate-pulse text-cyan-300" />
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900">
      <svg className="pointer-events-none absolute left-0 top-0 hidden w-[34rem] lg:block" viewBox="0 0 680 680" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="layoutShellGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <circle cx="220" cy="240" r="150" fill="url(#layoutShellGlow)" />
        <circle cx="220" cy="240" r="92" stroke="#c7d2fe" strokeWidth="18" strokeDasharray="10 12" />
      </svg>

      <div className="relative min-h-screen lg:pl-[19rem]">
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[19rem] lg:flex-col border-r border-slate-200/60 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-2xl">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200/60 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.42em] text-slate-400">Employee</p>
                  <h1 className="mt-1 text-lg font-black tracking-tight text-slate-950">Attendance Studio</h1>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 py-5">
              <div className="space-y-2 rounded-[1.75rem] border border-slate-200/60 bg-white/95 p-2 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id || pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all duration-300 ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)]'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-white' : 'text-slate-400'}>
                          <Icon size={18} />
                        </span>
                        <span className={`text-[0.82rem] font-semibold tracking-wide ${isActive ? 'text-white' : ''}`}>
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight size={14} className={isActive ? 'text-white' : 'text-slate-300 opacity-0 transition-opacity group-hover:opacity-100'} />
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-slate-200/60 p-5">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
              <div className="min-w-0">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-slate-400">Workspace</p>
                <h2 className="mt-2 truncate text-[2rem] font-black leading-none tracking-tight text-slate-950 sm:text-[2.2rem]">
                  {currentSection.label}
                </h2>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:block">
                  <p className="text-sm font-semibold text-slate-900">{currentUserName}</p>
                </div>
                <div className="rounded-full border-2 border-white shadow-[0_8px_24px_rgba(15,23,42,0.14)]">
                  <UserAvatar name={currentUserName} src={user?.photoURL} size="sm" />
                </div>
              </div>
            </div>

            <div className="border-t border-white/70 bg-white/65 px-4 py-3 backdrop-blur-xl lg:hidden sm:px-6">
              <nav className="flex gap-2 overflow-x-auto pb-1">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id || pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/10'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={14} />
                      {item.shortLabel}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <main className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
              <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6 lg:p-7">
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-slate-400">Dashboard</p>
                    <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                      A clean command surface for your team.
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                      Navigate attendance, leaves, settings, and live operations from one calm, high-clarity workspace.
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Session</p>
                      <p className="text-sm font-bold text-slate-900">Secure and live</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="min-w-0">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}