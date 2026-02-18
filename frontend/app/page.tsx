'use client';

import { useStacks } from '@/hooks/useStacks';
import { useCheckers } from '@/hooks/useCheckers';
import { useState } from 'react';

export default function Home() {
  const { isConnected, userData, connectWallet, disconnect } = useStacks();
  const { createGame, joinGame, makeMove, loading } = useCheckers();
  
  const [gameId, setGameId] = useState(0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <nav className="p-6 flex justify-between items-center border-b border-purple-500/30">
        <h1 className="text-3xl font-bold">🕹️ Checkers on Stacks</h1>
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-sm">{userData?.profile?.stxAddress?.testnet?.slice(0, 8)}...</span>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
            >
              Disconnect
            </button>
          </div>
        )}
      </nav>
    </main>
  );
}
