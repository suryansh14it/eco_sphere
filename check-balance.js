/**
 * Script to check EcoToken balance for a wallet address
 */

const { ethers } = require('ethers');

async function checkBalance(walletAddress) {
  console.log(`🔍 Checking EcoToken balance for: ${walletAddress}`);
  
  try {
    // Method 1: Using the EcoToken backend API
    console.log('\n📡 Method 1: Using EcoToken Backend API');
    try {
      const response = await fetch(`http://localhost:3001/balance/${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Balance: ${data.balanceFormatted} EcoTokens`);
        console.log(`   Raw balance: ${data.balanceRaw} wei`);
      } else {
        console.log('❌ Backend API error:', response.status);
      }
    } catch (error) {
      console.log('❌ Backend API not available:', error.message);
    }

    // Method 2: Direct blockchain query
    console.log('\n⛓️  Method 2: Direct Blockchain Query');
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      
      // Contract ABI for balanceOf function
      const contractABI = [
        "function balanceOf(address owner) view returns (uint256)"
      ];
      
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      const balance = await contract.balanceOf(walletAddress);
      const formattedBalance = ethers.formatUnits(balance, 18);
      
      console.log(`✅ Balance: ${formattedBalance} EcoTokens`);
      console.log(`   Raw balance: ${balance.toString()} wei`);
    } catch (error) {
      console.log('❌ Direct blockchain query failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Error checking balance:', error);
  }
}

// Get wallet address from command line argument or use default
const walletAddress = process.argv[2] || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

// Validate wallet address format
if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
  console.error('❌ Invalid wallet address format. Must be 42 characters starting with 0x.');
  console.log('Usage: node check-balance.js YOUR_WALLET_ADDRESS');
  process.exit(1);
}

checkBalance(walletAddress);
