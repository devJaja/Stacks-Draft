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

Clarinet.test({
  name: "create-game: board is initialized with player2 pieces on rows 6-8",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    // pos u40 should have a p2 piece (u3)
    const piece40 = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(40)], player1.address);
    piece40.result.expectUint(3);
    // pos u62 should have a p2 piece (u3)
    const piece62 = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(62)], player1.address);
    piece62.result.expectUint(3);
  },
});

Clarinet.test({
  name: "create-game: middle board positions are empty after initialization",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    // pos u30 is in the middle, should be empty (u0)
    const piece30 = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(30)], player1.address);
    piece30.result.expectUint(0);
  },
});

// ============================================================
// join-game tests
// ============================================================

Clarinet.test({
  name: "join-game: player2 can successfully join an existing game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "join-game: game becomes active after player2 joins",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    const game = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    const gameData = game.result.expectSome().expectTuple();
    assertEquals(gameData["is-active"], types.bool(true));
  },
});

Clarinet.test({
  name: "join-game: player2 address is stored correctly after joining",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    const game = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    const gameData = game.result.expectSome().expectTuple();
    assertEquals(gameData["player2"].expectSome(), player2.address);
  },
});

Clarinet.test({
  name: "join-game: fails with err-game-not-found when game does not exist",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player2 = accounts.get("wallet_2")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(99)], player2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(100); // err-game-not-found
  },
});

Clarinet.test({
  name: "join-game: player1 cannot join their own game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(101); // err-game-full
  },
});

Clarinet.test({
  name: "join-game: third player cannot join a game that already has two players",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    const player3 = accounts.get("wallet_3")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player3.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(101); // err-game-full
  },
});

// ============================================================
// move tests
// ============================================================

Clarinet.test({
  name: "move: player1 can make a valid diagonal move forward",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    // p1 piece at pos 17, move to pos 24 (diff=7, valid diagonal)
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], player1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "move: piece is removed from source position after a move",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], player1.address),
    ]);
    const fromPiece = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(17)], player1.address);
    fromPiece.result.expectUint(0); // source should be empty
  },
});

Clarinet.test({
  name: "move: piece appears at destination position after a move",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], player1.address),
    ]);
    const toPiece = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(24)], player1.address);
    toPiece.result.expectUint(1); // p1 piece should be at destination
  },
});

Clarinet.test({
  name: "move: turn switches to player2 after player1 moves",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], player1.address),
    ]);
    const game = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    const gameData = game.result.expectSome().expectTuple();
    assertEquals(gameData["current-turn"], player2.address);
  },
});

Clarinet.test({
  name: "move: fails with err-not-your-turn when player2 tries to move first",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(49), types.uint(42)], player2.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102); // err-not-your-turn
  },
});

Clarinet.test({
  name: "move: fails with err-game-not-found when game id does not exist",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(99), types.uint(17), types.uint(24)], player1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(100); // err-game-not-found
  },
});

Clarinet.test({
  name: "move: fails with err-game-over when game is not yet active",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    // game has no player2, is-active is false
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], player1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(104); // err-game-over
  },
});

Clarinet.test({
  name: "move: fails with err-invalid-move when moving to an occupied position",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    // pos u8 already has a p1 piece, try to move pos u1 to u8
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(1), types.uint(8)], player1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(103); // err-invalid-move
  },
});

Clarinet.test({
  name: "move: fails with err-invalid-move when moving from an empty position",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    // pos u30 is empty, cannot move from there
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(30), types.uint(37)], player1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(103); // err-invalid-move
  },
});

Clarinet.test({
  name: "move: player1 cannot move player2 pieces",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    // pos u40 has a p2 piece, player1 should not be able to move it
    const block = chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], player1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102); // err-not-your-turn (owns-piece fails)
  },
});

Clarinet.test({
  name: "move: capture removes the jumped-over piece from the board",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    // Setup: move pieces into capture position
    // p1 at 17 -> 26, p2 at 40 -> 33, p1 at 26 captures 33 -> 40 (diff=14)
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(26)], player1.address),
    ]);
    chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], player2.address),
    ]);
    // p1 captures: from 26 to 40, mid = (26+40)/2 = 33
    chain.mineBlock([
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(26), types.uint(40)], player1.address),
    ]);
    const midPiece = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(33)], player1.address);
    midPiece.result.expectUint(0); // captured piece should be gone
  },
});

