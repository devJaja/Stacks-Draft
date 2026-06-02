'use client';

import type { GameState } from '@/types/game';
import { useStacks } from '@/hooks/useStacks';
import { useTheme } from '@/contexts/ThemeContext';

interface GameInfoProps {
  gameId: number;
  gameState: GameState | null;
  boardState: number[];
  onOfferDraw: () => void;
  onForfeit: () => void;
  loading: boolean;
}

export default function GameInfo({
  gameId,
  gameState,
  boardState,
  onOfferDraw,
  onForfeit,
  loading,
}: GameInfoProps) {
  const { address } = useStacks();
  const { theme } = useTheme();

  if (!gameState) return null;

  const isActive = gameState['is-active']?.value;
  const currentTurn = gameState['current-turn']?.value;
  const winner = gameState['winner']?.value?.value;
  const p1 = gameState['player1']?.value;
  const p2 = gameState['player2']?.value?.value;
  const moveCount = gameState['move-count']?.value ?? 0;
  const p1Pieces = gameState['p1-pieces']?.value ?? 12;
  const p2Pieces = gameState['p2-pieces']?.value ?? 12;
  const drawOffer = gameState['draw-offered-by']?.value?.value;

  const isMyTurn = currentTurn === address;
  const myRole = p1 === address ? 'Player 1 🔴' : p2 === address ? 'Player 2 ⚫' : 'Spectator 👁️';
  const isPlayer = p1 === address || p2 === address;

  const statusText = winner
    ? winner === address
      ? '🏆 You Won!'
      : '💀 You Lost'
    : !isActive
    ? '⏳ Waiting for opponent...'
    : isMyTurn
    ? '✅ Your Turn'
    : '⏳ Opponent\'s Turn';

  const box = theme === 'dark' ? 'bg-black/30' : 'bg-gray-100';
  const danger = 'px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded text-white text-xs';
  const neutral = `px-3 py-1.5 rounded text-xs ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-900'}`;

  return (
    <div className={`rounded-lg p-4 space-y-3 text-sm ${box}`}>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Game ID" value={`#${gameId}`} />
        <Stat label="Moves" value={String(moveCount)} />
        <Stat label="Your Role" value={myRole} />
        <Stat label="Status" value={statusText} />
        <Stat label="🔴 Pieces" value={String(p1Pieces)} />
        <Stat label="⚫ Pieces" value={String(p2Pieces)} />
      </div>

      {drawOffer && drawOffer !== address && (
        <div className="text-yellow-400 text-xs font-semibold">
          🤝 Opponent offered a draw
        </div>
      )}

      {isPlayer && isActive && (
        <div className="flex gap-2 pt-1">
          <button onClick={onOfferDraw} disabled={loading} className={neutral}>
            🤝 Offer Draw
          </button>
          <button onClick={onForfeit} disabled={loading} className={danger}>
            🏳️ Forfeit
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-400 text-xs">{label}</span>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
