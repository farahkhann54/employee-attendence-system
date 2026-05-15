'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/app/store/hooks';
import { db } from '@/services/firebase';
import { 
  collection, addDoc, query, where, 
  onSnapshot, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { Send, Loader2, Calendar, Clock, CheckCircle, XCircle, Inbox } from 'lucide-react';

export default function LeavesPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isSaving, setIsSaving] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    reason: "",
    startDate: "",
    endDate: "",
    type: "Sick Leave"
  });

  // --- List Fetch karne ka Logic ---
  useEffect(() => {
    if (!user) return;

    // Sirf is user ki leaves uthao, aur latest upar rakho
    const q = query(
      collection(db, "leaves"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leaves = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaveHistory(leaves);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      await addDoc(collection(db, "leaves"), {
        userId: user.uid,
        userName: user.name,
        ...formData,
        status: "pending", 
        createdAt: serverTimestamp()
      });
      // Form reset
      setFormData({ reason: "", startDate: "", endDate: "", type: "Sick Leave" });
    } catch (err) {
      console.error(err);
      alert("Error submitting leave.");
    } finally {
      setIsSaving(false);
    }
  };

  // Status ke mutabiq colors set karne ka function
  const getStatusStyles = (status: string) => {
    if (status === 'approved') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (status === 'rejected') return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-amber-50 text-amber-600 border-amber-100'; // Pending
  };

  return (
    <DashboardLayout activeTab="leaves">
      <div className="space-y-10">
        
        {/* TOP SECTION: Application Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Apply for Leave</h1>
              <p className="text-slate-500 font-medium mt-1">Submit your request and track its status below.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Leave Type</label>
                <select 
                  className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 bg-slate-50 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                  <option>Emergency Leave</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Duration (Start - End)</label>
                <div className="flex gap-2">
                  <input type="date" required className="flex-1 border-2 border-slate-50 rounded-2xl px-4 py-4 bg-slate-50 font-bold text-slate-700 text-xs"
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} value={formData.startDate} />
                  <input type="date" required className="flex-1 border-2 border-slate-50 rounded-2xl px-4 py-4 bg-slate-50 font-bold text-slate-700 text-xs"
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} value={formData.endDate} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Reason</label>
                <textarea required rows={3} className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 bg-slate-50 focus:bg-white outline-none font-bold text-slate-700"
                  placeholder="Explain your reason..." value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})} />
              </div>

              <div className="md:col-span-2">
                <button disabled={isSaving} className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-slate-200">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Send size={18} />} Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* BOTTOM SECTION: The List (Your History) */}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 px-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Applications</h2>
            <div className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              Total: {leaveHistory.length}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {leaveHistory.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] py-20 text-center">
                <Inbox className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold tracking-tight">No leave requests found.</p>
              </div>
            ) : (
              leaveHistory.map((leave) => (
                <div key={leave.id} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${getStatusStyles(leave.status)}`}>
                      {leave.status === 'approved' ? <CheckCircle size={24} /> : leave.status === 'rejected' ? <XCircle size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg leading-none">{leave.type}</h4>
                      <p className="text-slate-400 text-xs font-bold mt-2 flex items-center gap-2">
                        <Calendar size={12} /> {leave.startDate} to {leave.endDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 md:text-right border-t md:border-none pt-4 md:pt-0">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Status</p>
                      <span className={`inline-block mt-1 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Reason</p>
                      <p className="text-xs font-bold text-slate-600 mt-1 truncate max-w-37.5">{leave.reason}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

