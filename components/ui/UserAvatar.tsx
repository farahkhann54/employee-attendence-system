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
    <div className={`${sizeClasses[size]} relative flex items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-indigo-700 text-white font-black shadow-lg border-4 border-white overflow-hidden`}>
      {/* Background Decorative SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 4" />
      </svg>
      <span className="relative z-10">{firstLetter}</span>
    </div>
  );
}
