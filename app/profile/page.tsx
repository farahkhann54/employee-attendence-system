'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../services/firebase';
import { signOut, updateProfile as firebaseUpdateProfile } from 'firebase/auth'; // Import this
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateProfile } from '../store/(auth)/authSlice';
import { Loader2, User, CreditCard, Calendar, Briefcase, LogOut } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';

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
      alert("Profile save karne mein masla aya.");
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
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="scale-125 border-4 border-white shadow-xl rounded-full">
               <UserAvatar name={formData.name || "User"} size="lg" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-lg shadow-lg">
               <User size={16} />
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Complete Your Profile</h1>
          <p className="text-slate-400 font-medium mt-2">Personalize your dashboard experience</p>
        </div>

        {/* Form Inputs with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Father Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                placeholder="Father's Full Name"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">CNIC Number</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                placeholder="42101-XXXXXXX-X"
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Job Field / Department</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                placeholder="e.g. Software Engineering"
                value={formData.jobField}
                onChange={(e) => setFormData({ ...formData, jobField: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 space-y-4">
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:bg-slate-400 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Finalize Profile"}
          </button>

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            <LogOut size={14} /> Skip for now & Logout
          </button>
        </div>
      </div>
    </div>
  );
}

