"use client";
import { useState } from "react";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // User info save karna [cite: 50-54]
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email,
        role,
        createdAt: new Date().toISOString()
      });
      router.push(role === "admin" ? "/admin" : "/employee");
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
        <h1 className="text-3xl font-black text-indigo-600 text-center mb-8 italic">CHRONOS</h1>
        <form onSubmit={handleSignup} className="space-y-5">
          <input type="email" placeholder="Email Address" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Create Password" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setPassword(e.target.value)} />
          <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-500" onChange={(e) => setRole(e.target.value)}>
            <option value="employee">Join as Employee</option>
            <option value="admin">Join as Admin</option>
          </select>
          <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:scale-[1.02] transition-all">SIGN UP</button>
        </form>
      </div>
    </div>
  );
}