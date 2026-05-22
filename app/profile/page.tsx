'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { auth, db } from '@/services/firebase';
import { signOut, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateProfile } from '../store/(auth)/authSlice';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';

type ProfileFormData = {
  name: string;
  fatherName: string;
  cnic: string;
  phone: string;
  joinedDate: string;
  address: string;
  photoURL: string;
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

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

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    fatherName: '',
    cnic: '',
    phone: '',
    joinedDate: getTodayDate(),
    address: '',
    photoURL: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    let isActive = true;

    const fetchUser = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!isActive) return;

      if (snap.exists()) {
        const data = snap.data();

        if (data.isProfileComplete) {
          router.replace(data.role === 'admin' ? '/admin-dashboard' : '/dashboard');
          return;
        }

        setFormData({
          name: data.name || data.displayName || user.displayName || '',
          fatherName: data.fatherName || '',
          cnic: data.cnic || '',
          phone: data.phone || '',
          joinedDate: data.createdAt ? String(data.createdAt).slice(0, 10) : getTodayDate(),
          address: data.address || data.city || '',
          photoURL: data.photoURL || user.photoURL || '',
        });
      } else if (user.displayName) {
        setFormData((current) => ({
          ...current,
          name: user.displayName || current.name,
          photoURL: user.photoURL || current.photoURL,
        }));
      }
    };

    fetchUser();

    return () => {
      isActive = false;
    };
  }, [user, authLoading, router]);

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

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) return alert('Please enter your name.');
    if (!formData.phone.trim()) return alert('Please enter your phone number.');
    if (!formData.address.trim()) return alert('Please enter your address.');

    setIsSaving(true);

    try {
      const resolvedRole = (user?.email || '').toLowerCase() === 'admin@gmail.com' ? 'admin' : 'employee';
      const finalData = {
        uid: user!.uid,
        email: user!.email,
        role: user?.role || resolvedRole,
        name: formData.name.trim(),
        fatherName: formData.fatherName.trim(),
        cnic: formData.cnic.trim(),
        phone: formData.phone.trim(),
        createdAt: formData.joinedDate,
        address: formData.address.trim(),
        photoURL: formData.photoURL,
        isProfileComplete: true,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user!.uid), finalData, { merge: true });
      dispatch(updateProfile(finalData));

      if (auth.currentUser) {
        try {
          await firebaseUpdateProfile(auth.currentUser, {
            displayName: formData.name.trim(),
            photoURL: formData.photoURL || null,
          });
        } catch (error) {
          console.warn('Firebase auth profile sync skipped:', error);
        }
      }

      const target = finalData.role === 'admin' ? '/admin-dashboard' : '/dashboard';
      router.replace(target);
    } catch {
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipProfile = async () => {
    setIsSaving(true);

    try {
      const resolvedRole = (user?.email || '').toLowerCase() === 'admin@gmail.com' ? 'admin' : 'employee';
      const fallbackName = formData.name.trim() || user?.displayName?.trim() || user?.email?.split('@')[0] || 'User';
      const skipData = {
        uid: user!.uid,
        email: user!.email,
        role: user?.role || resolvedRole,
        name: fallbackName,
        fatherName: formData.fatherName.trim(),
        cnic: formData.cnic.trim(),
        phone: formData.phone.trim(),
        createdAt: formData.joinedDate,
        address: formData.address.trim(),
        photoURL: formData.photoURL,
        isProfileComplete: true,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user!.uid), skipData, { merge: true });
      dispatch(updateProfile(skipData));

      if (auth.currentUser && (formData.name.trim() || formData.photoURL)) {
        try {
          await firebaseUpdateProfile(auth.currentUser, {
            displayName: formData.name.trim() || null,
            photoURL: formData.photoURL || null,
          });
        } catch (error) {
          console.warn('Firebase auth profile sync skipped:', error);
        }
      }

      const target = skipData.role === 'admin' ? '/admin-dashboard' : '/dashboard';
      router.replace(target);
    } catch {
      alert('Could not skip profile setup. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logout());
    router.replace('/login');
  };

  const completionFields = [formData.name, formData.fatherName, formData.phone, formData.cnic, formData.joinedDate, formData.address];
  const completedCount = completionFields.filter((value) => Boolean(String(value || '').trim())).length;
  const completionPercent = Math.round((completedCount / completionFields.length) * 100);

  if (authLoading || !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.06),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.06),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-2 py-2 sm:px-4 sm:py-4 lg:px-6 lg:py-6"
    >
      <div className="flex h-full w-full max-w-4xl items-center justify-center overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/90 shadow-[0_30px_100px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/90">
          <div className="border-b border-slate-200/70 bg-[linear-gradient(135deg,#020617_0%,#0f172a_45%,#2563eb_100%)] px-4 py-2 text-white sm:px-6 sm:py-2.5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.63rem] font-semibold uppercase tracking-[0.28em] text-white/60">Profile setup</p>
                <h1 className="mt-1 text-lg font-black tracking-tight sm:text-xl">Complete your profile</h1>
                <p className="mt-1 text-[0.68rem] text-white/72 sm:text-xs">Fill in the details below to finish your account.</p>
              </div>

              <div className="shrink-0 rounded-2xl border border-white/12 bg-white/10 px-3 py-1.5 backdrop-blur-sm sm:px-4">
                <p className="text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-white/55">Completion</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-white/12 sm:w-28">
                    <div className="h-full rounded-full bg-linear-to-r from-cyan-300 to-emerald-300" style={{ width: `${completionPercent}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-white/85">{completionPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-scroll-area flex flex-1 min-h-0 flex-col overflow-y-auto overflow-x-hidden px-4 py-2 sm:px-6 sm:py-2.5">
            <div className="grid min-h-0 gap-3 pb-4">
              <div className="grid h-full min-h-0 gap-2 rounded-[1.8rem] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 sm:p-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <UserAvatar name={formData.name || user?.name || 'User'} src={formData.photoURL} size="lg" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-950">Profile photo</p>
                      <p className="mt-1 max-w-md text-[0.72rem] leading-4 text-slate-500">Upload a picture and we’ll compress it locally, then store it in Firestore so it appears in the navbar too.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
                    <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()} className="h-9 rounded-2xl border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50" disabled={isPhotoProcessing}>
                      {isPhotoProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      {formData.photoURL ? 'Change photo' : 'Add photo'}
                    </Button>
                    {formData.photoURL && (
                      <Button type="button" variant="outline" onClick={() => setFormData((current) => ({ ...current, photoURL: '' }))} className="h-9 rounded-2xl border-rose-200 bg-white px-3.5 text-sm font-semibold text-rose-600 shadow-sm hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Full name</span>
                    <Input className="h-9 rounded-2xl border-slate-200 bg-white px-3.5 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5" placeholder="Enter your full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Father name</span>
                    <Input className="h-9 rounded-2xl border-slate-200 bg-white px-3.5 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5" placeholder="Enter father name" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} />
                  </label>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500"><Phone className="h-4 w-4" />Phone number</span>
                    <PhoneInput international defaultCountry="PK" value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val || '' })} className="profile-phone-input" />
                  </label>

                  <label className="space-y-1.5">
                    <span className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500"><CalendarDays className="h-4 w-4" />Joined date</span>
                    <Input type="date" className="h-9 rounded-2xl border-slate-200 bg-slate-100 px-3.5 text-slate-700 shadow-sm focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5" value={formData.joinedDate} readOnly tabIndex={-1} />
                  </label>
                </div>

                <div className="mb-5 grid gap-2 sm:grid-cols-2 sm:mb-6">
                  <label className="space-y-1.5">
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">CNIC</span>
                    <Input className="h-9 rounded-2xl border-slate-200 bg-white px-3.5 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5" placeholder="Enter CNIC number" value={formData.cnic} onChange={(e) => setFormData({ ...formData, cnic: e.target.value })} />
                  </label>

                  <label className="space-y-1.5">
                    <span className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500"><MapPin className="h-4 w-4" />Address</span>
                    <Input className="h-9 rounded-2xl border-slate-200 bg-white px-3.5 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5" placeholder="Enter your address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                  </label>
                </div>

                <div className="mt-2 flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white/95 pt-2.5 pb-2 sm:flex-row">
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="h-9 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:bg-slate-800">
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Save and continue</span><ArrowRight className="h-4.5 w-4.5" /></>}
                  </Button>

                  <Button variant="ghost" onClick={handleSkipProfile} disabled={isSaving} className="h-9 rounded-2xl px-4.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                    Skip for now
                  </Button>

                  <Button variant="outline" onClick={handleLogout} className="h-9 rounded-2xl border-slate-200 bg-white px-4.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                    <LogOut className="h-4.5 w-4.5" />
                    Log out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}