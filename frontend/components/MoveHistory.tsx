'use client';

import type { MoveRecord } from '@/types/game';
import { PIECE_SYMBOLS } from '@/lib/board';
import type { PieceType } from '@/types/game';

interface MoveHistoryProps {
  moves: MoveRecord[];
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  if (moves.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic text-center py-4">No moves yet</p>
    );
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
      {[...moves].reverse().map((m, i) => (
        <div
          key={i}
          className="flex items-center justify-between text-xs px-2 py-1 rounded bg-black/20"
        >
          <span className="font-mono">
            {PIECE_SYMBOLS[m.piece as PieceType]} {m.from} → {m.to}
          </span>
          <span className="flex gap-1">
            {m.wasCapture && <span title="Capture">⚔️</span>}
            {m.wasPromotion && <span title="Promoted to King">👑</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
