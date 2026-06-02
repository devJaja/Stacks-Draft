'use client';

import Navbar from '@/components/Navbar';
import { useTheme } from '@/contexts/ThemeContext';
import ExplorerLink from '@/components/ExplorerLink';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '@/constants';

export default function AboutPage() {
  const { theme } = useTheme();
  const card = `backdrop-blur-lg rounded-xl p-6 border ${
    theme === 'dark' ? 'bg-white/10 border-purple-500/30' : 'bg-white/80 border-purple-300'
  }`;

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-center">About Checkers on Stacks</h1>

        <div className={card}>
          <h2 className="text-xl font-semibold mb-3">🎮 What is this?</h2>
          <p className="opacity-80 leading-relaxed">
            A fully decentralized Checkers / Draughts game built on the{' '}
            <a href="https://stacks.co" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">
              Stacks blockchain
            </a>. All game logic — moves, captures, king promotion, forfeits, and draws — runs entirely
            on-chain, secured by Bitcoin finality.
          </p>
        </div>

        <div className={card}>
          <h2 className="text-xl font-semibold mb-3">🔐 Smart Contract</h2>
          <p className="opacity-80 text-sm mb-2">Deployed on Stacks Mainnet:</p>
          <code className="block text-xs bg-black/30 rounded px-3 py-2 break-all">
            {CONTRACT_ADDRESS}.{CONTRACT_NAME}
          </code>
          <div className="mt-2">
            <ExplorerLink address={`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`} label="View contract on Explorer ↗" />
          </div>
        </div>

        <div className={card}>
          <h2 className="text-xl font-semibold mb-3">📜 Game Rules</h2>
          <ul className="list-disc list-inside space-y-1 opacity-80 text-sm">
            <li>Pieces move diagonally on dark squares only</li>
            <li>Regular pieces move forward only</li>
            <li>Kings (promoted pieces) can move in any diagonal direction</li>
            <li>Capture by jumping over an opponent&apos;s piece</li>
            <li>Reach the opposite back rank to promote to King</li>
            <li>Forfeit or offer a draw at any time</li>
          </ul>
        </div>

        <div className={card}>
          <h2 className="text-xl font-semibold mb-3">🛠 Tech Stack</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Clarity', 'Smart contract language'],
              ['Stacks.js', 'Blockchain interactions'],
              ['Next.js 14', 'React framework'],
              ['Tailwind CSS', 'Styling'],
              ['TypeScript', 'Type safety'],
              ['Bitcoin', 'Security layer'],
            ].map(([tech, desc]) => (
              <div key={tech}>
                <span className="font-semibold">{tech}</span>
                <p className="text-xs opacity-60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
