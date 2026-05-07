"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase/page";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<"checked-in" | "checked-out">("checked-out");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "employee") {
          setUser(currentUser);
          setLoading(false);
        } else {
          router.push("/admin");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleAttendance = async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0]; // "2026-05-07"
    const attendanceRef = doc(db, "attendance", `${user.uid}_${today}`);

    try {
      if (attendanceStatus === "checked-out") {
        // Check-in Logic
        await setDoc(attendanceRef, {
          userId: user.uid,
          email: user.email,
          date: today,
          checkIn: serverTimestamp(),
          status: "present"
        }, { merge: true });
        setAttendanceStatus("checked-in");
        alert("Checked in successfully!");
      } else {
        // Check-out Logic
        await setDoc(attendanceRef, {
          checkOut: serverTimestamp(),
        }, { merge: true });
        setAttendanceStatus("checked-out");
        alert("Checked out successfully!");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-sky-50 font-bold text-sky-800">
      Verifying Employee Access...
    </div>
  );

  return (
    <div className="min-h-screen bg-sky-50 p-6 md:p-10 font-sans">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-sky-100 mb-8">
        <div>
          <h1 className="text-2xl font-black text-sky-900 italic">ATTENDANCE</h1>
          <p className="text-sm text-gray-500 font-medium">Welcome back, {user?.email}</p>
        </div>
        <button 
          onClick={() => signOut(auth)} 
          className="bg-red-50 text-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Attendance Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-sky-900/5 border border-sky-100 flex flex-col items-center justify-center space-y-6">
          <div className="h-24 w-24 bg-sky-100 rounded-full flex items-center justify-center text-4xl shadow-inner">
            {attendanceStatus === "checked-in" ? "🏢" : "🏠"}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">Daily Attendance</h2>
            <p className="text-gray-500 text-sm">Status: 
              <span className={`ml-2 font-bold ${attendanceStatus === "checked-in" ? "text-green-500" : "text-orange-500"}`}>
                {attendanceStatus === "checked-in" ? "At Work" : "Offline"}
              </span>
            </p>
          </div>

          <button 
            onClick={handleAttendance}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 shadow-lg ${
              attendanceStatus === "checked-in" 
              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200" 
              : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-200"
            }`}
          >
            {attendanceStatus === "checked-in" ? "CHECK OUT" : "CHECK IN"}
          </button>
        </div>

        {/* Stats Card */}
        <div className="bg-blue-950 p-8 rounded-3xl shadow-2xl text-white flex flex-col justify-between">
          <div>
            <h3 className="text-sky-300 font-bold uppercase tracking-widest text-xs mb-2">Shift Info</h3>
            <p className="text-3xl font-light">09:00 AM - 06:00 PM</p>
          </div>
          
          <div className="pt-6 border-t border-blue-900">
            <div className="flex justify-between text-sm mb-1">
              <span>Weekly Progress</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-blue-900 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full w-3/4"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}