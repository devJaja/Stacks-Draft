'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStacks } from './useStacks';
import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  PostConditionMode,
  cvToJSON,
  callReadOnlyFunction,
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, POLL_INTERVAL } from '../constants';
import type { GameState, MoveRecord, PieceType } from '../types/game';

export function useCheckers(gameId: number) {
  const { network, userData } = useStacks();
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [boardState, setBoardState] = useState<number[]>(Array(64).fill(0));
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [lastCapture, setLastCapture] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchGameState = useCallback(async () => {
    if (gameId < 0) return;
    try {
      const [gameResult, boardResult] = await Promise.all([
        callReadOnlyFunction({
          network,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-game',
          functionArgs: [uintCV(gameId)],
          senderAddress: CONTRACT_ADDRESS,
        }),
        callReadOnlyFunction({
          network,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-board',
          functionArgs: [uintCV(gameId)],
          senderAddress: CONTRACT_ADDRESS,
        }),
      ]);

      const game = cvToJSON(gameResult);
      const board = cvToJSON(boardResult);

      if (game.value) setGameState(game.value as GameState);

      if (board.success && board.value) {
        const pieces = Array(64).fill(0);
        Object.keys(board.value).forEach(key => {
          const pos = parseInt(key.replace('p', ''));
          const val = board.value[key];
          pieces[pos] = typeof val === 'object' ? parseInt(val.value) : parseInt(val);
        });
        setBoardState(pieces);
      }
      setError(null);
    } catch (e) {
      console.error('Error fetching game state:', e);
      setError('Failed to fetch game state');
    }
  }, [gameId, network]);

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  const createGame = async () => {
    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-game',
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => setTimeout(fetchGameState, 2000),
      });
    } catch (e) {
      setError('Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gId: number) => {
    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'join-game',
        functionArgs: [uintCV(gId)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => setTimeout(fetchGameState, 2000),
      });
    } catch (e) {
      setError('Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  const makeMove = async (from: number, to: number) => {
    const piece = boardState[from] as PieceType;
    const diff = Math.abs(from - to);
    const wasCapture = diff === 14 || diff === 18;
    const wasPromotion =
      (piece === 1 && to >= 56) || (piece === 3 && to <= 7);

    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'move',
        functionArgs: [uintCV(gameId), uintCV(from), uintCV(to)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {
          setMoveHistory(prev => [
            ...prev,
            { from, to, piece, wasCapture, wasPromotion, timestamp: Date.now() },
          ]);
          if (wasCapture) setLastCapture(Date.now());
          setTimeout(fetchGameState, 2000);
        },
      });
    } catch (e) {
      setError('Failed to make move');
    } finally {
      setLoading(false);
    }
  };

  const offerDraw = async () => {
    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'offer-draw',
        functionArgs: [uintCV(gameId)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => setTimeout(fetchGameState, 2000),
      });
    } catch (e) {
      setError('Failed to offer draw');
    } finally {
      setLoading(false);
    }
  };

  const acceptDraw = async () => {
    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'accept-draw',
        functionArgs: [uintCV(gameId)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => setTimeout(fetchGameState, 2000),
      });
    } catch (e) {
      setError('Failed to accept draw');
    } finally {
      setLoading(false);
    }
  };

  const forfeit = async () => {
    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'forfeit-game',
        functionArgs: [uintCV(gameId)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => setTimeout(fetchGameState, 2000),
      });
    } catch (e) {
      setError('Failed to forfeit');
    } finally {
      setLoading(false);
    }
  };

  return {
    createGame,
    joinGame,
    makeMove,
    offerDraw,
    acceptDraw,
    forfeit,
    loading,
    gameState,
    boardState,
    moveHistory,
    lastCapture,
    error,
    refetch: fetchGameState,
  };
}
