'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ title, children, onClose }: ModalProps) {
  const { theme } = useTheme();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className={`rounded-xl p-6 w-full max-w-sm mx-4 border shadow-xl ${
          theme === 'dark'
            ? 'bg-slate-900 border-purple-500/40 text-white'
            : 'bg-white border-purple-300 text-gray-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 text-xl">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
