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
