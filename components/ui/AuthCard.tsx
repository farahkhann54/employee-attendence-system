"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface AuthCardProps {
  leftTitle?: string;
  leftSubtitle?: string;
  badgeText?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  children: React.ReactNode;
  bottomText?: string;
  variant?: "emerald" | "slate";
}

const HeroSVG = ({ variant = "emerald" }: { variant?: "emerald" | "slate" }) => (
  <svg viewBox="0 0 600 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="heroGrad" x1="0" x2="1">
        <stop offset="0%" stopColor={variant === "emerald" ? "#10B981" : "#0f172a"} stopOpacity="0.95" />
        <stop offset="100%" stopColor={variant === "emerald" ? "#34D399" : "#4f46e5"} stopOpacity="0.75" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#heroGrad)" rx="24" />
    <g opacity="0.16" fill="#fff">
      <circle cx="120" cy="120" r="80" />
      <circle cx="380" cy="160" r="60" />
      <circle cx="260" cy="340" r="100" />
    </g>
  </svg>
);

export default function AuthCard({
  leftTitle,
  leftSubtitle,
  badgeText,
  headerTitle,
  headerSubtitle,
  children,
  bottomText,
  variant = "emerald",
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-4xl overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/85 shadow-[0_24px_64px_rgba(15,23,42,0.12)] backdrop-blur-xl"
      style={{ maxHeight: "calc(100vh - 2.5rem)" }}
    >
      <div className="grid lg:grid-cols-2 min-h-125">
        <div className={`hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden ${variant === "emerald" ? "bg-emerald-600" : "bg-slate-950"}`}>
          <div className="absolute inset-0 opacity-90">
            <HeroSVG variant={variant} />
          </div>
          <div className="relative space-y-6 z-10">
            {badgeText && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white/80">
                <ShieldCheck className="h-4 w-4" /> {badgeText}
              </div>
            )}
            <div>
              <h1 className="text-4xl font-black tracking-tight leading-tight">{leftTitle}</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/80">{leftSubtitle}</p>
            </div>
          </div>
          <div className="relative flex items-center gap-3 text-white/60 text-xs font-semibold uppercase tracking-[0.3em] z-10">
            <span className="h-px w-10 bg-white/20" /> Smart. Secure. Scalable.
          </div>
        </div>

        <div className="p-7 sm:p-8 lg:p-10 overflow-auto">
          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">{headerSubtitle}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{headerTitle}</h2>
            {bottomText && <p className="mt-2 text-sm font-medium text-slate-500">{bottomText}</p>}
          </div>

          {children}
        </div>
      </div>
    </motion.div>
  );
}
