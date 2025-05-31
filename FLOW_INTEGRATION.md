# Flow EVM Integration Guide

This guide covers the integration of Flow EVM networks into the Prompt Genius dApp, including setup, deployment, and troubleshooting.

## Overview

Flow EVM is Ethereum Virtual Machine compatibility on Flow blockchain, allowing Ethereum dApps to run on Flow with minimal modifications while benefiting from Flow's high throughput and low fees.

## Supported Networks

### Flow EVM Testnet
- **Chain ID**: 545 (0x221)
- **RPC URL**: https://testnet.evm.nodes.onflow.org
- **Block Explorer**: https://flowscan.org?network=testnet
- **Native Token**: FLOW

### Flow EVM Mainnet  
- **Chain ID**: 747 (0x2EB)
- **RPC URL**: https://mainnet.evm.nodes.onflow.org
- **Block Explorer**: https://flowscan.org
- **Native Token**: FLOW

## Configuration

### 1. Scaffold Configuration
The networks are configured in `packages/nextjs/scaffold.config.ts`:

```typescript
targetNetworks: [
  chains.hardhat,
  chains.flowTestnet,     // Flow EVM Testnet (Chain ID: 545)
  chains.flowMainnet,     // Flow EVM Mainnet (Chain ID: 747)
],

rpcOverrides: {
  [chains.flowTestnet.id]: "https://testnet.evm.nodes.onflow.org",
  [chains.flowMainnet.id]: "https://mainnet.evm.nodes.onflow.org",
},
```

### 2. Hardhat Configuration
Flow networks are configured in `packages/hardhat/hardhat.config.ts`:

```typescript
networks: {
  flowTestnet: {
    url: "https://testnet.evm.nodes.onflow.org",
    accounts: [deployerPrivateKey],
    chainId: 545,
  },
  flowMainnet: {
    url: "https://mainnet.evm.nodes.onflow.org", 
    accounts: [deployerPrivateKey],
    chainId: 747,
  },
}
```

### 3. Network Colors
Flow networks have custom colors in `packages/nextjs/utils/scaffold-eth/networks.ts`:
- **Flow Testnet**: #00ef8b (bright green)
- **Flow Mainnet**: #00d4a3 (darker green)

## Smart Contract Deployment

### Deploy to Flow Testnet
```bash
cd packages/hardhat
npx hardhat deploy --network flowTestnet
```

### Deploy to Flow Mainnet
```bash
cd packages/hardhat
npx hardhat deploy --network flowMainnet
```

### Deployment Scripts
- `packages/hardhat/deploy/00_deploy_your_contract.ts` - Standard deployment
- `packages/hardhat/deploy/01_deploy_flow.ts` - Flow-specific deployment with enhanced logging

## Frontend Integration

### Network Switching
The dApp automatically detects Flow networks and provides UI feedback:
- Network indicator in wallet component
- Flow-specific styling and colors  
- Automatic network addition to MetaMask

### Flow Network Features
1. **Auto-Add to MetaMask**: Users can automatically add Flow networks to MetaMask
2. **Network-Specific Messaging**: Helpful guidance for Flow network usage
3. **Transaction Optimization**: Adjusted polling intervals for Flow's faster block times

## User Experience Improvements

### MetaMask Integration
When users encounter Flow network issues, they can:
1. Click "Add Flow to MetaMask" in the wrong network dropdown
2. Automatically configure the correct RPC endpoints
3. Get guided setup instructions

### Transaction Guidance
- Flow-specific transaction messages
- Balance validation with FLOW tokens
- Clear error messages for common issues

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Wrong Network" when switching to Flow
**Solution**: 
1. Make sure Flow network is added to your wallet
2. Use the "Add Flow to MetaMask" button in the network dropdown
3. Manually add the network with the RPC URLs above

#### Issue: Transactions fail on Flow
**Possible causes**:
1. **Insufficient FLOW tokens**: Make sure you have FLOW for gas fees
2. **Network not added**: Add Flow network to MetaMask first
3. **RPC issues**: Try refreshing the page or switching networks

**Solutions**:
1. Get FLOW tokens from a faucet (testnet) or exchange (mainnet)
2. Use the auto-add MetaMask feature
3. Check your wallet's RPC configuration

#### Issue: Contract not found on Flow
**Solution**: 
1. Verify the contract is deployed to the correct Flow network
2. Check `packages/nextjs/contracts/deployedContracts.ts` for correct addresses
3. Re-deploy if necessary: `npx hardhat deploy --network flowTestnet`

#### Issue: Wallet won't connect to Flow
**Solution**:
1. Ensure you're using a compatible wallet (MetaMask, WalletConnect)
2. Add Flow network manually if auto-add fails
3. Clear browser cache and try again

### Getting FLOW Tokens

#### Flow Testnet
- Use the Flow Faucet: https://testnet-faucet.onflow.org/
- Request testnet FLOW tokens for testing

#### Flow Mainnet  
- Purchase FLOW from exchanges (Coinbase, Binance, etc.)
- Bridge from other networks using Flow Port
- Use Flow's official wallet and bridges

## Benefits of Flow Integration

### For Users
- **Low Fees**: Significantly cheaper transactions than Ethereum
- **Fast Confirmations**: Quick block times and finality
- **Familiar Experience**: Same MetaMask workflow as Ethereum

### For Developers
- **EVM Compatibility**: Existing Solidity contracts work without changes
- **Better UX**: Faster transactions improve user experience
- **Scalability**: Higher throughput than Ethereum mainnet

## Monitoring and Analytics

### Block Explorers
- **Testnet**: https://flowscan.org?network=testnet
- **Mainnet**: https://flowscan.org

### RPC Health
Monitor RPC endpoint health:
- Testnet: https://testnet.evm.nodes.onflow.org
- Mainnet: https://mainnet.evm.nodes.onflow.org

## Future Enhancements

1. **Flow-specific UI themes**: Custom styling for Flow networks
2. **FLOW token integration**: Native FLOW token handling
3. **Flow account linking**: Connect Flow accounts with EVM accounts
4. **Enhanced analytics**: Flow-specific metrics and monitoring

---

For more information about Flow EVM, visit the [official Flow documentation](https://developers.flow.com/evm). 