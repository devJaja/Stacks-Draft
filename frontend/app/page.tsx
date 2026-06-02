'use client';

import { useState, useEffect } from 'react';
import { useStacks } from '@/hooks/useStacks';
import { useCheckers } from '@/hooks/useCheckers';
import { useTheme } from '@/contexts/ThemeContext';
import { getDefaultBoard, isP1Piece, isP2Piece } from '@/lib/board';
import Board from '@/components/Board';
import GameInfo from '@/components/GameInfo';
import MoveHistory from '@/components/MoveHistory';
import PieceCountBar from '@/components/PieceCountBar';
import Toast from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';

export default function Home() {
  const { isConnected, address } = useStacks();
  const { theme } = useTheme();
  const [gameId, setGameId] = useState(0);
  const [inputId, setInputId] = useState('0');
  const {
    createGame, joinGame, makeMove, offerDraw, acceptDraw, forfeit,
    loading, gameState, boardState, moveHistory, error, refetch,
  } = useCheckers(gameId);

  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') =>
    setToast({ msg, type });

  useEffect(() => {
    if (error) showToast(error, 'error');
  }, [error]);

  const board = boardState.some(p => p > 0) ? boardState : getDefaultBoard();

  const isMyTurn = () => {
    if (!gameState || !address) return false;
    return gameState['current-turn']?.value === address;
  };

  const canMovePiece = (pos: number) => {
    const piece = board[pos];
    if (!piece || !address) return false;
    const p1 = gameState?.['player1']?.value;
    const p2 = gameState?.['player2']?.value?.value;
    if (p1 === address) return isP1Piece(piece);
    if (p2 === address) return isP2Piece(piece);
    return false;
  };

  const handleSquareClick = (pos: number) => {
    if (loading || !isMyTurn()) {
      if (!isMyTurn()) showToast("It's not your turn", 'error');
      return;
    }
    const piece = board[pos];

    if (selectedSquare === null) {
      if (piece > 0 && canMovePiece(pos)) setSelectedSquare(pos);
    } else if (pos === selectedSquare) {
      setSelectedSquare(null);
    } else if (piece > 0 && canMovePiece(pos)) {
      setSelectedSquare(pos);
    } else {
      makeMove(selectedSquare, pos);
      setSelectedSquare(null);
    }
  };

  const p1Pieces = gameState?.['p1-pieces']?.value ?? 12;
  const p2Pieces = gameState?.['p2-pieces']?.value ?? 12;
  const winner = gameState?.['winner']?.value?.value;
  const drawOffer = gameState?.['draw-offered-by']?.value?.value;
  const canAcceptDraw = drawOffer && drawOffer !== address;

  const card = `backdrop-blur-lg rounded-xl p-5 border ${
    theme === 'dark' ? 'bg-white/10 border-purple-500/30' : 'bg-white/80 border-purple-300'
  }`;

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {winner && (
          <div className="mb-6 text-center text-2xl font-bold animate-pulse">
            {winner === address ? '🏆 You Won! Congratulations!' : '💀 Game Over — Opponent Won'}
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-24">
            <h2 className="text-4xl font-bold mb-4">Welcome to On-Chain Checkers</h2>
            <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Connect your Stacks wallet to start playing
            </p>
            <p className="text-sm opacity-50">Powered by Bitcoin finality via Stacks</p>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-6 items-start justify-center">
            {/* Controls panel */}
            <div className={`${card} w-full xl:w-72 shrink-0`}>
              <h2 className="text-xl font-bold mb-4">Game Controls</h2>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    await createGame();
                    showToast('Game created! Share your Game ID.', 'success');
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
                >
                  {loading ? <LoadingSpinner size="sm" /> : '+ Create New Game'}
                </button>

                <div className="space-y-2">
                  <input
                    type="number"
                    value={inputId}
                    min={0}
                    onChange={e => setInputId(e.target.value)}
                    placeholder="Enter Game ID"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                      theme === 'dark'
                        ? 'bg-black/30 border-purple-500/50 text-white'
                        : 'bg-white border-purple-300 text-gray-900'
                    }`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const id = parseInt(inputId);
                        setGameId(id);
                        joinGame(id);
                      }}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
                    >
                      Join
                    </button>
                    <button
                      onClick={() => setGameId(parseInt(inputId))}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      Load
                    </button>
                  </div>
                  <button
                    onClick={refetch}
                    className={`w-full px-3 py-2 rounded-lg text-xs transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    🔄 Refresh
                  </button>
                </div>

                {canAcceptDraw && (
                  <button
                    onClick={acceptDraw}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg text-white text-sm"
                  >
                    🤝 Accept Draw Offer
                  </button>
                )}

                <PieceCountBar p1Pieces={p1Pieces} p2Pieces={p2Pieces} />

                <GameInfo
                  gameId={gameId}
                  gameState={gameState}
                  boardState={board}
                  onOfferDraw={offerDraw}
                  onForfeit={forfeit}
                  loading={loading}
                />
              </div>
            </div>

            {/* Board */}
            <div className={`${card} flex-1`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Game #{gameId}</h2>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  isMyTurn() ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {isMyTurn() ? '● Your Turn' : '○ Waiting'}
                </span>
              </div>
              <Board
                board={board}
                selectedSquare={selectedSquare}
                lastCapture={null}
                onSquareClick={handleSquareClick}
                disabled={loading || !isMyTurn()}
              />
              <p className="text-center mt-3 text-xs opacity-50">
                Click a piece to select, then click a destination square
              </p>
            </div>

            {/* Move history */}
            <div className={`${card} w-full xl:w-56 shrink-0`}>
              <h2 className="text-lg font-bold mb-3">Move History</h2>
              <MoveHistory moves={moveHistory} />
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
