'use client';

import Navbar from '@/components/Navbar';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useStacks } from '@/hooks/useStacks';
import { useTheme } from '@/contexts/ThemeContext';
import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState } from 'react';

export default function LeaderboardPage() {
  const { isConnected } = useStacks();
  const { theme } = useTheme();
  const { myStats, loading, registerPlayer, setUsername } = useLeaderboard();
  const [usernameInput, setUsernameInput] = useState('');

  const card = `backdrop-blur-lg rounded-xl p-5 border ${
    theme === 'dark' ? 'bg-white/10 border-purple-500/30' : 'bg-white/80 border-purple-300'
  }`;

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">🏆 Leaderboard</h1>

        {!isConnected ? (
          <p className="text-center opacity-60">Connect your wallet to view your stats.</p>
        ) : loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner label="Loading stats…" /></div>
        ) : !myStats ? (
          <div className={`${card} max-w-sm mx-auto text-center space-y-4`}>
            <p className="text-lg">You are not registered yet.</p>
            <button
              onClick={registerPlayer}
              className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium"
            >
              Register on Leaderboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Rating" value={(myStats as any).rating?.value ?? myStats.rating} />
              <StatCard label="Wins" value={(myStats as any).wins?.value ?? myStats.wins} />
              <StatCard label="Losses" value={(myStats as any).losses?.value ?? myStats.losses} />
              <StatCard label="Draws" value={(myStats as any).draws?.value ?? myStats.draws} />
              <StatCard
                label="Games Played"
                value={(myStats as any)['games-played']?.value ?? myStats['games-played']}
              />
              <StatCard
                label="Win Streak"
                value={(myStats as any)['win-streak']?.value ?? myStats['win-streak']}
              />
              <StatCard
                label="Best Streak"
                value={(myStats as any)['best-streak']?.value ?? myStats['best-streak']}
              />
              <StatCard
                label="Win Rate"
                value={(() => {
                  const gp = (myStats as any)['games-played']?.value ?? myStats['games-played'] ?? 0;
                  const w = (myStats as any).wins?.value ?? myStats.wins ?? 0;
                  return gp > 0 ? `${Math.round((w / gp) * 100)}%` : '—';
                })()}
              />
            </div>

            <div className={`${card} max-w-sm`}>
              <h2 className="font-semibold mb-3">Set Username</h2>
              <div className="flex gap-2">
                <input
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  maxLength={32}
                  placeholder="Your username"
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    theme === 'dark'
                      ? 'bg-black/30 border-purple-500/50 text-white'
                      : 'bg-white border-purple-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={() => usernameInput && setUsername(usernameInput)}
                  disabled={!usernameInput || loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-white text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
