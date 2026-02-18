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

  return { createGame, loading };
}
