'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizes[size]} border-2 border-purple-400 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label={label ?? 'Loading'}
      />
      {label && <span className="text-sm opacity-70">{label}</span>}
    </div>
  );
}
