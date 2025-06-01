# 🎮 Prompt Genius

A decentralized prompt guessing game built on Ethereum where players can compete to guess prompts and earn rewards. This project is built using Scaffold-ETH 2 as a foundation.

## 🎯 Project Overview

Prompt Guesser is an interactive blockchain game where players:
- Participate in prompt guessing challenges
- Earn rewards for successful guesses
- Compete with other players in a decentralized environment

## 🛠 Tech Stack

Built using modern web3 technologies:
- Frontend: NextJS, RainbowKit, TypeScript
- Smart Contracts: Solidity, Hardhat
- Blockchain Interaction: Wagmi, Viem
- Network: Flow Testnet

## 🌐 Live Demo

Try the deployed application at: **https://prompt-guesser-nextjs.vercel.app/**

Experience Prompt Genius live on the blockchain! Connect your wallet and start playing immediately.

## 🚀 Getting Started

1. Install dependencies:
```bash
yarn install
```

2. Start the local development chain:
```bash
yarn chain
```

3. Deploy the smart contracts:
```bash
yarn deploy
```

4. **Set up API keys for full functionality:**

Create `packages/nextjs/.env.local` with your API keys:
```bash
# OpenAI API (Required for AI image generation)
OPENAI_API_KEY=your_openai_api_key_here

# Pinata IPFS (Required for permanent image storage)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

**Note:** Without these API keys, the application will run but image generation and IPFS storage features won't work.

5. Start the frontend:
```bash
yarn start
```

Visit http://localhost:3000 to start playing!

## 📝 Project Structure

- `packages/hardhat/`: Smart contracts and deployment scripts
- `packages/nextjs/`: Frontend application
- `packages/hardhat/contracts/`: Game logic and smart contracts
- `packages/nextjs/app/`: Frontend pages and components

## 🧪 Testing

Run the test suite:
```bash
yarn hardhat:test
```

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the terms of the [LICENSE](LICENSE) file.

---
Built with ❤️ using [Scaffold-ETH 2](https://scaffoldeth.io)