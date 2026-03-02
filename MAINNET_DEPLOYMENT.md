# Mainnet Deployment Guide

## Prerequisites
- Stacks wallet with at least 0.1 STX on mainnet
- Hiro Wallet or Xverse browser extension installed

## Method 1: Deploy via Hiro Platform (Easiest)

1. **Visit Hiro Platform**
   ```
   https://platform.hiro.so/
   ```

2. **Connect Wallet**
   - Click "Connect Wallet"
   - Select your wallet (Hiro/Xverse)
   - Approve connection

3. **Switch to Mainnet**
   - Ensure you're on Mainnet (not Testnet)
   - Check network indicator in top right

4. **Deploy Contract**
   - Click "Deploy Contract"
   - Upload: `contracts/checkers.clar`
   - Contract Name: `checkers`
   - Review fee (≥0.1 STX)
   - Click "Deploy"
   - Confirm in wallet

5. **Save Contract Address**
   - Copy your deployed contract address
   - Format: `SP[YOUR_ADDRESS].checkers`

## Method 2: Deploy via Stacks Explorer

1. **Visit Explorer**
   ```
   https://explorer.stacks.co/
   ```

2. **Navigate to Sandbox**
   - Click "Sandbox" in menu
   - Select "Deploy Contract"

3. **Paste Contract Code**
   - Copy entire `checkers.clar` content
   - Paste into editor
   - Set contract name: `checkers`

4. **Deploy**
   - Click "Deploy"
   - Connect wallet when prompted
   - Confirm transaction (≥0.1 STX fee)

## Method 3: Deploy via CLI (Advanced)

### Install Stacks CLI
```bash
npm install -g @stacks/cli
```

### Deploy Command
```bash
stx deploy_contract \
  contracts/checkers.clar \
  checkers \
  0.1 \
  0 \
  --network mainnet \
  --privateKey YOUR_PRIVATE_KEY
```

⚠️ **WARNING**: Never share your private key!

## After Deployment

### Update Frontend Configuration

Edit `frontend/hooks/useCheckers.ts`:

```typescript
// Change from testnet address
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

// To your mainnet address
const CONTRACT_ADDRESS = 'SP[YOUR_ADDRESS]'; // Your mainnet address
```

### Update Network Configuration

Edit `frontend/hooks/useStacks.ts`:

```typescript
// Change from
import { StacksTestnet } from '@stacks/network';
const [network] = useState(new StacksTestnet());

// To
import { StacksMainnet } from '@stacks/network';
const [network] = useState(new StacksMainnet());
```

## Verify Deployment

1. Visit Stacks Explorer:
   ```
   https://explorer.stacks.co/txid/[YOUR_TX_ID]?chain=mainnet
   ```

2. Check contract is deployed:
   ```
   https://explorer.stacks.co/address/[YOUR_ADDRESS]?chain=mainnet
   ```

## Estimated Costs

- Contract deployment: ~0.1-0.5 STX
- Transaction fees: ~0.001 STX per game action
- Total recommended: 1 STX for deployment + testing

## Troubleshooting

**Insufficient Funds**
- Ensure you have >0.1 STX in mainnet wallet
- Check wallet is on mainnet, not testnet

**Transaction Pending**
- Wait 10-15 minutes for confirmation
- Check status on explorer

**Contract Name Taken**
- Use unique name: `checkers-v1`, `checkers-game`, etc.

## Security Notes

- ✅ Test on testnet first
- ✅ Verify contract code before deployment
- ✅ Never share private keys
- ✅ Use hardware wallet for large amounts
- ✅ Double-check network (mainnet vs testnet)
