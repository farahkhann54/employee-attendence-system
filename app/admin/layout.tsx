"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import Cookies from 'js-cookie';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
const handleLogout = async () => {
  try {
    await signOut(auth);
    Cookies.remove('session');
    Cookies.remove('userRole');
    router.replace("/login");
  } catch (error) {
    alert("Logout failed");
  }
};

  const adminMenu = [
    { name: "Analytics", href: "/admin", icon: "📈" },
    { name: "Employee Directory", href: "/admin/employees", icon: "👥" },
    { name: "Leave Requests", href: "/admin/leave-requests", icon: "📩" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-12 h-20 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">ADMIN<span className="text-indigo-600 italic">CORE</span></h1>
          <div className="flex gap-8">
            {adminMenu.map((m) => (
              <Link key={m.href} href={m.href} className={`text-sm font-black uppercase tracking-widest ${pathname === m.href ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>{m.name}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Logout</button>
      </nav>
      <main className="max-w-7xl mx-auto p-12">{children}</main>
    </div>
  );
}