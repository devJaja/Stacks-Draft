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

/**
 * Helper to fetch player stats from stacks maps
 */
function getPlayerStats(player: string) {
  return simnet.callReadOnlyFn(
    'checkers-leaderboard',
    'get-player-stats',
    [Cl.principal(player)],
    DEPLOYER
  );
}

/**
 * Helper to fetch just the rating from stacks contract
 */
function getRating(player: string) {
  return simnet.callReadOnlyFn(
    'checkers-leaderboard',
    'get-rating',
    [Cl.principal(player)],
    DEPLOYER
  );
}

describe('Stacks Checkers Leaderboard: Authorization Tests', () => {
  
  it('should allow the owner to authorize a new game contract', () => {
    const { result } = setAuthorized(WALLET_1, true, DEPLOYER);
    expect(result).toBeOk(Cl.bool(true));
  });
  
  it('should verify that unauthorized users cannot set callers', () => {
    const { result } = setAuthorized(WALLET_2, true, WALLET_1);
    expect(result).toBeErr(Cl.uint(ERR_NOT_AUTHORIZED));
  });
  
  it('should allow owner to toggle authorization off', () => {
    setAuthorized(WALLET_1, true, DEPLOYER);
    const { result } = setAuthorized(WALLET_1, false, DEPLOYER);
    expect(result).toBeOk(Cl.bool(true));
  });
  
});

describe('Stacks Checkers Leaderboard: Registration Tests', () => {
  
  it('should allow a new player to register on stacks', () => {
    const { result } = registerPlayer(WALLET_1);
    expect(result).toBeOk(Cl.bool(true));
    
    const stats: any = getPlayerStats(WALLET_1).result;
    expect(stats.value.data['rating']).toStrictEqual(Cl.uint(INITIAL_RATING));
  });
  
  it('should prevent a player from registering twice on stacks', () => {
    registerPlayer(WALLET_2);
    const { result } = registerPlayer(WALLET_2);
    expect(result).toBeErr(Cl.uint(ERR_ALREADY_REGISTERED));
  });
  
  it('should return none for an unregistered player stats', () => {
    const { result } = getPlayerStats(WALLET_3);
    expect(result).toBeNone();
  });
  
  it('should return 0 rating for an unregistered player via getter', () => {
    const { result } = getRating(WALLET_4);
    expect(result).toStrictEqual(Cl.uint(0));
  });
  
