'use client';

import { useStacks } from '@/hooks/useStacks';

export default function Home() {
  const { isConnected, connectWallet } = useStacks();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <nav className="p-6 flex justify-between items-center border-b border-purple-500/30">
        <h1 className="text-3xl font-bold">🕹️ Checkers on Stacks</h1>
        {!isConnected && (
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Connect Wallet
          </button>
        )}
      </nav>
    </main>
  );
}
