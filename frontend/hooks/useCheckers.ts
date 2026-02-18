'use client';

import { useStacks } from './useStacks';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode, cvToJSON, callReadOnlyFunction } from '@stacks/transactions';
import { useState, useEffect } from 'react';

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'checkers';

export function useCheckers(gameId: number) {
  const { network, userData } = useStacks();
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [boardState, setBoardState] = useState<number[]>(Array(64).fill(0));

  useEffect(() => {
    if (gameId >= 0) {
      fetchGameState();
      const interval = setInterval(fetchGameState, 3000);
      return () => clearInterval(interval);
    }
  }, [gameId]);

  const fetchGameState = async () => {
    try {
      const gameResult = await callReadOnlyFunction({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-game',
        functionArgs: [uintCV(gameId)],
        senderAddress: CONTRACT_ADDRESS,
      });

      const boardResult = await callReadOnlyFunction({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-board',
        functionArgs: [uintCV(gameId)],
        senderAddress: CONTRACT_ADDRESS,
      });

      const game = cvToJSON(gameResult);
      const board = cvToJSON(boardResult);
      
      if (game.value) {
        setGameState(game.value);
      }

      if (board.success && board.value) {
        const pieces = Array(64).fill(0);
        Object.keys(board.value).forEach(key => {
          const pos = parseInt(key.replace('p', ''));
          const value = board.value[key];
          pieces[pos] = typeof value === 'object' ? value.value : value;
        });
        setBoardState(pieces);
        console.log('Board state:', pieces);
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  };

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
        onFinish: (data) => {
          console.log('Game created:', data);
          setTimeout(fetchGameState, 2000);
        },
      });
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
        onFinish: (data) => {
          console.log('Joined game:', data);
          setTimeout(fetchGameState, 2000);
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const makeMove = async (from: number, to: number) => {
    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'move',
        functionArgs: [uintCV(gameId), uintCV(from), uintCV(to)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('Move made:', data);
          setTimeout(fetchGameState, 2000);
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return { createGame, joinGame, makeMove, loading, gameState, boardState, refetch: fetchGameState };
}
