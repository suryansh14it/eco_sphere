# EcoToken Integration Documentation

This document describes the integration between the EcoSphere XP system and the EcoToken smart contract, enabling automatic minting of EcoTokens when users earn XP.

## Overview

The integration provides a seamless connection between user experience points (XP) and blockchain-based EcoTokens, maintaining a 1:1 ratio where **1 XP = 1 EcoToken**.

### Key Features

- ✅ **Automatic Token Minting**: EcoTokens are automatically minted when users earn XP
- ✅ **1:1 Ratio**: One XP point equals one EcoToken
- ✅ **Graceful Error Handling**: XP awards continue even if token minting fails
- ✅ **Optional Integration**: Users can participate without a wallet address
- ✅ **Modular Design**: Clean separation between XP and token systems
- ✅ **Environment Configuration**: Easy to enable/disable via environment variables

## Architecture

### Components

1. **EcoToken Smart Contract** (`eco-token/contracts/GreenCredits.sol`)
   - ERC20 token contract with minting functionality
   - Only contract owner can mint tokens
   - Deployed on local Hardhat network

2. **EcoToken Backend Service** (`eco-token/backend/server.ts`)
   - Express.js server that interfaces with the smart contract
   - Provides REST API for token minting and balance checking
   - Handles blockchain transactions securely

3. **EcoToken Service** (`lib/ecotoken-service.ts`)
   - Handles communication with EcoToken backend
   - Provides error handling and validation
   - Manages configuration and connection testing

4. **User Model Enhancement** (`models/User.ts`)
   - Added `walletAddress` field for storing user's Ethereum address
   - Enhanced `addXP` method to trigger token minting
   - Maintains backward compatibility

5. **Wallet Management API** (`app/api/user/wallet/route.ts`)
   - GET: Retrieve user's current wallet address
   - POST: Set or update wallet address
   - DELETE: Remove wallet address

6. **Wallet Management Component** (`components/wallet-management.tsx`)
   - React component for users to manage their wallet addresses
   - Includes validation and user-friendly interface

## Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```bash
# EcoToken Integration Configuration
ECOTOKEN_ENABLED=true
ECOTOKEN_BACKEND_URL=http://localhost:3001
```

### EcoToken Backend

The backend service configuration is in `eco-token/.env`:

```bash
PORT=3001
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Usage

### For Users

1. **Set Wallet Address**: Users can set their Ethereum wallet address through the wallet management interface
2. **Earn XP**: Continue earning XP through normal activities (quizzes, projects, etc.)
3. **Receive Tokens**: EcoTokens are automatically minted and sent to their wallet

### For Developers

#### Awarding XP (Automatic Token Minting)

```typescript
// XP is awarded as usual - token minting happens automatically
await user.addXP(50, {
  eventType: 'project_joined',
  description: 'Completed environmental project',
  environmentalImpact: {
    co2Offset: 2.5,
    treesPlanted: 1,
    waterSaved: 10
  }
});
```

#### Managing Wallet Addresses

```typescript
// Set wallet address
const response = await fetch('/api/user/wallet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4' 
  })
});

// Get current wallet address
const response = await fetch('/api/user/wallet');
const data = await response.json();
console.log(data.walletAddress);

// Remove wallet address
await fetch('/api/user/wallet', { method: 'DELETE' });
```

#### Using the EcoToken Service Directly

```typescript
import { ecoTokenService } from '@/lib/ecotoken-service';

// Check if integration is enabled
if (ecoTokenService.isEnabled()) {
  // Mint tokens manually
  const result = await ecoTokenService.mintTokensForXP(
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
    50
  );
  
  if (result.success) {
    console.log('Tokens minted:', result.txHash);
  } else {
    console.error('Minting failed:', result.error);
  }
}
```

## Error Handling

The integration is designed to be resilient:

### XP System Protection
- XP awards are saved **before** attempting token minting
- Token minting failures do not prevent XP from being recorded
- Users continue to progress even if the blockchain service is unavailable

### Graceful Degradation
- If `ECOTOKEN_ENABLED=false`, the system works normally without token minting
- Missing wallet addresses are handled gracefully
- Network errors are logged but don't disrupt user experience

### Error Scenarios Handled
- Invalid wallet address formats
- EcoToken backend service unavailable
- Network timeouts (30-second timeout for minting)
- Blockchain transaction failures
- Invalid token amounts

## Testing

### Running the Integration Test

```bash
node test-blockchain-integration.js
```

This test verifies:
- Hardhat node connectivity
- Wallet connection and balance
- EcoToken backend availability
- Complete integration functionality

### Manual Testing Steps

1. **Start Services**:
   ```bash
   # Start EcoToken infrastructure
   cd eco-token
   npx hardhat node
   npx hardhat run scripts/deploy.ts --network localhost
   npm run start:backend
   
   # Start main application
   cd ..
   npm run dev
   ```

2. **Test User Flow**:
   - Create a user account
   - Set a wallet address via the wallet management component
   - Earn XP through various activities
   - Check EcoToken backend logs for minting attempts
   - Verify tokens in the user's wallet

## Database Schema Changes

### User Model Updates

```typescript
interface IUser {
  // ... existing fields
  walletAddress?: string; // New field for Ethereum wallet address
}
```

The `walletAddress` field:
- Is optional (users can participate without a wallet)
- Validates Ethereum address format (0x + 40 hex characters)
- Can be updated or removed at any time

## API Endpoints

### Wallet Management

- `GET /api/user/wallet` - Get current wallet address
- `POST /api/user/wallet` - Set/update wallet address
- `DELETE /api/user/wallet` - Remove wallet address

### EcoToken Backend

- `GET /test` - Health check endpoint
- `POST /earn-credits` - Mint tokens for a user
- `GET /balance/:address` - Get token balance for an address

## Security Considerations

- Wallet addresses are validated before storage
- Token minting requests include timeout protection
- No private keys are stored or transmitted in the main application
- Users control their own wallet addresses
- Integration can be disabled via environment variables
- Backend service uses secure private key management

## Troubleshooting

### Common Issues

1. **Tokens not minting**: Check that `ECOTOKEN_ENABLED=true` and backend is running
2. **Invalid wallet address**: Ensure address is 42 characters starting with 0x
3. **Backend connection failed**: Verify `ECOTOKEN_BACKEND_URL` is correct
4. **XP not recording**: This should never happen - XP is saved before token minting

### Logs to Check

- Server console for EcoToken minting attempts
- EcoToken backend logs for transaction details
- Browser console for wallet management errors
- Hardhat node logs for blockchain activity

## Future Enhancements

Potential improvements to consider:

- **Retry Mechanism**: Automatic retry for failed token minting
- **Transaction History**: Track successful token mints in user records
- **Batch Minting**: Combine multiple small XP awards into larger token mints
- **Multi-Chain Support**: Support for different blockchain networks
- **Token Balance Display**: Show user's current EcoToken balance in the UI
- **Token Transfer**: Allow users to transfer tokens to other users
