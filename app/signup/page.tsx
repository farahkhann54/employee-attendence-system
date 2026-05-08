"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import Cookies from "js-cookie";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee"); // default
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === "admin" ? "/admin" : "/employee");
    }
  }, [user, loading, router]);

  const handleSignup = async () => {
    try {
      setError("");
      setIsLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // 🔥 save role in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        role,
      });

      // Set cookie for middleware
      Cookies.set("auth_token", userCred.user.uid, { expires: 7 });

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/employee");
      }
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-5">
        
        </div>

        {/* Signup Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Create Account</h2>
          <p className="text-center text-slate-600 text-sm mb-8">Join our employee management system</p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole("employee")}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all duration-200 text-sm ${
                    role === "employee"
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-300 hover:border-blue-500"
                  }`}
                >
                  👤 Employee
                </button>

                <button
                  onClick={() => setRole("admin")}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all duration-200 text-sm ${
                    role === "admin"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-300 hover:border-indigo-500"
                  }`}
                >
                  👨‍💼 Admin
                </button>
              </div>
            </div>

            <button
              onClick={handleSignup}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-slate-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-8">© 2025 Employee Attendance System. All rights reserved.</p>
      </div>
    </div>
  );
}