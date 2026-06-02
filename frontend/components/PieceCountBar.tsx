'use client';

interface PieceCountBarProps {
  p1Pieces: number;
  p2Pieces: number;
}

export default function PieceCountBar({ p1Pieces, p2Pieces }: PieceCountBarProps) {
  const total = 24;
  const p1Pct = (p1Pieces / total) * 100;
  const p2Pct = (p2Pieces / total) * 100;

  return (
    <div className="space-y-1 text-xs">
      <div className="flex justify-between">
        <span>🔴 P1: {p1Pieces}</span>
        <span>⚫ P2: {p2Pieces}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-700 overflow-hidden flex">
        <div
          className="bg-red-500 h-full transition-all duration-500"
          style={{ width: `${p1Pct}%` }}
        />
        <div
          className="bg-gray-500 h-full transition-all duration-500"
          style={{ width: `${p2Pct}%` }}
        />
      </div>
    </div>
  );
}
