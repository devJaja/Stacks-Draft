'use client';

import { useState, useEffect, useCallback } from 'react';
import { callReadOnlyFunction, cvToJSON, stringAsciiCV } from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { PostConditionMode } from '@stacks/transactions';
import { useStacks } from './useStacks';
import { CONTRACT_ADDRESS, LEADERBOARD_CONTRACT_NAME } from '../constants';
import type { PlayerStats } from '../types/game';

export function useLeaderboard() {
  const { network, userData } = useStacks();
  const [myStats, setMyStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMyStats = useCallback(async () => {
    if (!userData) return;
    try {
      const address = userData.profile.stxAddress.mainnet;
      const { principalCV } = await import('@stacks/transactions');
      const result = await callReadOnlyFunction({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: LEADERBOARD_CONTRACT_NAME,
        functionName: 'get-player-stats',
        functionArgs: [principalCV(address)],
        senderAddress: CONTRACT_ADDRESS,
      });
      const data = cvToJSON(result);
      if (data.value) setMyStats(data.value as unknown as PlayerStats);
    } catch (e) {
      console.error('Error fetching leaderboard stats:', e);
    }
  }, [network, userData]);

  useEffect(() => {
    fetchMyStats();
  }, [fetchMyStats]);

  const registerPlayer = async () => {
    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: LEADERBOARD_CONTRACT_NAME,
        functionName: 'register-player',
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => setTimeout(fetchMyStats, 2000),
      });
    } finally {
      setLoading(false);
    }
  };

  const setUsername = async (username: string) => {
    setLoading(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: LEADERBOARD_CONTRACT_NAME,
        functionName: 'set-username',
        functionArgs: [stringAsciiCV(username)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => setTimeout(fetchMyStats, 2000),
      });
    } finally {
      setLoading(false);
    }
  };

  return { myStats, loading, registerPlayer, setUsername, refetch: fetchMyStats };
}
