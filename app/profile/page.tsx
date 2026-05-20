'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { auth, db } from '../../services/firebase';
import { signOut, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateProfile } from '../store/(auth)/authSlice';
import { Loader2, User, CreditCard, Calendar, LogOut, Sparkles, ShieldCheck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CITIES = [
  { value: "bahawalpur", label: "Bahawalpur" },
  { value: "lahore", label: "Lahore" },
  { value: "karachi", label: "Karachi" },
  { value: "islamabad", label: "Islamabad" },
  { value: "multan", label: "Multan" },
  { value: "faisalabad", label: "Faisalabad" },
  { value: "rawalpindi", label: "Rawalpindi" },
];

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "", fatherName: "", cnic: "", phone: "", dob: "", city: null as any
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data().isProfileComplete) {
        router.replace(snap.data().role === 'admin' ? '/admin-dashboard' : '/dashboard');
      }
    };
    fetchUser();
  }, [user, authLoading, router]);

  const handleSaveProfile = async () => {
    if (!formData.name) return alert("Please enter your name.");
    setIsSaving(true);
    try {
      await firebaseUpdateProfile(auth.currentUser!, { displayName: formData.name });
      const finalData = { 
        ...formData, 
        city: formData.city?.label, // Saving only the label to Firestore
        isProfileComplete: true, 
        updatedAt: new Date().toISOString() 
      };
      await setDoc(doc(db, "users", user!.uid), finalData, { merge: true });
      dispatch(updateProfile(finalData));
      router.replace('/dashboard');
    } catch (err) {
      alert("Failed to save profile.");
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
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 sm:p-12"
      >
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 items-center">
          
          <div className="space-y-6">
            <div className="p-4 w-fit rounded-3xl bg-slate-900 text-emerald-400">
              <Sparkles size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Complete Profile</h1>
              <p className="mt-3 text-slate-500 leading-relaxed">Add your personal details to finalize your workspace onboarding.</p>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <ShieldCheck className="text-emerald-500" size={24} />
              <div className="text-xs font-bold text-slate-600">Secure Database Integration</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input className="h-14 rounded-2xl bg-white border-slate-200" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <Input className="h-14 rounded-2xl bg-white border-slate-200" placeholder="Father Name" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} />
            </div>

            <PhoneInput
              international
              defaultCountry="PK"
              value={formData.phone}
              onChange={(val) => setFormData({...formData, phone: val || ""})}
              className="h-14 px-4 bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/20"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input className="h-14 rounded-2xl bg-white border-slate-200" placeholder="CNIC Number" value={formData.cnic} onChange={(e) => setFormData({...formData, cnic: e.target.value})} />
              
              <div className="relative">
                <div className="absolute left-4 top-[18px] z-10 text-slate-400 pointer-events-none"><MapPin size={18} /></div>
                <Select
                  options={CITIES}
                  placeholder="Search City..."
                  value={formData.city}
                  onChange={(val) => setFormData({...formData, city: val})}
                  styles={{
                    control: (base) => ({
                      ...base,
                      height: '56px',
                      borderRadius: '1rem',
                      paddingLeft: '35px',
                      borderColor: '#e2e8f0',
                      boxShadow: 'none',
                    }),
                    menu: (base) => ({ ...base, borderRadius: '1rem', overflow: 'hidden' }),
                  }}
                />
              </div>
            </div>

            <Input type="date" className="h-14 rounded-2xl bg-white border-slate-200" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
            
            <div className="flex gap-4 pt-6">
              <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 h-14 rounded-2xl font-black text-lg shadow-lg shadow-indigo-100">
                {isSaving ? <Loader2 className="animate-spin" /> : 'SAVE & CONTINUE'}
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="h-14 w-16 rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                <LogOut size={20} />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}