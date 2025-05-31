# Flow Blockchain Integration Guide

This guide explains how to deploy and interact with smart contracts on Flow's EVM-compatible network using your scaffold-eth dApp.

## What is Flow EVM?

Flow EVM is Flow's Ethereum Virtual Machine compatibility layer that allows you to:
- Deploy Solidity smart contracts without modifications
- Use familiar Ethereum tools (MetaMask, Hardhat, etc.)
- Benefit from Flow's high performance and low costs
- Access unique Flow features like account abstraction

## Available Networks

Your dApp now supports the following Flow networks:

### Flow Testnet
- **Chain ID**: 545
- **RPC URL**: https://testnet.evm.nodes.onflow.org
- **Currency**: FLOW
- **Block Explorer**: https://flowscan.org (Testnet)

### Flow Mainnet  
- **Chain ID**: 747
- **RPC URL**: https://mainnet.evm.nodes.onflow.org
- **Currency**: FLOW
- **Block Explorer**: https://flowscan.org

## Getting Started

### 1. Add Flow to MetaMask

To interact with Flow networks, add them to MetaMask:

**Flow Testnet:**
- Network Name: Flow EVM Testnet
- New RPC URL: https://testnet.evm.nodes.onflow.org
- Chain ID: 545
- Currency Symbol: FLOW
- Block Explorer URL: https://flowscan.org

**Flow Mainnet:**
- Network Name: Flow EVM Mainnet  
- New RPC URL: https://mainnet.evm.nodes.onflow.org
- Chain ID: 747
- Currency Symbol: FLOW
- Block Explorer URL: https://flowscan.org

### 2. Get FLOW Tokens

**For Testnet:**
- Use the [Flow Faucet](https://testnet-faucet.onflow.org/) to get testnet FLOW tokens
- You'll need these to pay for gas fees

**For Mainnet:**
- Purchase FLOW tokens from exchanges like Coinbase, Binance, or Kraken
- Bridge FLOW tokens to Flow EVM using the official bridge

### 3. Deploy Contracts to Flow

Deploy your smart contracts to Flow using Hardhat:

```bash
# Deploy to Flow Testnet
cd packages/hardhat
yarn deploy --network flowTestnet

# Deploy to Flow Mainnet  
yarn deploy --network flowMainnet
```

### 4. Switch Network in dApp

Once deployed, you can switch to Flow networks in your dApp:
1. Open the network switcher in your dApp
2. Select "Flow EVM Testnet" or "Flow EVM Mainnet"
3. Your wallet will prompt you to switch networks
4. Approve the network switch

## Flow Benefits

### Performance
- **Fast Finality**: ~20 seconds for hard finality
- **Low Cost**: ~$0.000015 average transaction cost
- **High Throughput**: ~1,000 TPS capacity

### Developer Experience
- **EVM Compatibility**: Deploy Solidity contracts without changes
- **Account Abstraction**: Native support for gasless transactions
- **Advanced Features**: Access to Flow's unique blockchain features

### User Experience
- **Mainstream Ready**: Built for consumer applications
- **Low Friction**: Minimal gas fees and fast transactions
- **Progressive Web3**: Easy onboarding for new users

## Technical Details

### Gas and Fees
- Gas fees are paid in FLOW tokens
- Much lower costs compared to Ethereum mainnet
- Developers can sponsor user transactions

### Block Explorers
- **Flowscan**: https://flowscan.org
- View transactions, contracts, and account details
- Support for both testnet and mainnet

### RPC Endpoints
The dApp is configured with these RPC endpoints:
- Testnet: https://testnet.evm.nodes.onflow.org
- Mainnet: https://mainnet.evm.nodes.onflow.org

## Troubleshooting

### Common Issues

**1. Transaction Fails**
- Ensure you have sufficient FLOW tokens for gas
- Check that you're connected to the correct network

**2. Contract Not Found**
- Verify the contract was deployed to the correct network
- Check the deployment logs for the contract address

**3. Network Connection Issues**
- Try refreshing the page
- Check MetaMask connection
- Verify RPC endpoints are accessible

### Getting Help

- **Flow Documentation**: https://developers.flow.com
- **Flow Discord**: https://discord.gg/flow
- **Flow Forum**: https://forum.onflow.org

## Example Commands

```bash
# Check account balance on Flow Testnet
yarn hardhat run scripts/checkBalance.ts --network flowTestnet

# Verify contract on Flow
yarn hardhat verify --network flowTestnet <CONTRACT_ADDRESS>

# Generate new deployer account
yarn generate

# Check deployer balance
yarn account
```

## Next Steps

1. **Test on Testnet**: Deploy and test your contracts on Flow Testnet first
2. **Optimize for Flow**: Take advantage of Flow's unique features
3. **Deploy to Mainnet**: Once tested, deploy to Flow Mainnet
4. **Monitor**: Use Flowscan to monitor your contracts and transactions

Your prompt genius game now has access to Flow's fast, affordable, and user-friendly blockchain infrastructure! 