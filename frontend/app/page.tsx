'use client';

import { useStacks } from '@/hooks/useStacks';
import { useCheckers } from '@/hooks/useCheckers';
import { useState } from 'react';

const BOARD_SIZE = 8;

const PIECE_SYMBOLS = {
  0: '',
  1: '🔴', // Player 1
  2: '👑', // Player 1 King
  3: '⚫', // Player 2
  4: '♛', // Player 2 King
};

export default function Home() {
  const { isConnected, userData, connectWallet, disconnect } = useStacks();
  const [gameId, setGameId] = useState(0);
  const { createGame, joinGame, makeMove, loading, gameState, boardState, refetch } = useCheckers(gameId);
  
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);

  // Initialize with default pieces if no game loaded
  const displayBoard = boardState.some(p => p > 0) ? boardState : getDefaultBoard();

  function getDefaultBoard() {
    const board = Array(64).fill(0);
    // Player 1 pieces (top)
    [1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23].forEach(pos => board[pos] = 1);
    // Player 2 pieces (bottom)
    [40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62].forEach(pos => board[pos] = 3);
    return board;
  }

  const isDarkSquare = (row: number, col: number) => (row + col) % 2 === 1;

  const handleSquareClick = (row: number, col: number) => {
    const pos = row * 8 + col;
    const piece = displayBoard[pos];
    
    if (selectedSquare === null) {
      if (piece > 0) {
        setSelectedSquare(pos);
      }
    } else {
      if (pos === selectedSquare) {
        setSelectedSquare(null);
      } else {
        makeMove(selectedSquare, pos);
        setSelectedSquare(null);
      }
    }
  };

  const isMyTurn = () => {
    if (!gameState || !userData) return false;
    const myAddress = userData.profile.stxAddress.testnet;
    return gameState['current-turn'].value === myAddress;
  };

  const getPlayerRole = () => {
    if (!gameState || !userData) return null;
    const myAddress = userData.profile.stxAddress.testnet;
    if (gameState.player1.value === myAddress) return 'Player 1 (🔴)';
    if (gameState.player2.value?.value === myAddress) return 'Player 2 (⚫)';
    return 'Spectator';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <nav className="p-6 flex justify-between items-center border-b border-purple-500/30">
        <h1 className="text-3xl font-bold">🕹️ Checkers on Stacks</h1>
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-sm">{userData?.profile?.stxAddress?.testnet?.slice(0, 8)}...</span>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
            >
              Disconnect
            </button>
          </div>
        )}
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {!isConnected ? (
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold mb-4">Welcome to On-Chain Checkers</h2>
            <p className="text-xl text-gray-300 mb-8">Connect your Stacks wallet to start playing</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold mb-4">Game Controls</h2>
              <div className="space-y-4">
                <button
                  onClick={createGame}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors"
                >
                  {loading ? 'Creating...' : 'Create New Game'}
                </button>
                
                <div>
                  <input
                    type="number"
                    value={gameId}
                    onChange={(e) => setGameId(Number(e.target.value))}
                    placeholder="Game ID"
                    className="w-full px-4 py-2 mb-2 bg-black/30 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => joinGame(gameId)}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors mb-2"
                  >
                    {loading ? 'Joining...' : 'Join Game'}
                  </button>
                  <button
                    onClick={refetch}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    Refresh Game
                  </button>
                </div>

                {gameState && (
                  <div className="mt-6 p-4 bg-black/30 rounded-lg space-y-2 text-sm">
                    <div><strong>Game ID:</strong> {gameId}</div>
                    <div><strong>Status:</strong> {gameState['is-active']?.value ? '🟢 Active' : '⚪ Waiting'}</div>
                    <div><strong>Your Role:</strong> {getPlayerRole()}</div>
                    <div><strong>Turn:</strong> {isMyTurn() ? '✅ Your Turn' : '⏳ Opponent'}</div>
                    <div className="text-xs text-gray-400">
                      <strong>Pieces:</strong> {displayBoard.filter(p => p > 0).length} on board
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold mb-4 text-center">Game Board</h2>
              <div className="grid grid-cols-8 gap-0 w-fit mx-auto border-4 border-amber-900 shadow-2xl">
                {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                  Array.from({ length: BOARD_SIZE }).map((_, col) => {
                    const pos = row * 8 + col;
                    const dark = isDarkSquare(row, col);
                    const selected = selectedSquare === pos;
                    const piece = displayBoard[pos];
                    
                    return (
                      <div
                        key={`${row}-${col}`}
                        onClick={() => dark && handleSquareClick(row, col)}
                        className={`
                          w-16 h-16 flex items-center justify-center text-3xl
                          ${dark ? 'bg-amber-900 cursor-pointer hover:bg-amber-800 active:bg-amber-700' : 'bg-amber-100'}
                          ${selected ? 'ring-4 ring-yellow-400' : ''}
                          transition-all duration-200
                        `}
                        title={`Pos: ${pos}, Piece: ${piece}`}
                      >
                        {PIECE_SYMBOLS[piece as keyof typeof PIECE_SYMBOLS]}
                      </div>
                    );
                  })
                )}
              </div>
              <p className="text-center mt-4 text-sm text-gray-300">
                Click a piece, then click destination to make a move
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
