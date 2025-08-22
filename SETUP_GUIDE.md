# EcoToken Integration Setup Guide

## 🎯 What We've Built

Your EcoSphere application now has **automatic EcoToken minting** integrated with the XP system! Here's what happens:

1. **User earns XP** → System automatically mints equivalent EcoTokens
2. **1:1 ratio maintained** → 50 XP = 50 EcoTokens
3. **Graceful error handling** → XP is always recorded, even if token minting fails
4. **Optional wallet** → Users can participate without a wallet address

## 🏗️ Architecture Overview

```
User Action → XP Award → EcoToken Minting → User's Wallet
     ↓            ↓            ↓              ↓
  Quiz/Project → addXP() → EcoTokenService → Blockchain
```

## 📁 Files Created/Modified

### ✅ **New Files Created:**
- `eco-token/` - Complete blockchain infrastructure directory
- `eco-token/contracts/GreenCredits.sol` - ERC20 smart contract
- `eco-token/backend/server.ts` - EcoToken backend service
- `eco-token/scripts/deploy.ts` - Contract deployment script
- `lib/ecotoken-service.ts` - Service for handling token minting
- `app/api/user/wallet/route.ts` - API for wallet management
- `components/wallet-management.tsx` - UI for wallet management
- `.env.local` - Environment configuration
- `test-blockchain-integration.js` - Integration test script

### ✅ **Files Modified:**
- `models/User.ts` - Added wallet field + automatic token minting
- `package.json` - Added ethers dependency

## 🚀 Quick Start

### 1. **Start the EcoToken Backend**

```bash
# Navigate to EcoToken directory
cd eco-token

# Install dependencies (if not done)
npm install

# Start Hardhat blockchain node (in one terminal)
npx hardhat node

# In a new terminal, deploy the contract
npx hardhat run scripts/deploy.ts --network localhost

# Start the EcoToken backend
npm run start:backend
```

### 2. **Start Your Main Application**

```bash
# In the main eco_sphere directory
npm run dev
```

### 3. **Test the Integration**

```bash
# Test the blockchain integration
node test-blockchain-integration.js
```

## 🔧 Configuration

### Environment Variables (`.env.local`)

```bash
# EcoToken Integration
ECOTOKEN_ENABLED=true
ECOTOKEN_BACKEND_URL=http://localhost:3001

# Your existing variables...
MONGODB_URI=mongodb://localhost:27017/eco_sphere
```

### EcoToken Backend Configuration (`eco-token/.env`)

```bash
PORT=3001
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 🧪 How to Test

### **Method 1: Using the Application**

1. **Create a user account** in your EcoSphere app
2. **Set wallet address** using the wallet management component
3. **Earn XP** through any activity (quiz, project, etc.)
4. **Check logs** for EcoToken minting messages
5. **Verify tokens** in the user's wallet

### **Method 2: API Testing**

```bash
# Set wallet address
curl -X POST http://localhost:3000/api/user/wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"}'

# Award XP (this will trigger token minting)
curl -X POST http://localhost:3000/api/user/xp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "amount": 50,
    "eventType": "educational_content",
    "description": "Completed environmental quiz"
  }'
```

## 🔍 Troubleshooting

### **Common Issues:**

1. **"EcoToken backend connection failed"**
   - Ensure Hardhat node is running: `npx hardhat node`
   - Ensure backend is running: `npm run start:backend`
   - Check if contract is deployed

2. **"Invalid wallet address"**
   - Wallet must be 42 characters starting with 0x
   - Use a valid Ethereum address format

3. **"XP recorded but no tokens minted"**
   - Check if `ECOTOKEN_ENABLED=true` in `.env.local`
   - Verify user has a wallet address set
   - Check server logs for error messages

4. **"Contract deployment failed"**
   - Make sure Hardhat node is running first
   - Check that the contract compiles: `npx hardhat compile`

## 🎉 Success Indicators

When everything is working correctly, you should see:

- ✅ Hardhat node running on http://127.0.0.1:8545
- ✅ EcoToken backend running on http://localhost:3001
- ✅ Contract deployed successfully
- ✅ Test script passes all checks
- ✅ XP awards trigger token minting in logs
- ✅ Users can set/update wallet addresses

## 🔄 Development Workflow

1. **Start services**: Hardhat node → Deploy contract → Start backend → Start main app
2. **Test integration**: Run test script to verify all components
3. **Develop features**: Use wallet management component in your UI
4. **Monitor logs**: Check console for token minting success/failure messages

The integration is now complete and ready for use!
