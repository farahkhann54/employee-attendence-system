import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  setEmail: (val: string) => void;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({ setEmail, setPassword, onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-11" type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-11" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        </div>
      </div>
      <Button className="w-full rounded-2xl h-12 font-semibold" type="submit">
        Login
      </Button>
    </form>
  );
}