#!/bin/bash
# Verifies the deployed checkers contract on Stacks mainnet

CONTRACT="SP2DWWDVSSKZ5X37BBV3RV0GY0A0FFZZESYHEVQZ9.checkers"
API="https://api.mainnet.hiro.so"

echo "🔍 Verifying contract: $CONTRACT"
echo ""

RESPONSE=$(curl -s "$API/v2/contracts/interface/$CONTRACT")

if echo "$RESPONSE" | grep -q '"functions"'; then
  echo "✅ Contract is live on mainnet"
  echo ""
  echo "Explorer: https://explorer.hiro.so/txid/$CONTRACT?chain=mainnet"
else
  echo "❌ Contract not found or API error"
  echo "$RESPONSE"
  exit 1
fi
