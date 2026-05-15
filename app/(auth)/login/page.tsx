'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { LoginForm } from './components/LoginForm';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLogin } from '@/app/hooks/useLogin';
import { useAppSelector } from '@/app/store/hooks';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { performLogin } = useLogin();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Flicker Protection
  useEffect(() => {
    if (!loading && user) {
      const target = user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
      router.replace(target);
    }
  }, [user, loading, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  if (loading || user) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">Sign In</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Access your employee portal</p>
        </div>

        <LoginForm 
          setEmail={setEmail} 
          setPassword={setPassword} 
          onSubmit={handleLogin} 
        />

        <p className="text-center mt-6 text-sm text-gray-500">
          New here? <Link href="/signup" className="text-blue-600 font-bold">Create Account</Link>
        </p>
      </div>
    </div>
  );
}