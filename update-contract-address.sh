#!/bin/bash

echo "Enter your deployed contract address (e.g., SP1234...XYZ):"
read CONTRACT_ADDRESS

# Update useCheckers.ts
sed -i "s/const CONTRACT_ADDRESS = '.*';/const CONTRACT_ADDRESS = '$CONTRACT_ADDRESS';/" frontend/hooks/useCheckers.ts

# Update to mainnet
sed -i 's/StacksTestnet/StacksMainnet/g' frontend/hooks/useStacks.ts
sed -i "s/@stacks\/network';/@stacks\/network';\nimport { StacksMainnet } from '@stacks\/network';/" frontend/hooks/useStacks.ts

echo "✅ Updated contract address to: $CONTRACT_ADDRESS"
echo "✅ Switched to mainnet"