Clarinet.test({
  name: "move: player1 piece promotes to king when reaching row 8 (pos >= 56)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    // Manually simulate: place p1 piece near promotion row by a series of moves
    // p1: 17->26, p2: 49->42, p1: 26->35, p2: 42->35? no - use 42->33
    // Simpler: p1: 23->30, p2: 40->33, p1: 30->37, p2: 33->26, p1: 37->44, p2: 26->19, p1: 44->51, p2: 19->12, p1: 51->58
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(23), types.uint(30)], player1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], player2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(30), types.uint(37)], player1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(33), types.uint(26)], player2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(37), types.uint(44)], player1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(26), types.uint(19)], player2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(44), types.uint(51)], player1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(19), types.uint(12)], player2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(51), types.uint(58)], player1.address)]);
    const piece = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(58)], player1.address);
    piece.result.expectUint(2); // promoted to king (u2)
  },
});

Clarinet.test({
  name: "move: player2 piece promotes to king when reaching row 1 (pos <= 7)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    // Walk p2 piece from 40 down to pos 5 (row 1)
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], player1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], player2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(24), types.uint(31)], player1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(33), types.uint(26)], player2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(31), types.uint(38)], player1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(26), types.uint(19)], player2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(38), types.uint(45)], player1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(19), types.uint(12)], player2.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(45), types.uint(52)], player1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(12), types.uint(5)], player2.address)]);
    const piece = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(5)], player2.address);
    piece.result.expectUint(4); // promoted to king (u4)
  },
});

Clarinet.test({
  name: "move: alternating turns work correctly across multiple moves",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], player1.address)]);
    chain.mineBlock([Tx.contractCall("checkers", "move", [types.uint(0), types.uint(40), types.uint(33)], player2.address)]);
    // Now it should be player1's turn again
    const game = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    const gameData = game.result.expectSome().expectTuple();
    assertEquals(gameData["current-turn"], player1.address);
  },
});

// ============================================================
// get-game tests
// ============================================================

Clarinet.test({
  name: "get-game: returns none for a game id that does not exist",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const result = chain.callReadOnlyFn("checkers", "get-game", [types.uint(999)], player1.address);
    result.result.expectNone();
  },
});

Clarinet.test({
  name: "get-game: returns some with correct data for an existing game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    const result = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    result.result.expectSome().expectTuple();
  },
});

Clarinet.test({
  name: "get-game: reflects updated state after player2 joins",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    const result = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    const gameData = result.result.expectSome().expectTuple();
    assertEquals(gameData["is-active"], types.bool(true));
    assertEquals(gameData["player2"].expectSome(), player2.address);
  },
});

Clarinet.test({
  name: "get-game: reflects updated current-turn after a move",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
      Tx.contractCall("checkers", "move", [types.uint(0), types.uint(17), types.uint(24)], player1.address),
    ]);
    const result = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    const gameData = result.result.expectSome().expectTuple();
    assertEquals(gameData["current-turn"], player2.address);
  },
});

Clarinet.test({
  name: "get-game: multiple games are stored independently by game-id",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    const player3 = accounts.get("wallet_3")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
      Tx.contractCall("checkers", "create-game", [], player3.address),
      Tx.contractCall("checkers", "join-game", [types.uint(0)], player2.address),
    ]);
    const game0 = chain.callReadOnlyFn("checkers", "get-game", [types.uint(0)], player1.address);
    const game1 = chain.callReadOnlyFn("checkers", "get-game", [types.uint(1)], player1.address);
    const data0 = game0.result.expectSome().expectTuple();
    const data1 = game1.result.expectSome().expectTuple();
    assertEquals(data0["is-active"], types.bool(true));
    assertEquals(data1["is-active"], types.bool(false));
    assertEquals(data0["player1"], player1.address);
    assertEquals(data1["player1"], player3.address);
  },
});

// ============================================================
// get-piece tests
// ============================================================

Clarinet.test({
  name: "get-piece: returns u0 for an empty position on a new game",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    const result = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(30)], player1.address);
    result.result.expectUint(0);
  },
});

Clarinet.test({
  name: "get-piece: returns u1 for player1 piece at starting position",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    const result = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(3)], player1.address);
    result.result.expectUint(1);
  },
});

Clarinet.test({
  name: "get-piece: returns u3 for player2 piece at starting position",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    chain.mineBlock([
      Tx.contractCall("checkers", "create-game", [], player1.address),
    ]);
    const result = chain.callReadOnlyFn("checkers", "get-piece", [types.uint(0), types.uint(49)], player1.address);
    result.result.expectUint(3);
  },
});
