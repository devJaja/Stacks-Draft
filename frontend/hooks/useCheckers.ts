'use client';

import { useStacks } from './useStacks';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode } from '@stacks/transactions';
import { useState } from 'react';

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'checkers';

export function useCheckers() {
  const { network } = useStacks();
  const [loading, setLoading] = useState(false);

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
        onFinish: (data) => console.log('Game created:', data),
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameId: number) => {
    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'join-game',
        functionArgs: [uintCV(gameId)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => console.log('Joined game:', data),
      });
    } finally {
      setLoading(false);
    }
  };

  const makeMove = async (gameId: number, from: number, to: number) => {
    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'move',
        functionArgs: [uintCV(gameId), uintCV(from), uintCV(to)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => console.log('Move made:', data),
      });
    } finally {
      setLoading(false);
    }
  };

  return { createGame, joinGame, makeMove, loading };
}
