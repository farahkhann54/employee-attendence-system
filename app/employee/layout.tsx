"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import Cookies from "js-cookie";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // States
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Digital Clock Interval
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Auth Listener & Protection
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        // Agar session nahi hai to login par bhein
        router.replace("/login");
      }
    });

    return () => {
      clearInterval(timer);
      unsub();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("session");
      Cookies.remove("userRole");
      router.replace("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const menu = [
    { name: "Dashboard", href: "/employee", icon: "📊" },
    { name: "Attendance History", href: "/employee/history", icon: "🕒" },
    { name: "Leave Portal", href: "/employee/leaves", icon: "✉️" },
  ];

  // Hydration fix: Jab tak mount na ho, kuch khas UI parts hide rakhen
  const displayTime = mounted ? time.toLocaleTimeString() : "--:--:--";
  const userInitial = mounted && userEmail ? userEmail[0].toUpperCase() : "U";
  const userName = mounted && userEmail ? userEmail.split("@")[0] : "User";

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col fixed h-full shadow-sm z-20">
        <div className="p-8">
          <h1 className="text-2xl font-black text-indigo-600 tracking-tighter italic">
            CHRONOS
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm tracking-tight">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-sm"
          >
            Logout Session
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              System Time
            </span>
            <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-mono font-bold text-xs shadow-sm border border-indigo-100/50">
              {displayTime}
            </span>
          </div>

          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-right">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">
                {userName}
              </p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                Online
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl border-4 border-indigo-50 flex items-center justify-center font-black text-white shadow-md transition-transform group-hover:rotate-12">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}