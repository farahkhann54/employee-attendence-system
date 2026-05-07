"use client";
import { useState } from "react";
import { auth, db } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from 'js-cookie';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", res.user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role;

      // ✅ Cookies set karein (Expires in 7 days)
      Cookies.set('session', res.user.uid, { expires: 7 });
      Cookies.set('userRole', role, { expires: 7 });

      router.push(role === "admin" ? "/admin" : "/employee");
    }
  } catch (err) {
    alert("Login failed!");
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans antialiased">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/60 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-indigo-600 tracking-tighter italic">CHRONOS</h1>
          <p className="text-slate-400 font-medium mt-2">Sign in to your dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" placeholder="Email" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-100">CONTINUE</button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-500">Need access? <Link href="/signup" className="text-indigo-600 font-bold underline">Create Account</Link></p>
      </div>
    </div>
  );
}