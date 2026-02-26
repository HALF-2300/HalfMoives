"use client";

import { useState } from 'react';

// Minimal icon since heroicons not installed; using inline SVG
function Icon() {
  return (
    <svg
      className="h-4 w-4 text-slate-300"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
      />
    </svg>
  );
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function SearchBar({ placeholder = 'Search', onSearch }: SearchBarProps) {
  const [value, setValue] = useState('');

  return (
    <div className="flex w-full items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
      <Icon />
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch?.(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
      />
    </div>
  );
}
