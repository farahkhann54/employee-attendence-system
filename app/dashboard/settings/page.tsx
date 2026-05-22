'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { updateProfile } from '@/app/store/(auth)/authSlice';
import { db } from '@/services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  User, 
  Mail, 
  Save, 
  Loader2, 
  Camera,
  Smartphone,
  MapPin,
  CheckCircle2,
  Trash2,
  CalendarDays,
  FileText
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { Input } from '@/components/ui/input';

interface UserProfile {
  name: string;
  fatherName: string;
  email: string;
  phone: string;
  cnic: string;
  address: string;
  joinedDate: string;
  photoURL: string;
}

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    fatherName: "",
    email: user?.email || "",
    phone: "",
    cnic: "",
    address: "",
    joinedDate: "",
    photoURL: "",
  });

  const resizeImageToDataURL = async (file: File, maxSize = 256, quality = 0.85) => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Invalid image.'));
        img.src = String(reader.result || '');
      };
      reader.onerror = () => reject(new Error('Failed to read image.'));
      reader.readAsDataURL(file);
    });

    const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable.');

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/webp', quality);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            name: data.name || user.displayName || "",
            fatherName: data.fatherName || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            cnic: data.cnic || "",
            address: data.address || "",
            joinedDate: data.createdAt || "",
            photoURL: data.photoURL || user.photoURL || "",
          });
        } else {
          setFormData(prev => ({
            ...prev,
            name: user.displayName || "",
            email: user.email || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
    setMounted(true);
  }, [user]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }

    setIsPhotoProcessing(true);

    try {
      const dataUrl = await resizeImageToDataURL(file);
      setFormData((current) => ({ ...current, photoURL: dataUrl }));
    } catch {
      alert('Could not process the image. Please try another file.');
    } finally {
      setIsPhotoProcessing(false);
      event.target.value = '';
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updatedData = { 
        uid: user.uid,
        email: formData.email,
        name: formData.name,
        fatherName: formData.fatherName,
        phone: formData.phone,
        cnic: formData.cnic,
        address: formData.address,
        createdAt: formData.joinedDate,
        photoURL: formData.photoURL,
        updatedAt: new Date().toISOString() 
      };
      
      await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });
      dispatch(updateProfile(updatedData));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Settings save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || isLoading) return null;

  return (
    <DashboardLayout activeTab="settings">
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        
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
            <div className="bg-white/85 p-8 rounded-[2.5rem] border border-white/70 shadow-sm text-center backdrop-blur-xl">
              <div className="relative inline-block group mb-6">
                <div className="ring-4 ring-slate-50 rounded-full p-1">
                  <UserAvatar name={formData.name || "User"} src={formData.photoURL} size="lg" />
                </div>
                <button 
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                  disabled={isPhotoProcessing}
                >
                  {isPhotoProcessing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </button>
              </div>
              <h2 className="text-xl font-black text-slate-900">{formData.name || "Your Name"}</h2>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{user?.role || "Team Member"}</p>
              <input 
                ref={photoInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoChange} 
                className="hidden" 
              />
              {formData.photoURL && (
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, photoURL: '' }))}
                  className="mt-4 w-full bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-rose-100 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Remove Photo
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/85 p-10 rounded-[2.5rem] border border-white/70 shadow-sm backdrop-blur-xl">
              <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                <User className="text-blue-600" size={20} /> Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Father Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 outline-none"
                      value={formData.fatherName}
                      placeholder="Enter father name"
                      onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      className="w-full border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 text-slate-400 font-bold outline-none cursor-not-allowed italic"
                      value={formData.email}
                      disabled
                    />
                  </div>
                </div>

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

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">CNIC</label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 outline-none"
                      placeholder="Enter CNIC number"
                      value={formData.cnic}
                      onChange={(e) => setFormData({...formData, cnic: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Joined Date</label>
                  <div className="relative group">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="date"
                      className="w-full border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 text-slate-400 font-bold outline-none cursor-not-allowed"
                      value={formData.joinedDate}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      className="w-full border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 outline-none"
                      value={formData.address}
                      placeholder="Enter your address"
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
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