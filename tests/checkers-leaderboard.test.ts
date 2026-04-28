import { describe, expect, it } from 'vitest';
import { Cl } from '@stacks/transactions';

/**
 * Stacks Checkers Leaderboard Test Suite
 * 
 * This suite validates the on-chain logic for player ratings,
 * registration, and authorization using Simnet.
 */
const accounts = simnet.getAccounts();
const DEPLOYER = accounts.get('deployer')!;
const WALLET_1 = accounts.get('wallet_1')!;
const WALLET_2 = accounts.get('wallet_2')!;
const WALLET_3 = accounts.get('wallet_3')!;
const WALLET_4 = accounts.get('wallet_4')!;
const WALLET_5 = accounts.get('wallet_5')!;

