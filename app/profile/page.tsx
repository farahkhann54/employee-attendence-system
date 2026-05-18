'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../services/firebase';
import { signOut, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateProfile } from '../store/(auth)/authSlice';
import { Loader2, User, CreditCard, Calendar, Briefcase, LogOut, Sparkles, ShieldCheck } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    cnic: "",
    dob: "",
    jobField: "",
    role: "employee" as "admin" | "employee" as "admin" | "employee"
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const fetchUser = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        // Agar profile pehle se complete hai to redirect
        if (data.isProfileComplete) {
          const route = data.role === 'admin' ? '/admin-dashboard' : '/dashboard';
          router.replace(route);
          return;
        }
        setFormData(prev => ({ ...prev, ...data }));
      }
    };
    fetchUser();
  }, [user, authLoading, router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!formData.name) {
       alert("Please enter your name");
       return;
    }

    setIsSaving(true);
    try {
      // 1. Firebase Auth Profile Update (Taake user.displayName set ho jaye)
      await firebaseUpdateProfile(auth.currentUser!, {
        displayName: formData.name
      });

      const finalData = {
        ...formData,
        role: (formData.role === 'admin' ? 'admin' : 'employee') as 'admin' | 'employee',
        displayName: formData.name,
        isProfileComplete: true,
        updatedAt: new Date().toISOString(),
      };

      // 2. Firestore update
      await setDoc(doc(db, "users", user.uid), finalData, { merge: true });
      
      // 3. Redux update
      dispatch(updateProfile(finalData));
      
      // 4. Redirect
      const route = (user.email === "admin@gmail.com" || finalData.role === "admin") 
                    ? '/admin-dashboard' : '/dashboard';
      router.replace(route);
    } catch (err) {
      console.error("Save error:", err);
      alert("Profile save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logout());
    router.replace('/login');
  };

  if (authLoading || !user) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/85 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="grid lg:grid-cols-[360px_1fr]">
          <div className="p-8 lg:p-10 bg-slate-950 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_28%)]" />
            <div className="relative space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
                <Sparkles className="h-4 w-4" /> Profile Setup
              </div>
              <div className="text-center lg:text-left space-y-5">
                <div className="inline-flex rounded-full border border-white/10 p-1 bg-white/5">
                  <UserAvatar name={formData.name || 'User'} size="lg" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Complete your profile</h1>
                  <p className="mt-2 text-sm leading-6 text-white/70">Add the details your team needs to keep records clean and professional.</p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <ShieldCheck className="h-4 w-4" /> Secure account setup
                </div>
                <p className="mt-2 text-sm leading-6">Profile information is stored in Firestore and used across the dashboard.</p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 lg:p-12">
            <div className="mb-8 flex items-end justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Account details</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Personal information</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full Name" icon={<User size={18} />}>
                <Input value={formData.name} placeholder="John Doe" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </Field>
              <Field label="Father Name" icon={<User size={18} />}>
                <Input value={formData.fatherName} placeholder="Father's Full Name" onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} />
              </Field>
              <Field label="CNIC Number" icon={<CreditCard size={18} />}>
                <Input value={formData.cnic} placeholder="42101-XXXXXXX-X" onChange={(e) => setFormData({ ...formData, cnic: e.target.value })} />
              </Field>
              <Field label="Date of Birth" icon={<Calendar size={18} />}>
                <Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Job Field / Department" icon={<Briefcase size={18} />}>
                  <Input value={formData.jobField} placeholder="e.g. Software Engineering" onChange={(e) => setFormData({ ...formData, jobField: e.target.value })} />
                </Field>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto px-8 rounded-2xl h-12">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Finalize Profile'}
              </Button>
              <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto px-8 rounded-2xl h-12 text-rose-600 border-rose-200 hover:bg-rose-50">
                <LogOut size={16} /> Skip for now & Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

