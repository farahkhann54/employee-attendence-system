'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { Save, Loader2, User, CreditCard, Phone, MapPin, CheckCircle2, Mail } from 'lucide-react';
import { db } from '@/services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSettings() {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) setFormData(doc.data());
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const handleUpdate = async () => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, "users", user.uid), formData);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) { console.error(error); }
  };

  if (loading) return <DashboardLayout activeTab="settings"><div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div></DashboardLayout>;

  const fields = [
    { key: 'name', label: 'Full Name', icon: User },
    { key: 'cnic', label: 'CNIC Number', icon: CreditCard },
    { key: 'phone', label: 'Phone Number', icon: Phone },
    { key: 'city', label: 'City', icon: MapPin },
    { key: 'email', label: 'Email Address', icon: Mail },
  ];

  return (
    <DashboardLayout activeTab="settings">
      <AnimatePresence>
        {showPopup && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
            className="fixed top-32 right-10 bg-white p-6 rounded-3xl shadow-2xl border border-emerald-100 flex items-center gap-4 z-50">
            <CheckCircle2 className="text-emerald-500" size={30} />
            <div>
              <h4 className="font-black text-slate-900">Success!</h4>
              <p className="text-xs font-bold text-emerald-600">Profile Updated Successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8">
         <div className="flex items-center gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            {/* Gol Avatar */}
            <div className="h-24 w-24 rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-xl">
               {formData.name?.charAt(0).toUpperCase()}
            </div>
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{formData.name || 'User'}</h1>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Personal Profile Settings</p>
            </div>
         </div>

         <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fields.map((f) => (
                <div key={f.key} className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{f.label}</label>
                  <div className="flex items-center bg-slate-50 px-6 py-4 rounded-2xl gap-3">
                      <f.icon size={18} className="text-indigo-500"/>
                      <input 
                        type="text" 
                        value={formData[f.key] || ''} 
                        onChange={(e) => setFormData({...formData, [f.key]: e.target.value})}
                        className="bg-transparent w-full outline-none font-bold text-slate-900" 
                      />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 flex justify-end">
               <button onClick={handleUpdate} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100">
                  <Save size={18} /> Save Changes
               </button>
            </div>
         </div>
      </div>
    </DashboardLayout>
  );
}