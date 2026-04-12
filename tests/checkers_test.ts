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
