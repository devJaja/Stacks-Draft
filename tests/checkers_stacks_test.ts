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
