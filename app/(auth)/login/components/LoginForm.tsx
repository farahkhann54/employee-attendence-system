import React from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';

interface LoginFormProps {
  setEmail: (val: string) => void;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({ setEmail, setPassword, onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="relative">
        <Mail className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
        <input 
          type="email" placeholder="Email Address" 
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setEmail(e.target.value)} required
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
        <input 
          type="password" placeholder="Password" 
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setPassword(e.target.value)} required
        />
      </div>
      <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
        <LogIn size={20} /> Login
      </button>
    </form>
  );
}