import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";

// ============================================================
// create-game tests
// ============================================================

Clarinet.test({
  name: "create-game: player1 can create a new game and receives game-id 0",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);
  },
});

Clarinet.test({
  name: "create-game: game nonce increments with each new game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "create-game", [], player2.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(0);
    block.receipts[1].result.expectOk().expectUint(1);
  },
});

Clarinet.test({
  name: "create-game: newly created game is not active until player2 joins",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    const game = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    const gameData = game.result.expectSome().expectTuple();
    assertEquals(gameData["is-active"], types.bool(false));
  },
});

Clarinet.test({
  name: "create-game: creator is set as player1 and current-turn",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    const game = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    const gameData = game.result.expectSome().expectTuple();
    assertEquals(gameData["player1"], player1.address);
    assertEquals(gameData["current-turn"], player1.address);
  },
});

Clarinet.test({
  name: "create-game: player2 and winner are none on game creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    const game = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    const gameData = game.result.expectSome().expectTuple();
    gameData["player2"].expectNone();
    gameData["winner"].expectNone();
  },
});

Clarinet.test({
  name: "create-game: board is initialized with player1 pieces on rows 1-3",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    // pos u1 should have a p1 piece (u1)
    const piece1 = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(1)], player1.address);
    piece1.result.expectUint(1);
    // pos u8 should have a p1 piece (u1)
    const piece8 = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(8)], player1.address);
    piece8.result.expectUint(1);
  },
});
