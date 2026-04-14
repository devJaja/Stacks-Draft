#!/bin/bash

cd /home/jaja/Desktop/my-project/stack-draft

echo "=== Checkers Game - Full Interaction ==="
echo ""

# Interaction 1: Player 1 creates game
echo "1. Player 1 creates game"
echo '(contract-call? .checkers create-game)' | clarinet console 2>&1 | grep -E "^\(ok" | head -1

# Interaction 2: Player 2 joins game
echo "2. Player 2 joins game"
echo '::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
(contract-call? .checkers join-game u0)' | clarinet console 2>&1 | grep -E "^\(ok|^\(err" | head -1

# Interaction 3: Get game state
echo "3. Get game state"
echo '(contract-call? .checkers get-game u0)' | clarinet console 2>&1 | grep -E "^\(some" | head -1

# Interaction 4: Get initial board
echo "4. Get initial board"
echo '(contract-call? .checkers get-board u0)' | clarinet console 2>&1 | grep "p1:" | head -1

# Interaction 5: Player 1 move (21 -> 28)
echo "5. Player 1 moves piece 21→28"
echo '(contract-call? .checkers move u0 u21 u28)' | clarinet console 2>&1 | grep -E "^\(ok|^\(err" | head -1

# Interaction 6: Check piece moved
echo "6. Check piece at position 28"
echo '(contract-call? .checkers get-piece u0 u28)' | clarinet console 2>&1 | grep -E "^u" | head -1

# Interaction 7: Player 2 move (42 -> 35)
echo "7. Player 2 moves piece 42→35"
echo '::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
(contract-call? .checkers move u0 u42 u35)' | clarinet console 2>&1 | grep -E "^\(ok|^\(err" | head -1

# Interaction 8: Player 1 move (23 -> 30)
echo "8. Player 1 moves piece 23→30"
echo '(contract-call? .checkers move u0 u23 u30)' | clarinet console 2>&1 | grep -E "^\(ok|^\(err" | head -1

# Interaction 9: Player 2 move (40 -> 33)
echo "9. Player 2 moves piece 40→33"
echo '::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
(contract-call? .checkers move u0 u40 u33)' | clarinet console 2>&1 | grep -E "^\(ok|^\(err" | head -1

# Interaction 10: Get updated game state
echo "10. Get game state after moves"
echo '(contract-call? .checkers get-game u0)' | clarinet console 2>&1 | grep -E "^\(some" | head -1

# Interaction 11: Get updated board
echo "11. Get updated board"
echo '(contract-call? .checkers get-board u0)' | clarinet console 2>&1 | grep "p28:" | head -1

# Interaction 12: Check specific positions
echo "12. Check piece at position 35"
echo '(contract-call? .checkers get-piece u0 u35)' | clarinet console 2>&1 | grep -E "^u" | head -1

echo ""
echo "✅ Completed 12 interactions with 2 players!"
