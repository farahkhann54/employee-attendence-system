"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  orderBy 
} from "firebase/firestore";

export default function LeavePortal() {
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time Status Tracking [cite: 42]
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "leaves"), 
      where("user_id", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeaves(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "leaves"), {
        user_id: auth.currentUser?.uid,
        userName: auth.currentUser?.email,
        date: date,
        reason: reason,
        status: "pending", // Default status [cite: 42]
        createdAt: serverTimestamp()
      });
      
      setReason("");
      setDate("");
      alert("Leave application submitted successfully!");
    } catch (error) {
      console.error("Error applying leave:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Application Form [cite: 40] */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Request Time Off</h2>
          <p className="text-slate-400 font-medium">Submit your leave request for admin approval.</p>
        </div>

        <form onSubmit={handleApplyLeave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Select Date</label>
            <input 
              type="date" 
              required 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Reason</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Medical / Family Event" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? "SENDING..." : "SUBMIT APPLICATION"}
          </button>
        </form>
      </div>

      {/* 2. Status Tracker Table [cite: 42, 76] */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-black text-slate-800 text-xl tracking-tight">Application History</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100">
            Total Requests: {leaves.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Date of Absence</th>
                <th className="px-8 py-5">Reason Provided</th>
                <th className="px-8 py-5 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-10 text-center text-slate-400 font-medium italic">No leave applications found.</td>
                </tr>
              ) : (
                leaves.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-700">{item.date}</td>
                    <td className="px-8 py-6 text-slate-500 font-medium italic text-sm">"{item.reason}"</td>
                    <td className="px-8 py-6 text-right">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                        item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        item.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}