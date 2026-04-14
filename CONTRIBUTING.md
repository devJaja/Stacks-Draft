# Contributing

## Development Setup

```bash
cd frontend
npm install
npm run dev
```

## Contract Development

Requires [Clarinet](https://github.com/hirosystems/clarinet).

```bash
clarinet check       # validate contract
clarinet test        # run tests
```

## Project Structure

```
stack-draft/
├── contracts/       # Clarity smart contracts
├── deployments/     # Clarinet deployment manifests
├── frontend/        # Next.js app
├── scripts/         # Deployment helper scripts
├── settings/        # Clarinet network configs
└── tests/           # Clarinet contract tests
```

## Branching

- `main` — production-ready code
- `feat/*` — feature branches

## Contract

Deployed on Stacks mainnet: `SP2DWWDVSSKZ5X37BBV3RV0GY0A0FFZZESYHEVQZ9.checkers`
