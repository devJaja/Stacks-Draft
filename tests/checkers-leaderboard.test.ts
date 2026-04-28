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
  
});

describe('Stacks Checkers Leaderboard: Match Result Tests', () => {
  
  it('should prevent unauthorized callers from recording matches', () => {
    registerPlayer(WALLET_1);
    registerPlayer(WALLET_2);
    const { result } = recordMatch(WALLET_1, WALLET_2, WALLET_3);
    expect(result).toBeErr(Cl.uint(ERR_NOT_AUTHORIZED));
  });
  
  it('should allow authorized callers to record match results', () => {
    setAuthorized(WALLET_5, true, DEPLOYER);
    registerPlayer(WALLET_1);
    registerPlayer(WALLET_2);
    
    const { result } = recordMatch(WALLET_1, WALLET_2, WALLET_5);
    expect(result).toBeOk(Cl.bool(true));
  });
  
  it('should correctly increment winner stats and rating', () => {
    setAuthorized(WALLET_5, true, DEPLOYER);
    registerPlayer(WALLET_1);
    registerPlayer(WALLET_2);
    recordMatch(WALLET_1, WALLET_2, WALLET_5);
    
    const stats: any = getPlayerStats(WALLET_1).result;
    expect(stats.value.data['wins']).toStrictEqual(Cl.uint(1));
    expect(stats.value.data['rating']).toStrictEqual(Cl.uint(INITIAL_RATING + RATING_CHANGE));
  });
  
  it('should correctly increment loser stats and decrement rating', () => {
    setAuthorized(WALLET_5, true, DEPLOYER);
    registerPlayer(WALLET_1);
    registerPlayer(WALLET_2);
    recordMatch(WALLET_1, WALLET_2, WALLET_5);
    
    const stats: any = getPlayerStats(WALLET_2).result;
    expect(stats.value.data['losses']).toStrictEqual(Cl.uint(1));
    expect(stats.value.data['rating']).toStrictEqual(Cl.uint(INITIAL_RATING - RATING_CHANGE));
  });
  
  it('should increment games-played for both participants', () => {
    setAuthorized(WALLET_5, true, DEPLOYER);
    registerPlayer(WALLET_1);
    registerPlayer(WALLET_2);
    recordMatch(WALLET_1, WALLET_2, WALLET_5);
    
    const s1: any = getPlayerStats(WALLET_1).result;
    const s2: any = getPlayerStats(WALLET_2).result;
    expect(s1.value.data['games-played']).toStrictEqual(Cl.uint(1));
    expect(s2.value.data['games-played']).toStrictEqual(Cl.uint(1));
  });
  
  it('should ensure rating does not drop below zero', () => {
    setAuthorized(WALLET_5, true, DEPLOYER);
    registerPlayer(WALLET_1);
    registerPlayer(WALLET_2);
    
    // Manually force many losses to test floor logic
    for (let i = 0; i < 50; i++) {
      recordMatch(WALLET_1, WALLET_2, WALLET_5);
    }
    
    const rating = getRating(WALLET_2).result;
    expect(rating).toStrictEqual(Cl.uint(0));
  });
  
  it('should fail recording if caller was de-authorized', () => {
    setAuthorized(WALLET_5, true, DEPLOYER);
    setAuthorized(WALLET_5, false, DEPLOYER);
    
    const { result } = recordMatch(WALLET_1, WALLET_2, WALLET_5);
    expect(result).toBeErr(Cl.uint(ERR_NOT_AUTHORIZED));
  });
  
  it('should auto-initialize winner if not registered', () => {
    setAuthorized(WALLET_5, true, DEPLOYER);
    recordMatch(WALLET_1, WALLET_2, WALLET_5);
    
    const rating = getRating(WALLET_1).result;
    expect(rating).toStrictEqual(Cl.uint(INITIAL_RATING + RATING_CHANGE));
  });
  
  it('should auto-initialize loser if not registered', () => {
    setAuthorized(WALLET_5, true, DEPLOYER);
    recordMatch(WALLET_1, WALLET_2, WALLET_5);
    
    const rating = getRating(WALLET_2).result;
    expect(rating).toStrictEqual(Cl.uint(INITIAL_RATING - RATING_CHANGE));
  });
  
});

describe('Stacks Checkers Leaderboard: Integration Scenarios', () => {
  
  it('should handle a sequence of wins and losses for a single player', () => {
    setAuthorized(WALLET_5, true, DEPLOYER);
    recordMatch(WALLET_1, WALLET_2, WALLET_5); // W1 wins (+25)
    recordMatch(WALLET_2, WALLET_1, WALLET_5); // W1 loses (-25)
    recordMatch(WALLET_1, WALLET_3, WALLET_5); // W1 wins (+25)
    
    const rating = getRating(WALLET_1).result;
    expect(rating).toStrictEqual(Cl.uint(INITIAL_RATING + RATING_CHANGE));
  });
  
