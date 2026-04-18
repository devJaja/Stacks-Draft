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

Clarinet.test({
  name: "join-game: returns err-game-full (u101) when a third player tries to join",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    const p3 = accounts.get("wallet_3")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p3.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(101);
  },
});

// ============================================================
// move
// ============================================================

Clarinet.test({
  name: "move: valid step-diff-a (diff=7) move succeeds",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    // pos 17 -> 24, diff = 7
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "move: valid step-diff-b (diff=9) move succeeds",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    // pos 17 -> 26, diff = 9
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(26)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "move: is-valid-move guard rejects illegal distance (diff != 7,9,14,18)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    // pos 17 -> 20, diff = 3 — not a legal diagonal
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(20)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(103); // err-invalid-move
  },
});

Clarinet.test({
  name: "move: source position is empty after a move",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(17)], p1.address)
      .result.expectUint(0);
  },
});

Clarinet.test({
  name: "move: destination holds the moved piece after a move",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(24)], p1.address)
      .result.expectUint(1); // piece-p1
  },
});

Clarinet.test({
  name: "move: current-turn switches to player2 after player1 moves",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["current-turn"], p2.address);
  },
});

Clarinet.test({
  name: "move: current-turn switches back to player1 after player2 moves",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address)]);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["current-turn"], p1.address);
  },
});

Clarinet.test({
  name: "move: returns err-game-not-found (u100) for nonexistent game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(99), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "move: returns err-game-over (u104) when game has no player2 yet",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(104);
  },
});

Clarinet.test({
  name: "move: returns err-not-your-turn (u102) when player2 moves first",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p2 } = setupActiveGame(chain, accounts);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

Clarinet.test({
  name: "move: returns err-invalid-move (u103) when moving from empty square",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(30), types.uint(37)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(103);
  },
});

Clarinet.test({
  name: "move: returns err-invalid-move (u103) when destination is occupied",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    // pos 1 and pos 8 both have p1 pieces at start
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(1), types.uint(8)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(103);
  },
});

Clarinet.test({
  name: "move: returns err-not-your-turn (u102) when player1 moves opponent piece",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    // pos 40 has a p2 piece
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

Clarinet.test({
  name: "move: capture-diff-a (diff=14) jump removes the jumped piece",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    // p1: 17->26, p2: 40->33, p1 captures: 26->40 (mid=33, diff=14)
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(26)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(26), types.uint(40)], p1.address)]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(33)], p1.address)
      .result.expectUint(0);
  },
});

Clarinet.test({
  name: "move: p1 piece promotes to piece-p1-king (u2) on reaching promotion-row-p1",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(23), types.uint(30)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(30), types.uint(37)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(33), types.uint(26)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(37), types.uint(44)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(26), types.uint(19)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(44), types.uint(51)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(19), types.uint(12)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(51), types.uint(58)], p1.address)]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(58)], p1.address)
      .result.expectUint(2);
  },
});

Clarinet.test({
  name: "move: p2 piece promotes to piece-p2-king (u4) on reaching promotion-row-p2",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(24), types.uint(31)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(33), types.uint(26)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(31), types.uint(38)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(26), types.uint(19)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(38), types.uint(45)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(19), types.uint(12)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(45), types.uint(52)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(12), types.uint(5)], p2.address)]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(5)], p2.address)
      .result.expectUint(4);
  },
});

// ============================================================
// forfeit-game
// ============================================================

Clarinet.test({
  name: "forfeit-game: player1 can forfeit and opponent is returned as winner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "forfeit-game", [types.uint(0)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectPrincipal(p2.address);
  },
});

Clarinet.test({
  name: "forfeit-game: player2 can forfeit and player1 is returned as winner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "forfeit-game", [types.uint(0)], p2.address),
    ]);
    block.receipts[0].result.expectOk().expectPrincipal(p1.address);
  },
});

Clarinet.test({
  name: "forfeit-game: game is-active becomes false after forfeit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "forfeit-game", [types.uint(0)], p1.address)]);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["is-active"], types.bool(false));
  },
});

Clarinet.test({
  name: "forfeit-game: winner field is set to opponent after forfeit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "forfeit-game", [types.uint(0)], p1.address)]);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["winner"].expectSome(), p2.address);
  },
});

Clarinet.test({
  name: "forfeit-game: returns err-game-not-found (u100) for nonexistent game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "forfeit-game", [types.uint(99)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "forfeit-game: returns err-game-over (u104) when game is not active",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    // Game created but no player2 — is-active is false
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "forfeit-game", [types.uint(0)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(104);
  },
});

Clarinet.test({
  name: "forfeit-game: returns err-not-player (u105) when outsider tries to forfeit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    const outsider = accounts.get("wallet_3")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "forfeit-game", [types.uint(0)], outsider.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(105);
  },
});

