import React from 'react';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ name = "User", size = "md" }: AvatarProps) {
  const firstLetter = name?.trim().charAt(0).toUpperCase() || "U";

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-24 h-24 text-3xl"
  };

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-950 via-slate-800 to-indigo-700 text-white font-black shadow-lg ring-4 ring-white`}>
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 4" />
      </svg>
      <span className="relative z-10">{firstLetter}</span>
    </div>
  );
}
