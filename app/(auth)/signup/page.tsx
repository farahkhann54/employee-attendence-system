'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { SignupForm } from './components/SignupForm';
import { UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/app/store/hooks';
import { useSignup } from '@/app/hooks/useSignup';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { registerUser } = useSignup();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === 'admin' ? '/admin-dashboard' : '/dashboard');
    }
  }, [user, loading, router]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    registerUser(email, password);
  };

  if (loading || user) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-emerald-600 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Join Us</h1>
          <p className="text-gray-500 mt-2">Create your account to get started</p>
        </div>

        <SignupForm 
          setEmail={setEmail} 
          setPassword={setPassword} 
          onSubmit={handleSignup} 
        />

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Already have an account? 
            <Link href="/login" className="text-emerald-600 font-bold ml-1 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}