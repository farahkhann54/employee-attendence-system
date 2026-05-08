// /components/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Sidebar({ links }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getInitials = (email: string) => {
    return email?.split('@')[0].substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <aside className="w-72 h-screen shrink-0 overflow-y-auto bg-linear-to-b from-slate-900 to-slate-800 text-white p-6 flex flex-col shadow-lg sticky top-0">
      {/* Logo & App Name */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <p className="text-slate-400 text-xs mt-1 font-medium">Employee Management System</p>
      </div>

      {/* User Profile */}
      <div className="bg-slate-700 rounded-xl p-4 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
            {getInitials(user?.email || '')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs text-slate-300 capitalize">{user?.role || 'User'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-2 mb-8">
        {links.map((link: any) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {link.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200 text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}