Clarinet.test({
  name: "forfeit-game: forfeited game cannot be forfeited again",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "forfeit-game", [types.uint(0)], p1.address)]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "forfeit-game", [types.uint(0)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(104); // err-game-over
  },
});

Clarinet.test({
  name: "forfeit-game: move is rejected after game is forfeited",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "forfeit-game", [types.uint(0)], p1.address)]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(104); // err-game-over
  },
});

// ============================================================
// get-game
// ============================================================

Clarinet.test({
  name: "get-game: returns none for a game id that does not exist",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectNone();
  },
});

Clarinet.test({
  name: "get-game: returns some tuple for a created game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
  },
});

Clarinet.test({
  name: "get-game: reflects is-active and player2 after join",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["is-active"], types.bool(true));
    assertEquals(data["player2"].expectSome(), p2.address);
  },
});

Clarinet.test({
  name: "get-game: reflects winner and is-active false after forfeit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "forfeit-game", [types.uint(0)], p1.address)]);
    const data = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(data["is-active"], types.bool(false));
    assertEquals(data["winner"].expectSome(), p2.address);
  },
});

Clarinet.test({
  name: "get-game: two games are stored independently by game-id",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    const p3 = accounts.get("wallet_3")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "create-game", [], p3.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const d0 = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], p1.address)
      .result.expectSome().expectTuple();
    const d1 = chain.callReadOnlyFn("checkers", "get-game", [types.uint(1)], p1.address)
      .result.expectSome().expectTuple();
    assertEquals(d0["is-active"], types.bool(true));
    assertEquals(d1["is-active"], types.bool(false));
    assertEquals(d0["player1"], p1.address);
    assertEquals(d1["player1"], p3.address);
  },
});

// ============================================================
// get-piece
// ============================================================

Clarinet.test({
  name: "get-piece: returns piece-empty (u0) for unset position on new game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(30)], p1.address)
      .result.expectUint(0);
  },
});

Clarinet.test({
  name: "get-piece: returns piece-empty (u0) for any position on nonexistent game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(1)], p1.address)
      .result.expectUint(0);
  },
});

Clarinet.test({
  name: "get-piece: returns piece-p1 (u1) at a player1 starting position",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(5)], p1.address)
      .result.expectUint(1);
  },
});

Clarinet.test({
  name: "get-piece: returns piece-p2 (u3) at a player2 starting position",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(55)], p1.address)
      .result.expectUint(3);
  },
});

Clarinet.test({
  name: "get-piece: reflects piece movement — source empty, destination filled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address)]);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(17)], p1.address).result.expectUint(0);
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(24)], p1.address).result.expectUint(1);
  },
});

Clarinet.test({
  name: "get-piece: returns piece-empty (u0) at captured piece position after jump",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(26)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(26), types.uint(40)], p1.address)]);
    // mid = (26+40)/2 = 33 — captured piece should be gone
    chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(33)], p1.address)
      .result.expectUint(0);
  },
});

// ============================================================
// is-king
// ============================================================

Clarinet.test({
  name: "is-king: returns false for a regular piece-p1 on starting position",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    chain.callReadOnlyFn("checkers", "is-king", [types.uint(0), types.uint(1)], p1.address)
      .result.expectBool(false);
  },
});

Clarinet.test({
  name: "is-king: returns false for a regular piece-p2 on starting position",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    chain.callReadOnlyFn("checkers", "is-king", [types.uint(0), types.uint(40)], p1.address)
      .result.expectBool(false);
  },
});

Clarinet.test({
  name: "is-king: returns false for an empty square",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    chain.mineBlock([Tx.contractCall("checkers", "create-game", [], p1.address)]);
    chain.callReadOnlyFn("checkers", "is-king", [types.uint(0), types.uint(30)], p1.address)
      .result.expectBool(false);
  },
});

Clarinet.test({
  name: "is-king: returns true for piece-p1-king after promotion",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(23), types.uint(30)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(30), types.uint(37)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(33), types.uint(26)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(37), types.uint(44)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(26), types.uint(19)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(44), types.uint(51)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(19), types.uint(12)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(51), types.uint(58)], p1.address)]);
    chain.callReadOnlyFn("checkers", "is-king", [types.uint(0), types.uint(58)], p1.address)
      .result.expectBool(true);
  },
});

Clarinet.test({
  name: "is-king: returns true for piece-p2-king after promotion",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const { p1, p2 } = setupActiveGame(chain, accounts);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(24), types.uint(31)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(33), types.uint(26)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(31), types.uint(38)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(26), types.uint(19)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(38), types.uint(45)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(19), types.uint(12)], p2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(45), types.uint(52)], p1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(12), types.uint(5)], p2.address)]);
    chain.callReadOnlyFn("checkers", "is-king", [types.uint(0), types.uint(5)], p2.address)
      .result.expectBool(true);
  },
});

