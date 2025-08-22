import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { GreenCredits__factory } from '../typechain-types';

dotenv.config();

// Parse environment variables
const PORT = parseInt(process.env.PORT || '3001', 10);
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';

if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.error("❌ Missing environment variables. Check PRIVATE_KEY and CONTRACT_ADDRESS in .env");
    process.exit(1);
}

// Initialize Express app
const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Setup blockchain connection
console.log('🔗 Connecting to blockchain...');
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545", {
  name: "hardhat",
  chainId: 1337,
});
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
console.log(`🔑 Wallet loaded: ${wallet.address}`);

console.log(`📄 Connecting to contract at ${CONTRACT_ADDRESS}...`);
const contract = GreenCredits__factory.connect(CONTRACT_ADDRESS, wallet);
console.log('✅ Contract connected!');

// --- API Endpoints ---

// Health check
app.get('/test', (req, res) => {
    res.json({ message: '✅ Server is running!' });
});

// Mint credits (only backend owner can mint)
app.post('/earn-credits', async (req, res) => {
    try {
        const { userAddress, amount } = req.body;

        if (!ethers.isAddress(userAddress)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        console.log(`🪙 Minting ${amount} GC for ${userAddress}`);

        // Convert to 18 decimals
        const parsedAmount = ethers.parseUnits(amount.toString(), 18);

        const tx = await contract.mintTokens(userAddress, parsedAmount);
        await tx.wait();

        console.log(`✅ Tokens minted! Tx: ${tx.hash}`);
        res.json({ success: true, txHash: tx.hash });
    } catch (error: any) {
        console.error('❌ Error minting tokens:', error);
        res.status(500).json({ error: error.message || 'Unknown error occurred' });
    }
});

// Get token balance
app.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;

        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }

        console.log(`🔍 Checking balance for: ${address}`);
        const balance = await contract.balanceOf(address);

        console.log(`📊 Balance: ${ethers.formatUnits(balance, 18)} GC`);
        res.json({
            balanceRaw: balance.toString(),
            balanceFormatted: ethers.formatUnits(balance, 18)
        });
    } catch (error: any) {
        console.error('❌ Error getting balance:', error);
        res.status(500).json({ error: error.message || 'Unknown error occurred' });
    }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening at http://0.0.0.0:${PORT}`);
    console.log(`📄 Contract: ${CONTRACT_ADDRESS}`);
    console.log(`🔗 Provider: http://127.0.0.1:8545`);
}).on('error', (error: any) => {
    console.error('❌ Server failed to start:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    } else if (error.code === 'EACCES') {
        console.error(`Port ${PORT} requires elevated privileges`);
    }
});
