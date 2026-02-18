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

  return { loading };
}
