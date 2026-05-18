import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SignupFormProps {
  setEmail: (val: string) => void;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SignupForm({ setEmail, setPassword, onSubmit }: SignupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Work Email</label>
        <Input type="email" placeholder="name@company.com" onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Password</label>
        <Input type="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <Button type="submit" className="w-full rounded-2xl h-12 bg-emerald-600 text-white hover:bg-emerald-700">
        Create Account
      </Button>
    </form>
  );
}