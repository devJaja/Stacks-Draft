#!/bin/bash

API="https://api.testnet.hiro.so"
CONTRACT_ADDR="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
CONTRACT_NAME="checkers"
SENDER="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"

echo "=== Checkers Contract Interactions ==="

# Read-only calls
for i in {1..10}; do
  echo ""
  echo "$i. Getting game 0 state..."
  curl -s "$API/v2/contracts/call-read/$CONTRACT_ADDR/$CONTRACT_NAME/get-game" \
    -H "Content-Type: application/json" \
    -d "{\"sender\":\"$SENDER\",\"arguments\":[\"0x0100000000000000000000000000000000\"]}" | jq -r '.result // .error'
  sleep 1
done

echo ""
echo "11. Getting board state..."
curl -s "$API/v2/contracts/call-read/$CONTRACT_ADDR/$CONTRACT_NAME/get-board" \
  -H "Content-Type: application/json" \
  -d "{\"sender\":\"$SENDER\",\"arguments\":[\"0x0100000000000000000000000000000000\"]}" | jq -r '.result // .error'

echo ""
echo "12. Getting piece at position 1..."
curl -s "$API/v2/contracts/call-read/$CONTRACT_ADDR/$CONTRACT_NAME/get-piece" \
  -H "Content-Type: application/json" \
  -d "{\"sender\":\"$SENDER\",\"arguments\":[\"0x0100000000000000000000000000000000\",\"0x0100000000000000000000000000000001\"]}" | jq -r '.result // .error'

echo ""
echo "=== Completed 12 interactions ==="
