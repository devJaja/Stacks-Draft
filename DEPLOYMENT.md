# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Stacks wallet (Hiro or Xverse)
- STX tokens for testnet deployment

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Deploy Smart Contract

#### Option A: Using Clarinet (Recommended)

```bash
# Install Clarinet
curl -L https://github.com/hirosystems/clarinet/releases/download/v2.0.0/clarinet-linux-x64.tar.gz | tar xz

# Verify contract
clarinet check

# Test locally
clarinet console

# Deploy to testnet
clarinet deploy --testnet
```

#### Option B: Using Stacks Explorer

1. Go to https://explorer.stacks.co/sandbox/deploy
2. Connect your wallet
3. Copy contents of `contracts/checkers.clar`
4. Deploy contract
5. Note the contract address

### 3. Configure Frontend

Edit `frontend/hooks/useCheckers.ts`:

```typescript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
const CONTRACT_NAME = 'checkers';
```

### 4. Run Development Server

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

## Testing the Game

### Local Testing with Clarinet

```bash
clarinet console
```

In the console:
```clarity
;; Create a game
(contract-call? .checkers create-game)

;; Join game (as different user)
(as-contract (contract-call? .checkers join-game u0))

;; Make a move
(contract-call? .checkers move u0 u21 u28)
```

### Testnet Testing

1. Get testnet STX from faucet: https://explorer.stacks.co/sandbox/faucet
2. Deploy contract using Clarinet or Explorer
3. Update frontend config with contract address
4. Connect wallet and play!

## Production Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel deploy
```

### Contract (Mainnet)

```bash
clarinet deploy --mainnet
```

⚠️ **Warning**: Deploying to mainnet costs real STX. Test thoroughly on testnet first!

## Troubleshooting

### Contract not found
- Verify contract address in `useCheckers.ts`
- Ensure contract is deployed to correct network

### Wallet connection issues
- Clear browser cache
- Try different wallet (Hiro vs Xverse)
- Check network settings (testnet vs mainnet)

### Moves not working
- Ensure game is active (both players joined)
- Check it's your turn
- Verify piece ownership
- Only dark squares are playable

## Environment Variables

Create `.env.local` in frontend directory:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
NEXT_PUBLIC_NETWORK=testnet
```

Then update `useCheckers.ts` to use env vars:

```typescript
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
```
