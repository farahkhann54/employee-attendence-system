import React from 'react';

interface SignupFormProps {
  setEmail: (val: string) => void;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SignupForm({ setEmail, setPassword, onSubmit }: SignupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Work Email</label>
        <input 
          type="email" 
          placeholder="name@company.com" 
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Password</label>
        <input 
          type="password" 
          placeholder="••••••••" 
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </div>

      <button 
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 transition active:scale-95 flex items-center justify-center gap-2"
      >
        Create Account
      </button>
    </form>
  );
}