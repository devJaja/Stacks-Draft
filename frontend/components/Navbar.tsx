'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useStacks } from '@/hooks/useStacks';
import Link from 'next/link';

export default function Navbar() {
  const { isConnected, address, connectWallet, disconnect } = useStacks();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={`px-6 py-4 flex justify-between items-center border-b ${
      theme === 'dark' ? 'border-purple-500/30' : 'border-purple-300'
    }`}>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          🕹️ Checkers on Stacks
        </Link>
        <div className="hidden sm:flex gap-4 text-sm">
          <Link href="/" className="hover:text-purple-400 transition-colors">Play</Link>
          <Link href="/leaderboard" className="hover:text-purple-400 transition-colors">Leaderboard</Link>
          <Link href="/about" className="hover:text-purple-400 transition-colors">About</Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
            theme === 'dark'
              ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
              : 'bg-gray-800 hover:bg-gray-900 text-white'
          }`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono opacity-70">
              {address?.slice(0, 8)}…{address?.slice(-4)}
            </span>
            <button
              onClick={disconnect}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
