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
