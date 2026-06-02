import React from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SignupFormProps {
  setEmail: (val: string) => void;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export function SignupForm({ setEmail, setPassword, onSubmit, isLoading = false }: SignupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Work Email</label>
        <Input type="email" placeholder="name@company.com" onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Password</label>
        <Input type="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full rounded-2xl h-12">
        {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
      </Button>
    </form>
  );
}