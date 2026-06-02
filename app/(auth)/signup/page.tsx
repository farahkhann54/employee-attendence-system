'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import AuthCard from '../../../components/ui/AuthCard';
import Link from 'next/link';
import { useAppSelector } from '@/app/store/hooks';
import { useSignup } from '@/app/hooks/useSignup';
import { SignupForm } from './components/SignupForm';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { registerUser, signupError, signupSuccess, clearSignupError } = useSignup();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTopError, setShowTopError] = useState(false);
  const [isSubmittingSignup, setIsSubmittingSignup] = useState(false);
  const loweredSignupError = (signupError || '').toLowerCase();
  const isAlreadyAccountError = loweredSignupError.includes('already exists') || loweredSignupError.includes('already registered');

  useEffect(() => {
    if (!loading && user && !isSubmittingSignup && !signupSuccess) {
      if (!user.isProfileComplete) {
        router.replace('/profile');
      } else {
        router.replace(user.role === 'admin' ? '/admin-dashboard' : '/dashboard');
      }
    }
  }, [user, loading, router, isSubmittingSignup, signupSuccess]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSignup(true);
    setShowTopError(false);
    clearSignupError();
    registerUser(email, password);
  };

  useEffect(() => {
    if (!signupError || loading) return;

    setIsSubmittingSignup(false);
    setShowTopError(true);
    const hideTimer = window.setTimeout(() => setShowTopError(false), 2600);
    return () => window.clearTimeout(hideTimer);
  }, [signupError, loading]);

  if ((loading || user) && !signupSuccess && !signupError && !isSubmittingSignup) {
    return (
      <div className="h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.12),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="h-screen px-4 py-4 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.06),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      {(signupSuccess || (signupError && showTopError && !loading)) && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md rounded-2xl border bg-white shadow-xl p-4 transition-opacity duration-700 ${
            signupSuccess ? 'border-emerald-200' : 'border-rose-200'
          } ${signupSuccess || showTopError ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="flex items-start gap-3">
            {signupSuccess ? (
              <>
                <div className="mt-0.5 rounded-lg bg-emerald-100 p-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Signup successful</p>
                  <p className="text-sm text-slate-600 mt-1">Your account is ready. Redirecting to login...</p>
                </div>
              </>
            ) : (
              <>
                <div className="mt-0.5 rounded-lg bg-rose-100 p-2 text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-700">
                    {isAlreadyAccountError ? 'Already have an account' : 'Signup failed'}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {isAlreadyAccountError ? 'This email already exists. Please login instead.' : signupError}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <AuthCard
        variant="slate"
        badgeText="Create Access"
        leftTitle="Join the workspace"
        leftSubtitle="Create your account and start using attendance, leave, and profile tools in a clean professional dashboard."
        headerSubtitle="Get started"
        headerTitle="Create your account"
        bottomText="Use a work email and secure password to begin."
      >
        <div className="space-y-5">

          <SignupForm
            isLoading={isSubmittingSignup}
            setEmail={(val) => {
              setEmail(val);
              if (signupError) clearSignupError();
            }}
            setPassword={(val) => {
              setPassword(val);
              if (signupError) clearSignupError();
            }}
            onSubmit={handleSignup}
          />

          <div className="text-sm flex items-center justify-between">
            <p className="text-slate-500">Already have an account?</p>
            <Link href="/login" className="font-semibold text-slate-900 hover:underline">Sign in</Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}