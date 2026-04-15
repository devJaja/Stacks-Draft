import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";

// ============================================================
// Helpers
// ============================================================

/** Set up an active game between wallet_1 and wallet_2, returns game-id 0 */
function setupActiveGame(chain: Chain, accounts: Map<string, Account>): { p1: Account; p2: Account } {
  const p1 = accounts.get("wallet_1")!;
  const p2 = accounts.get("wallet_2")!;
  chain.mineBlock([
    Tx.contractCall("checkers", "create-game", [], p1.address),
    Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
  ]);
  return { p1, p2 };
}

// ============================================================
// create-game
// ============================================================

Clarinet.test({
  name: "create-game: first game returns game-id 0",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);
  },
});

Clarinet.test({
  name: "create-game: sequential games receive incrementing ids",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    const p3 = accounts.get("wallet_3")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "create-game", [], p2.address),
      Tx.contractCall("checkers", "create-game", [], p3.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);
    block.receipts[1].result.expectOk().expectUint(1);
    block.receipts[2].result.expectOk().expectUint(2);
  },
});

Clarinet.test({
  name: "create-game: new game is inactive until player2 joins",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const game = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address);
    assertEquals(game.result.expectSome().expectTuple()["is-active"], types.bool(false));
  },
});

Clarinet.test({
  name: "create-game: creator is stored as player1 with first turn",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["player1"], p1.address);
    assertEquals(data["current-turn"], p1.address);
  },
});

Clarinet.test({
  name: "create-game: player2 and winner are none on creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    data["player2"].expectNone();
    data["winner"].expectNone();
  },
});

Clarinet.test({
  name: "create-game: all 12 player1 starting positions hold piece-p1 (u1)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const p1Positions = [1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23];
    for (const pos of p1Positions) {
      const piece = chain.callReadOnlyFn("checkers", "get-piece",
        [types.uint(0), types.uint(pos)], p1.address);
      piece.result.expectUint(1);
    }
  },
});

Clarinet.test({
  name: "create-game: all 12 player2 starting positions hold piece-p2 (u3)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const p2Positions = [40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62];
    for (const pos of p2Positions) {
      const piece = chain.callReadOnlyFn("checkers", "get-piece",
        [types.uint(0), types.uint(pos)], p1.address);
      piece.result.expectUint(3);
    }
  },
});

// ============================================================
// join-game
// ============================================================

Clarinet.test({
  name: "join-game: player2 joins successfully and receives ok true",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "join-game: game becomes active after player2 joins",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["is-active"], types.bool(true));
  },
});

Clarinet.test({
  name: "join-game: player2 principal is stored correctly in game state",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["player2"].expectSome(), p2.address);
  },
});

Clarinet.test({
  name: "join-game: returns err-game-not-found (u100) for nonexistent game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p2 = accounts.get("wallet_2")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(42)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "join-game: returns err-game-full (u101) when player1 tries to join own game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(101);
  },
});
