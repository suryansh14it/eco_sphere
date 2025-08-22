/**
 * Test the EcoToken service integration
 */

// Import the service (we need to use dynamic import for ES modules)
async function testEcoTokenService() {
  console.log('🧪 Testing EcoToken Service Integration...');
  
  try {
    // Test environment variables
    console.log('1. Checking environment variables...');
    console.log(`   ECOTOKEN_ENABLED: ${process.env.ECOTOKEN_ENABLED}`);
    console.log(`   ECOTOKEN_BACKEND_URL: ${process.env.ECOTOKEN_BACKEND_URL}`);
    
    if (process.env.ECOTOKEN_ENABLED !== 'true') {
      console.log('❌ EcoToken integration is disabled in environment variables');
      return;
    }
    
    // Test backend connectivity
    console.log('2. Testing backend connectivity...');
    try {
      const response = await fetch(`${process.env.ECOTOKEN_BACKEND_URL}/test`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend is accessible:', data.message);
      } else {
        console.log('❌ Backend returned error:', response.status);
        return;
      }
    } catch (error) {
      console.log('❌ Backend is not accessible:', error.message);
      return;
    }
    
    // Test token minting
    console.log('3. Testing token minting...');
    const testWallet = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const testAmount = 25;
    
    try {
      const response = await fetch(`${process.env.ECOTOKEN_BACKEND_URL}/earn-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: testWallet,
          amount: testAmount
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Token minting successful! Tx: ${data.txHash}`);
        
        // Check balance
        const balanceResponse = await fetch(`${process.env.ECOTOKEN_BACKEND_URL}/balance/${testWallet}`);
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          console.log(`✅ Updated balance: ${balanceData.balanceFormatted} EcoTokens`);
        }
      } else {
        const errorData = await response.json();
        console.log('❌ Token minting failed:', errorData.error);
      }
    } catch (error) {
      console.log('❌ Token minting error:', error.message);
    }
    
    console.log('\n🎉 EcoToken service test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testEcoTokenService();
