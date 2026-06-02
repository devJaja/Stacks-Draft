'use client';

import { PIECE_SYMBOLS, isDarkSquare } from '@/lib/board';
import type { PieceType } from '@/types/game';

interface BoardProps {
  board: number[];
  selectedSquare: number | null;
  lastCapture: number | null;
  onSquareClick: (pos: number) => void;
  disabled?: boolean;
}

export default function Board({ board, selectedSquare, lastCapture, onSquareClick, disabled }: BoardProps) {
  return (
    <div className="grid grid-cols-8 w-fit mx-auto border-4 border-amber-900 shadow-2xl rounded overflow-hidden">
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const pos = row * 8 + col;
          const dark = isDarkSquare(row, col);
          const piece = board[pos] as PieceType;
          const selected = selectedSquare === pos;
          const isValidTarget = selectedSquare !== null && dark && board[pos] === 0;

          return (
            <div
              key={pos}
              onClick={() => !disabled && dark && onSquareClick(pos)}
              aria-label={`Square ${pos}${piece ? `, ${PIECE_SYMBOLS[piece]}` : ''}`}
              role="button"
              tabIndex={dark ? 0 : -1}
              onKeyDown={e => e.key === 'Enter' && !disabled && dark && onSquareClick(pos)}
              className={[
                'w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl select-none',
                dark
                  ? 'bg-amber-900 cursor-pointer hover:bg-amber-800 active:bg-amber-700'
                  : 'bg-amber-100',
                selected ? 'ring-4 ring-yellow-400 ring-inset' : '',
                isValidTarget ? 'ring-2 ring-green-400 ring-inset' : '',
                disabled ? 'cursor-not-allowed opacity-60' : '',
                'transition-all duration-150',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {piece > 0 ? PIECE_SYMBOLS[piece] : null}
            </div>
          );
        })
      )}
    </div>
  );
}
