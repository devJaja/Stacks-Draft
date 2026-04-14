#!/bin/bash

echo "🚀 Preparing for Mainnet Deployment"
echo "===================================="
echo ""

# Check if contract file exists
if [ ! -f "contracts/checkers.clar" ]; then
    echo "❌ Error: contracts/checkers.clar not found"
    exit 1
fi

echo "✅ Contract file found"
echo ""

# Display contract info
echo "📄 Contract Details:"
echo "   Name: checkers"
echo "   File: contracts/checkers.clar"
echo "   Size: $(wc -c < contracts/checkers.clar) bytes"
echo ""

# Check contract syntax (if clarinet is installed)
if command -v clarinet &> /dev/null; then
    echo "🔍 Checking contract syntax..."
    clarinet check
    if [ $? -eq 0 ]; then
        echo "✅ Contract syntax is valid"
    else
        echo "❌ Contract has syntax errors"
        exit 1
    fi
else
    echo "⚠️  Clarinet not installed - skipping syntax check"
fi

echo ""
echo "📋 Deployment Checklist:"
echo "   [ ] Have at least 0.1 STX in mainnet wallet"
echo "   [ ] Wallet is connected to MAINNET (not testnet)"
echo "   [ ] Contract has been tested on testnet"
echo "   [ ] Ready to deploy via Hiro Platform or Explorer"
echo ""

echo "🌐 Deployment Options:"
echo ""
echo "1. Hiro Platform (Recommended):"
echo "   https://platform.hiro.so/"
echo ""
echo "2. Stacks Explorer:"
echo "   https://explorer.stacks.co/"
echo ""
echo "3. CLI (Advanced):"
echo "   stx deploy_contract contracts/checkers.clar checkers 0.1 0 --network mainnet"
echo ""

echo "📖 Full guide: See MAINNET_DEPLOYMENT.md"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Double-check you're on MAINNET"
echo "   - Save your contract address after deployment"
echo "   - Update frontend/hooks/useCheckers.ts with new address"
echo "   - Update frontend/hooks/useStacks.ts to use StacksMainnet"
echo ""
