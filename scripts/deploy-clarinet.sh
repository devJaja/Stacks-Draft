#!/bin/bash

echo "🚀 Deploying to Stacks Mainnet via Clarinet"
echo "============================================"
echo ""

# Check if Mainnet.toml exists
if [ ! -f "settings/Mainnet.toml" ]; then
    echo "❌ settings/Mainnet.toml not found"
    exit 1
fi

# Check if mnemonic is set
if grep -q "<YOUR_MAINNET_MNEMONIC_HERE>" settings/Mainnet.toml; then
    echo "⚠️  Please update settings/Mainnet.toml with your mnemonic"
    echo ""
    echo "Edit the file and replace <YOUR_MAINNET_MNEMONIC_HERE>"
    echo "with your 24-word recovery phrase"
    echo ""
    exit 1
fi

echo "📋 Deployment Details:"
echo "   Network: Mainnet"
echo "   Contract: checkers"
echo "   File: contracts/checkers.clar"
echo ""

echo "🔍 Checking contract compilation..."
clarinet check > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Contract has compilation errors"
    echo ""
    echo "Run 'clarinet check' to see details"
    exit 1
fi

echo "✅ Contract compiles successfully"
echo ""

read -p "Deploy to mainnet? This will cost ~0.1 STX (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "📤 Deploying..."
echo ""

clarinet deployments apply --manifest-path deployments/mainnet.yaml

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment initiated!"
    echo ""
    echo "Next steps:"
    echo "1. Wait 10-15 minutes for confirmation"
    echo "2. Check transaction on https://explorer.stacks.co"
    echo "3. Update frontend with contract address"
else
    echo ""
    echo "❌ Deployment failed"
fi
