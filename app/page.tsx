"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "./firebase/page"; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userRole = userDoc.data().role;
          router.push(userRole === "admin" ? "/admin" : "/employee");
        }
      } else {
        setInitializing(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists()) {
          const userRole = userDoc.data().role;
          router.push(userRole === "admin" ? "/admin" : "/employee");
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          role: role,
          createdAt: new Date()
        });
        alert("Account created! Please login.");
        setIsLogin(true);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (initializing) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold">Checking Session...</div>;

  return (
    <div className="h-screen w-full bg-gradient-to-r from-slate-900 via-sky-900 to-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl overflow-hidden">
        
        {/* Toggle Switch */}
        <div className="relative w-full bg-gray-100 rounded-full p-1 flex items-center mb-8">
          <motion.div
            className="absolute h-10 w-[50%] bg-cyan-500 rounded-full shadow-md"
            animate={{ x: isLogin ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button onClick={() => setIsLogin(true)} className={`flex-1 z-10 text-sm font-bold transition-colors ${isLogin ? "text-white" : "text-gray-500"}`}>LOGIN</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 z-10 text-sm font-bold transition-colors ${!isLogin ? "text-white" : "text-gray-500"}`}>SIGNUP</button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={isLogin ? "login" : "signup"} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.3 }}>
            <h2 className="text-xl font-bold text-gray-800 mb-6">{isLogin ? "Log in to your account" : "Create a new account"}</h2>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input type="radio" name="role" value="employee" checked={role === "employee"} onChange={(e) => setRole(e.target.value)} className="accent-cyan-500" /> Employee
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input type="radio" name="role" value="admin" checked={role === "admin"} onChange={(e) => setRole(e.target.value)} className="accent-cyan-500" /> Admin
                  </label>
                </div>
              )}

              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 font-mono">@</span>
                <input type="email" placeholder="Work Email" className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-gray-700" onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">🔒</span>
                <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-gray-700" onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <button type="submit" className="w-full bg-blue-950 text-white py-3.5 rounded-full font-bold hover:bg-blue-900 shadow-md">
                {isLogin ? "Login" : "Sign Up"} →
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"} 
              <button onClick={() => setIsLogin(!isLogin)} className="text-blue-950 font-bold ml-1 hover:underline">{isLogin ? "Signup here" : "Login here"}</button>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}