#!/bin/bash

echo "🚀 Stacks Mainnet Deployment"
echo "============================"
echo ""
echo "⚠️  You need:"
echo "   - Your private key"
echo "   - At least 0.1 STX in your wallet"
echo ""

read -sp "Enter your private key: " PRIVATE_KEY
echo ""

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Private key required"
    exit 1
fi

echo ""
echo "📤 Deploying contract..."
echo ""

stx deploy_contract \
  contracts/checkers.clar \
  checkers \
  100000 \
  0 \
  --network mainnet \
  --privateKey "$PRIVATE_KEY"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Next steps:"
    echo "1. Wait 10-15 minutes for confirmation"
    echo "2. Check transaction on explorer"
    echo "3. Run: ./update-contract-address.sh"
else
    echo ""
    echo "❌ Deployment failed"
    echo "Check your private key and STX balance"
fi
