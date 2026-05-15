'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { updateProfile } from '@/app/store/(auth)/authSlice';
import { db } from '@/services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  User, 
  Mail, 
  Save, 
  Loader2, 
  Camera,
  Smartphone,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';

// 1. FIX: TypeScript Interface add kiya taake errors na ayen
interface UserProfile {
  name: string;
  jobField: string;
  phone: string;
  location: string;
}

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 2. FIX: Type casting 'as any' use ki hai initial state ke liye
  const [formData, setFormData] = useState<UserProfile>({
    name: user?.name || "",
    jobField: (user as any)?.jobField || "",
    phone: (user as any)?.phone || "",
    location: (user as any)?.location || "Pakistan",
  });

  useEffect(() => { setMounted(true); }, []);

  const handleUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updatedData = { 
        ...user,
        ...formData,
        updatedAt: new Date().toISOString() 
      };
      
      await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });
      dispatch(updateProfile(updatedData));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Settings save karne mein masla aya.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout activeTab="settings">
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 font-medium mt-2">Update your personal details and public profile.</p>
          </div>
          
          {showSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl font-bold text-sm animate-bounce">
              <CheckCircle2 size={18} /> Settings Saved!
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <div className="relative inline-block group mb-6">
                <div className="ring-4 ring-slate-50 rounded-full p-1">
                  <UserAvatar name={formData.name || "User"} size="lg" />
                </div>
                <button className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg hover:scale-110 transition-transform">
                  <Camera size={18} />
                </button>
              </div>
              <h2 className="text-xl font-black text-slate-900">{formData.name || "Your Name"}</h2>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{user?.role || "Team Member"}</p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                <User className="text-blue-600" size={20} /> Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 outline-none"
                      value={formData.name}
                      placeholder="Enter your name"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      className="w-full border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 text-slate-400 font-bold outline-none cursor-not-allowed italic"
                      value={user?.email || ""}
                      disabled
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Phone Number</label>
                  <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 outline-none"
                      placeholder="+92 3XX XXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 outline-none"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <button 
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:bg-slate-300"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Save Profile Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}