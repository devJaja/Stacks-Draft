'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  const { theme } = useTheme();
  return (
    <div className={`rounded-xl p-4 text-center border ${
      theme === 'dark' ? 'bg-white/10 border-purple-500/30' : 'bg-white/80 border-purple-300'
    }`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}
