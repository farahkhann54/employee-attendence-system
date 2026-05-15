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
  Settings, LogOut, Bell, ChevronRight, Loader2,
  Users, ShieldCheck, BarChartHorizontal
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
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!user.isProfileComplete) {
        router.replace('/profile');
      }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      router.replace('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const currentUserName = user?.name || user?.displayName || "User";
  const isAdmin = user?.role === 'admin';

  // --- DYNAMIC MENU ITEMS BASED ON ROLE ---
  const employeeMenu = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'attendance', label: 'My Attendance', icon: <Clock size={20} />, path: '/dashboard/attendance' },
    { id: 'leaves', label: 'My Leaves', icon: <CalendarDays size={20} />, path: '/dashboard/leaves' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
  ];

  const adminMenu = [
    { id: 'admin-dashboard', label: 'Admin Hub', icon: <ShieldCheck size={20} />, path: '/admin-dashboard' },
    { id: 'manage-users', label: 'All Employees', icon: <Users size={20} />, path: '/admin-dashboard/users' },
    { id: 'manage-attendance', label: 'Staff Attendance', icon: <BarChartHorizontal size={20} />, path: '/admin-dashboard/attendance' },
    { id: 'manage-leaves', label: 'Leave Requests', icon: <CalendarDays size={20} />, path: '/admin-dashboard/leaves' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/admin-dashboard/settings' },
  ];

  const menuItems = isAdmin ? adminMenu : employeeMenu;

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className={`w-72 border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen ${isAdmin ? 'bg-slate-900 text-white' : 'bg-white'}`}>
        <div className="p-8">
           <div className="flex items-center gap-3 px-2">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl ${isAdmin ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-white'}`}>H</div>
             <span className={`text-xl font-black tracking-tighter ${isAdmin ? 'text-white' : 'text-slate-900'}`}>HUB.IO</span>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id || pathname === item.path;
            return (
              <Link key={item.id} href={item.path}
                className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
                  isActive 
                    ? (isAdmin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'bg-slate-900 text-white shadow-lg shadow-slate-200') 
                    : (isAdmin ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600')
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className={`${isAdmin ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-3xl p-4 border border-transparent`}>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2 text-rose-500 font-bold text-sm hover:bg-rose-50/10 rounded-xl transition-all">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30">
           <div className="flex items-center gap-2">
              {isAdmin && <span className="bg-indigo-100 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Admin Portal</span>}
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 leading-none">{currentUserName}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{user?.role || "Member"}</p>
                </div>
                <UserAvatar name={currentUserName} size="sm" />
              </div>
           </div>
        </header>

        <main className="p-6 md:p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}