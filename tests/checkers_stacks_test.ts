import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";

// ─────────────────────────────────────────────────────────────
// Shared helper — spins up an active game on the Stacks chain
// ─────────────────────────────────────────────────────────────
function activeGame(chain: Chain, accounts: Map<string, Account>) {
  const p1 = accounts.get("wallet_1")!;
  const p2 = accounts.get("wallet_2")!;
  chain.mineBlock([
    Tx.contractCall("checkers", "create-game", [], p1.address),
    Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
  ]);
  return { p1, p2 };
}

// ─────────────────────────────────────────────────────────────
// create-game
// ─────────────────────────────────────────────────────────────

Clarinet.test({
  name: "[stacks] create-game: deploying first game on Stacks returns game-id 0",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);
  },
});

Clarinet.test({
  name: "[stacks] create-game: Stacks game-nonce increments with each new game",
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
  name: "[stacks] create-game: Stacks principal stored as player1 and current-turn",
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
  name: "[stacks] create-game: new Stacks game has no player2 and no winner",
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
  name: "[stacks] create-game: Stacks game is inactive before second player joins",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["is-active"], types.bool(false));
  },
});

Clarinet.test({
  name: "[stacks] create-game: Stacks board initializes p1 pieces at positions 1,3,5,7",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    for (const pos of [1, 3, 5, 7]) {
      chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(pos)], p1.address)
        .result.expectUint(1);
    }
  },
});

Clarinet.test({
  name: "[stacks] create-game: Stacks board initializes p1 pieces at positions 8,10,12,14",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    for (const pos of [8, 10, 12, 14]) {
      chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(pos)], p1.address)
        .result.expectUint(1);
    }
  },
});

Clarinet.test({
  name: "[stacks] create-game: Stacks board initializes p2 pieces at positions 40,42,44,46",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    for (const pos of [40, 42, 44, 46]) {
      chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(pos)], p1.address)
        .result.expectUint(3);
    }
  },
});

Clarinet.test({
  name: "[stacks] create-game: Stacks board initializes p2 pieces at positions 56,58,60,62",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    for (const pos of [56, 58, 60, 62]) {
      chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(pos)], p1.address)
        .result.expectUint(3);
    }
  },
});

Clarinet.test({
  name: "[stacks] create-game: Stacks board middle squares are empty after init",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    for (const pos of [24, 25, 30, 31, 32, 33]) {
      chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(pos)], p1.address)
        .result.expectUint(0);
    }
  },
});

// ─────────────────────────────────────────────────────────────
// join-game
// ─────────────────────────────────────────────────────────────

Clarinet.test({
  name: "[stacks] join-game: second Stacks principal joins and receives ok true",
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
  name: "[stacks] join-game: Stacks game becomes active after player2 joins",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = activeGame(chain, accounts);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["is-active"], types.bool(true));
  },
});

Clarinet.test({
  name: "[stacks] join-game: player2 Stacks principal stored correctly in game map",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = activeGame(chain, accounts);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["player2"].expectSome(), p2.address);
  },
});

Clarinet.test({
  name: "[stacks] join-game: returns err-game-not-found for missing Stacks game id",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p2 = accounts.get("wallet_2")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(77)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "[stacks] join-game: Stacks player1 cannot join their own game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(101);
  },
});

Clarinet.test({
  name: "[stacks] join-game: third Stacks principal cannot join a full game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = activeGame(chain, accounts);
    const p3 = accounts.get("wallet_3")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p3.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(101);
  },
});

// ─────────────────────────────────────────────────────────────
// move
// ─────────────────────────────────────────────────────────────

Clarinet.test({
  name: "[stacks] move: Stacks player1 makes a valid diagonal move and gets ok true",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = activeGame(chain, accounts);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "[stacks] move: Stacks board clears source square after move",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = activeGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address)]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(17)], p1.address)
      .result.expectUint(0);
  },
});

Clarinet.test({
  name: "[stacks] move: Stacks board places piece at destination after move",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = activeGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address)]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(24)], p1.address)
      .result.expectUint(1);
  },
});

Clarinet.test({
  name: "[stacks] move: Stacks current-turn switches to player2 after player1 moves",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = activeGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address)]);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["current-turn"], p2.address);
  },
});

Clarinet.test({
  name: "[stacks] move: Stacks current-turn returns to player1 after player2 moves",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = activeGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address)]);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["current-turn"], p1.address);
  },
});

Clarinet.test({
  name: "[stacks] move: Stacks contract rejects move on nonexistent game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(99), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(100);
  },
});
