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

const ERR_NOT_AUTHORIZED = 100;
const ERR_ALREADY_REGISTERED = 101;
const ERR_NOT_REGISTERED = 102;

const INITIAL_RATING = 1200;
const RATING_CHANGE = 25;

/**
 * Helper to register a player on the stacks leaderboard
 * @param sender - The principal registering
 */
function registerPlayer(sender: string) {
  return simnet.callPublicFn(
    'checkers-leaderboard',
    'register-player',
    [],
    sender
  );
}

/**
 * Helper to set authorized callers for the stacks contract
 */
function setAuthorized(caller: string, authorized: boolean, sender: string) {
  return simnet.callPublicFn(
    'checkers-leaderboard',
    'set-authorized-caller',
    [Cl.principal(caller), Cl.bool(authorized)],
    sender
  );
}

/**
 * Helper to record a match result on stacks
 */
function recordMatch(winner: string, loser: string, sender: string) {
  return simnet.callPublicFn(
    'checkers-leaderboard',
    'record-match',
    [Cl.principal(winner), Cl.principal(loser)],
    sender
  );
}

