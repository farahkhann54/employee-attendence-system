"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function EmployeeDash() {
  const [status, setStatus] = useState<"Checked Out" | "Working" | "On Break">("Checked Out");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Clean code without extra markers
    const today = new Date().toISOString().split("T")[0];
    
    if (!auth.currentUser) return;

    const unsub = onSnapshot(doc(db, "attendance", `${auth.currentUser?.uid}_${today}`), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data(); 
        setData(d);
        if (d.check_out) setStatus("Checked Out");
        else if (d.break_start && !d.break_end) setStatus("On Break");
        else if (d.check_in) setStatus("Working");
      }
    });

    return () => unsub();
  }, []);

  const handleAction = async (act: string) => {
    const today = new Date().toISOString().split("T")[0];
    const ref = doc(db, "attendance", `${auth.currentUser?.uid}_${today}`);
    const now = new Date();

    if (act === "in") {
      const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
      await setDoc(ref, { 
        userId: auth.currentUser?.uid, 
        email: auth.currentUser?.email, 
        date: today, 
        check_in: serverTimestamp(), 
        status: isLate ? "late" : "present" 
      }, { merge: true });
    } else if (act === "out") {
      await updateDoc(ref, { check_out: serverTimestamp() });
    } else if (act === "b_start") {
      await updateDoc(ref, { break_start: serverTimestamp() });
    } else if (act === "b_end") {
      await updateDoc(ref, { break_end: serverTimestamp() });
    }
  };

  return (
    <div className="space-y-10">
      <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 flex flex-col items-center text-center">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl mb-8 shadow-inner ${status === "Working" ? "bg-emerald-50 text-emerald-500 animate-pulse" : "bg-slate-50 text-slate-300"}`}>
          {status === "Working" ? "⚡" : "🏠"}
        </div>
        <h2 className="text-4xl font-black text-slate-800">{status}</h2>
        <p className="text-slate-400 mt-2 mb-10 max-w-sm">Current shift: General (9:00 AM - 6:00 PM)</p>

        <div className="flex flex-wrap justify-center gap-4">
          {status === "Checked Out" && <button onClick={() => handleAction("in")} className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-lg hover:scale-105 transition-all">CHECK IN</button>}
          {status === "Working" && (
            <>
              <button onClick={() => handleAction("b_start")} className="px-10 py-5 bg-amber-400 text-white rounded-3xl font-black hover:scale-105 transition-all">BREAK</button>
              <button onClick={() => handleAction("out")} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black hover:scale-105 transition-all">CHECK OUT</button>
            </>
          )}
          {status === "On Break" && <button onClick={() => handleAction("b_end")} className="px-12 py-5 bg-emerald-500 text-white rounded-3xl font-black hover:scale-105 transition-all">RESUME</button>}
        </div>
      </div>
    </div>
  );
}