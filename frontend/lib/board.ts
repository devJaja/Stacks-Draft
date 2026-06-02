import type { PieceType } from '../types/game';

export const PIECE_SYMBOLS: Record<PieceType, string> = {
  0: '',
  1: '🔴',
  2: '👑',
  3: '⚫',
  4: '♛',
};

export const PIECE_LABELS: Record<PieceType, string> = {
  0: 'Empty',
  1: 'Player 1',
  2: 'Player 1 King',
  3: 'Player 2',
  4: 'Player 2 King',
};

export const P1_STARTS = [1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23];
export const P2_STARTS = [40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62];

export function getDefaultBoard(): number[] {
  const board = Array(64).fill(0);
  P1_STARTS.forEach(pos => (board[pos] = 1));
  P2_STARTS.forEach(pos => (board[pos] = 3));
  return board;
}

export function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1;
}

export function posToRowCol(pos: number): { row: number; col: number } {
  return { row: Math.floor(pos / 8), col: pos % 8 };
}

export function isP1Piece(piece: number): boolean {
  return piece === 1 || piece === 2;
}

export function isP2Piece(piece: number): boolean {
  return piece === 3 || piece === 4;
}

export function isKing(piece: number): boolean {
  return piece === 2 || piece === 4;
}
