'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { logout } from '@/app/store/(auth)/authSlice';
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';
import UserAvatar from '@/components/ui/UserAvatar';
import { 
  LayoutDashboard, Clock, CalendarDays, 
  Settings, LogOut, ChevronRight, Loader2,
  Users, ShieldCheck, BarChartHorizontal, Sparkles
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export default function DashboardLayout({ children, activeTab }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && user) {
      if (!user.isProfileComplete) router.replace('/profile');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logout());
    router.replace('/login');
  };

  const isAdmin = user?.role === 'admin';
  const currentUserName = user?.name || "User";

  const menuItems = isAdmin ? [
    { id: 'admin-dashboard', label: 'Admin Hub', icon: <ShieldCheck size={20} />, path: '/admin-dashboard' },
    { id: 'manage-users', label: 'All Employees', icon: <Users size={20} />, path: '/admin-dashboard/users' },
    { id: 'manage-attendance', label: 'Staff Attendance', icon: <BarChartHorizontal size={20} />, path: '/admin-dashboard/attendance' },
    { id: 'manage-leaves', label: 'Leave Requests', icon: <CalendarDays size={20} />, path: '/admin-dashboard/leaves' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/admin-dashboard/settings' },
  ] : [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'attendance', label: 'My Attendance', icon: <Clock size={20} />, path: '/dashboard/attendance' },
    { id: 'leaves', label: 'My Leaves', icon: <CalendarDays size={20} />, path: '/dashboard/leaves' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Theme White */}
      <aside className="w-72 border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen bg-white">
        <div className="p-8">
           <div className="flex items-center gap-3 px-2">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 text-white">
               <Sparkles className="h-5 w-5" />
             </div>
             <div>
               <span className="block text-xs font-black tracking-[0.2em] uppercase text-slate-900">EMS</span>
             </div>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id || pathname === item.path;
            return (
              <Link key={item.id} href={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-white" : "text-slate-500"}>
                    {item.icon}
                  </span>
                  <span className={`font-bold text-[13px] tracking-wide ${isActive ? "text-white" : ""}`}>
                    {item.label}
                  </span>
                </div>
                {isActive && <ChevronRight size={14} className="text-white" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
           <div className="flex items-center gap-2">
              {isAdmin && <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">Admin Mode</span>}
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">{currentUserName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{user?.role}</p>
              </div>
              <UserAvatar name={currentUserName} size="sm" />
           </div>
        </header>

        <main className="p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}