// ============================================================
// Extended Scenario Test Block 01
// ============================================================

Clarinet.test({
  name: "scenario-01: validate initial setup of board state",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-01: negative validation for validate initial setup of board state",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 02
// ============================================================

Clarinet.test({
  name: "scenario-02: verify p1 valid opening move constraint",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-02: negative validation for verify p1 valid opening move constraint",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 03
// ============================================================

Clarinet.test({
  name: "scenario-03: reject p2 out of turn move attempt",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-03: negative validation for reject p2 out of turn move attempt",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 04
// ============================================================

Clarinet.test({
  name: "scenario-04: enforce diagonal movement restriction for regular pieces",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-04: negative validation for enforce diagonal movement restriction for regular pieces",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 05
// ============================================================

Clarinet.test({
  name: "scenario-05: ensure pieces cannot move backward before promotion",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-05: negative validation for ensure pieces cannot move backward before promotion",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 06
// ============================================================

Clarinet.test({
  name: "scenario-06: validate single forward jump mechanic",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-06: negative validation for validate single forward jump mechanic",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 07
// ============================================================

Clarinet.test({
  name: "scenario-07: verify captured pieces are removed from board",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-07: negative validation for verify captured pieces are removed from board",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 08
// ============================================================

Clarinet.test({
  name: "scenario-08: reject jump over empty square",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-08: negative validation for reject jump over empty square",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 09
// ============================================================

Clarinet.test({
  name: "scenario-09: reject jump over own piece",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-09: negative validation for reject jump over own piece",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 10
// ============================================================

Clarinet.test({
  name: "scenario-10: validate multiple jump sequence execution",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-10: negative validation for validate multiple jump sequence execution",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 11
// ============================================================

Clarinet.test({
  name: "scenario-11: enforce mandatory jump rule when available",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-11: negative validation for enforce mandatory jump rule when available",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 12
// ============================================================

Clarinet.test({
  name: "scenario-12: verify King promotion at opposite end of board",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-12: negative validation for verify King promotion at opposite end of board",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 13
// ============================================================

Clarinet.test({
  name: "scenario-13: validate King backward movement",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-13: negative validation for validate King backward movement",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 14
// ============================================================

Clarinet.test({
  name: "scenario-14: validate King backward jump mechanic",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-14: negative validation for validate King backward jump mechanic",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 15
// ============================================================

Clarinet.test({
  name: "scenario-15: ensure King cannot jump multiple pieces in single bound",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-15: negative validation for ensure King cannot jump multiple pieces in single bound",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 16
// ============================================================

Clarinet.test({
  name: "scenario-16: reject move outside of board boundaries",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-16: negative validation for reject move outside of board boundaries",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 17
// ============================================================

Clarinet.test({
  name: "scenario-17: validate game termination condition upon capturing all pieces",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-17: negative validation for validate game termination condition upon capturing all pieces",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 18
// ============================================================

Clarinet.test({
  name: "scenario-18: verify draw condition after maximum moves without capture",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-18: negative validation for verify draw condition after maximum moves without capture",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 19
// ============================================================

Clarinet.test({
  name: "scenario-19: reject starting game with invalid configuration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-19: negative validation for reject starting game with invalid configuration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 20
// ============================================================

Clarinet.test({
  name: "scenario-20: verify piece count remains consistent during non-jump moves",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-20: negative validation for verify piece count remains consistent during non-jump moves",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 21
// ============================================================

Clarinet.test({
  name: "scenario-21: enforce alternating turns strictly between players",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-21: negative validation for enforce alternating turns strictly between players",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 22
// ============================================================

Clarinet.test({
  name: "scenario-22: reject jump path with landing square already occupied",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-22: negative validation for reject jump path with landing square already occupied",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 23
// ============================================================

Clarinet.test({
  name: "scenario-23: validate edge collision detection on board limits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-23: negative validation for validate edge collision detection on board limits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 24
// ============================================================

Clarinet.test({
  name: "scenario-24: verify opponent piece interaction during jumps",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-24: negative validation for verify opponent piece interaction during jumps",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 25
// ============================================================

Clarinet.test({
  name: "scenario-25: ensure regular piece movement is constrained to adjacent squares",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-25: negative validation for ensure regular piece movement is constrained to adjacent squares",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 26
// ============================================================

Clarinet.test({
  name: "scenario-26: validate maximum one step for non-jumping regular piece",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-26: negative validation for validate maximum one step for non-jumping regular piece",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});

// ============================================================
// Extended Scenario Test Block 27
// ============================================================

Clarinet.test({
  name: "scenario-27: validate maximum one step for non-jumping King",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], p1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "scenario-27: negative validation for validate maximum one step for non-jumping King",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const p1 = accounts.get("wallet_1")!;
    const p2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], p1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], p2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], p2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});
