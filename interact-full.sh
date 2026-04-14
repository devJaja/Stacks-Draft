#!/bin/bash

cd /home/jaja/Desktop/my-project/stack-draft

echo "=== Full Checkers Contract Interaction Demo ==="
echo ""

run_cmd() {
  local num=$1
  local desc=$2
  local cmd=$3
  echo "$num. $desc"
  echo "$cmd" | clarinet console 2>&1 | grep -E "^\(ok|^\(err|^\(some|^\(none|^u[0-9]|^{" | head -1
  echo ""
}

# Interaction 1: Create game
run_cmd 1 "Create game" "(contract-call? .checkers create-game)"

# Interaction 2: Join game (as player 2)
run_cmd 2 "Join game" "(as-contract (contract-call? .checkers join-game u0))"

# Interaction 3: Get game state
run_cmd 3 "Get game state" "(contract-call? .checkers get-game u0)"

# Interaction 4: Get full board
run_cmd 4 "Get board" "(contract-call? .checkers get-board u0)"

# Interaction 5: Make first move (player 1: pos 21 to 28)
run_cmd 5 "Player 1 moves 21→28" "(contract-call? .checkers move u0 u21 u28)"

# Interaction 6: Get piece at new position
run_cmd 6 "Check piece at 28" "(contract-call? .checkers get-piece u0 u28)"

# Interaction 7: Make second move (player 2: pos 42 to 35)
run_cmd 7 "Player 2 moves 42→35" "(as-contract (contract-call? .checkers move u0 u42 u35))"

# Interaction 8: Get updated game state
run_cmd 8 "Get game state" "(contract-call? .checkers get-game u0)"

# Interaction 9: Check multiple pieces
run_cmd 9 "Check piece at 1" "(contract-call? .checkers get-piece u0 u1)"

# Interaction 10: Check piece at 40
run_cmd 10 "Check piece at 40" "(contract-call? .checkers get-piece u0 u40)"

# Interaction 11: Check piece at 56
run_cmd 11 "Check piece at 56" "(contract-call? .checkers get-piece u0 u56)"

# Interaction 12: Get final board state
run_cmd 12 "Get final board" "(contract-call? .checkers get-board u0)"

echo "✅ Completed 12 contract interactions!"
