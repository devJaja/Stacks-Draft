#!/bin/bash

cd /home/jaja/Desktop/my-project/stack-draft

echo "=== Interacting with Checkers Contract ==="
echo ""

# Interaction 1: Create game
echo "1. Creating game..."
echo '(contract-call? .checkers create-game)' | clarinet console 2>&1 | grep -E "^\(ok|^\(err"

# Interaction 2: Get game state
echo "2. Getting game 0..."
echo '(contract-call? .checkers get-game u0)' | clarinet console 2>&1 | grep -E "^\(some|^\(none"

# Interaction 3: Get board
echo "3. Getting board..."
echo '(contract-call? .checkers get-board u0)' | clarinet console 2>&1 | grep -E "^\(ok"

# Interactions 4-13: Get pieces
for pos in 1 3 5 7 21 23 40 42 56 60; do
  echo "$((pos/10 + 4)). Getting piece at position $pos..."
  echo "(contract-call? .checkers get-piece u0 u$pos)" | clarinet console 2>&1 | grep -E "^u[0-9]"
done

echo ""
echo "✅ Completed 13 interactions!"
