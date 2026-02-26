"use client";

import { useState } from 'react';

const filters = ['Action', 'Drama', 'Sci-Fi', 'Family', 'Arabic', 'Spanish'];

interface FilterPanelProps {
  onChange?: (values: string[]) => void;
}

export function FilterPanel({ onChange }: FilterPanelProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (filter: string) => {
    const next = selected.includes(filter)
      ? selected.filter((item) => item !== filter)
      : [...selected, filter];
    setSelected(next);
    onChange?.(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => toggle(filter)}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            selected.includes(filter)
              ? 'bg-orange-500 text-black'
              : 'bg-white/5 text-slate-200 hover:bg-white/10'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
