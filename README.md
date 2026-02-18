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

Install Clarinet:
```bash
curl -L https://github.com/hirosystems/clarinet/releases/download/v2.0.0/clarinet-linux-x64.tar.gz | tar xz
```

Deploy to testnet or use Clarinet console for local testing.

### 3. Update Contract Address

Edit `frontend/hooks/useCheckers.ts` and update:
```typescript
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

1. **Connect Wallet** - Use Hiro Wallet or Xverse
2. **Create Game** - Start a new checkers match
3. **Join Game** - Second player joins with game ID
4. **Make Moves** - Click piece, then click destination
5. **Win** - Capture all opponent pieces or block their moves

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

- [ ] Add piece rendering from contract state
- [ ] Real-time game state polling
- [ ] Move validation preview
- [ ] Capture animation
- [ ] Game history/replay
- [ ] Leaderboard
- [ ] Tournament mode
- [ ] Sound effects

## 📄 License

MIT
