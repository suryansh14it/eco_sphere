/**
 * Simple test script to verify blockchain integration
 */

const { ethers } = require('ethers');

async function testBlockchainConnection() {
  console.log('🧪 Testing blockchain integration...');
  
  try {
    // Test connection to local hardhat node
    console.log('1. Testing connection to Hardhat node...');
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (chainId: ${network.chainId})`);
    
    // Get block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Current block number: ${blockNumber}`);
    
    // Test wallet connection
    console.log('2. Testing wallet connection...');
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`✅ Wallet address: ${wallet.address}`);
    
    // Get wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`✅ Wallet balance: ${ethers.formatEther(balance)} ETH`);
    
    // Test EcoToken backend connection
    console.log('3. Testing EcoToken backend connection...');
    try {
      const response = await fetch('http://localhost:3001/test');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ EcoToken backend is running:', data.message);
      } else {
        console.log('❌ EcoToken backend returned error:', response.status);
      }
    } catch (error) {
      console.log('❌ EcoToken backend is not running:', error.message);
    }
    
    console.log('\n🎉 Blockchain integration test completed!');
    
  } catch (error) {
    console.error('❌ Blockchain integration test failed:', error);
  }
}

// Run the test
testBlockchainConnection();
