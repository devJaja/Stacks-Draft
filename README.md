# 🕹️ Checkers on Stacks (Draughts)

A fully decentralized Checkers/Draughts game built on Stacks blockchain. All game logic runs on-chain with Bitcoin security.

## 🚀 Tech Stack

- **Clarity** - Smart contract for game logic
- **Next.js 14** - React framework with App Router
- **Stacks.js** - Blockchain interactions
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 🎮 Game Features

- **Classic 8×8 Board** - Alternating light/dark squares
- **On-Chain Logic** - All moves validated and stored on Stacks
- **Turn-Based** - Two-player multiplayer
- **King Promotion** - Pieces promoted when reaching opposite end
- **Capture Rules** - Jump over opponent pieces
- **Bitcoin Security** - Inherits Bitcoin finality

## 📁 Project Structure

```
stack-draft/
├── contracts/
│   └── checkers.clar            # Game logic contract
└── frontend/
    ├── app/
    │   ├── layout.tsx           # Root layout
    │   ├── page.tsx             # Game board UI
    │   └── globals.css          # Global styles
    └── hooks/
        ├── useStacks.ts         # Wallet connection
        └── useCheckers.ts       # Game interactions
```

## 🛠 Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Deploy Contract

**Option A: Using Clarinet (Recommended)**

Install Clarinet:
```bash
curl -L https://github.com/hirosystems/clarinet/releases/download/v2.0.0/clarinet-linux-x64.tar.gz | tar xz
```

Check contract:
```bash
clarinet check
```

Deploy to testnet:
```bash
clarinet deploy --testnet
```

**Option B: Manual Deployment**

Use the Stacks Explorer or Hiro Platform to deploy `contracts/checkers.clar`

### 3. Contract Address (Mainnet)

The contract is deployed on Stacks mainnet:
```
SP2DWWDVSSKZ5X37BBV3RV0GY0A0FFZZESYHEVQZ9.checkers
```
Explorer: https://explorer.hiro.so/txid/SP2DWWDVSSKZ5X37BBV3RV0GY0A0FFZZESYHEVQZ9.checkers?chain=mainnet

### 4. Run Development Server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

1. **Connect Wallet** - Use Hiro Wallet or Xverse
2. **Create Game** - Click "Create New Game" to start a new match
3. **Share Game ID** - Note the game ID and share with opponent
4. **Join Game** - Second player enters game ID and clicks "Join Game"
5. **Make Moves** - Click your piece (🔴 or ⚫), then click destination square
6. **Capture** - Jump over opponent pieces to capture them
7. **King Me** - Reach the opposite end to promote your piece to a king (👑 or ♛)
8. **Win** - Capture all opponent pieces or block their moves

## 🎯 Game Features

- **Real-time Updates** - Board refreshes every 3 seconds automatically
- **Turn Indicators** - See whose turn it is and your player role
- **Visual Feedback** - Selected pieces highlighted in yellow
- **Piece Symbols**:
  - 🔴 Player 1 regular piece
  - 👑 Player 1 king
  - ⚫ Player 2 regular piece
  - ♛ Player 2 king

## 🔐 Smart Contract Functions

### Public Functions

- `create-game` - Create new game
- `join-game` - Join existing game
- `move` - Make a move (validated on-chain)

### Read-Only Functions

- `get-game` - Get game state
- `get-piece` - Get piece at position

## 📝 Game Rules

- Pieces move diagonally on dark squares only
- Regular pieces move forward only
- Kings (promoted pieces) can move backward
- Capture by jumping over opponent pieces
- Multiple captures in one turn allowed
- Game ends when one player has no valid moves

## 🚧 Next Steps

- [x] Add piece rendering from contract state
- [x] Real-time game state polling
- [ ] Move validation preview
- [ ] Capture animation
- [ ] Game history/replay
- [ ] Leaderboard
- [ ] Tournament mode
- [ ] Sound effects
- [ ] Mobile responsive improvements

## 📄 License

MIT
