"use client";
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function ManageLeaves() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    // Clean listener without extra markers
    const unsubscribe = onSnapshot(collection(db, "leaves"), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const docRef = doc(db, "leaves", id);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in duration-700">
      <div className="p-8 border-b border-slate-50">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Leave Management</h2>
        <p className="text-sm text-slate-400 font-medium">Approve or reject employee absence requests.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-8 py-6">Employee</th>
              <th className="px-8 py-6">Reason</th>
              <th className="px-8 py-6">Date</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-10 text-center text-slate-400 italic">No pending requests found.</td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 text-slate-700 font-bold">{r.userName || "Unknown"}</td>
                  <td className="px-8 py-6 text-slate-500 italic text-sm">"{r.reason}"</td>
                  <td className="px-8 py-6 text-slate-400">{r.date}</td>
                  <td className="px-8 py-6 text-right space-x-3">
                    {r.status === "pending" ? (
                      <>
                        <button 
                          onClick={() => updateStatus(r.id, "approved")} 
                          className="px-5 py-2 bg-emerald-500 text-white text-[10px] font-black rounded-xl hover:bg-emerald-600 hover:scale-105 transition-all shadow-md shadow-emerald-100"
                        >
                          APPROVE
                        </button>
                        <button 
                          onClick={() => updateStatus(r.id, "rejected")} 
                          className="px-5 py-2 bg-rose-500 text-white text-[10px] font-black rounded-xl hover:bg-rose-600 hover:scale-105 transition-all shadow-md shadow-rose-100"
                        >
                          REJECT
                        </button>
                      </>
                    ) : (
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                        r.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {r.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}