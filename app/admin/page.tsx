"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase/page";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
      } else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setLoading(false);
        } else {
          router.push("/employee"); // Unauthorised role redirection
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Verifying Admin Access...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-blue-950">Admin Dashboard</h1>
        <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-6 py-2 rounded-full font-bold hover:bg-red-600 transition-all">
          Logout
        </button>
      </div>
      {/* Admin content here */}
    </div>
  );
}