/**
 * Test XP earning and token minting integration
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import User model (we'll need to handle the ES module import)
async function testXPEarning() {
  console.log('🧪 Testing XP Earning and Token Minting...');
  
  try {
    // Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import the User model
    const User = require('./models/User.ts').default;
    
    // Find or create a test user
    console.log('2. Finding/creating test user...');
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      testUser = new User({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User',
        role: 'user',
        location: 'Test Location'
      });
      await testUser.save();
      console.log('✅ Created test user');
    } else {
      console.log('✅ Found existing test user');
    }
    
    console.log(`   User ID: ${testUser._id}`);
    console.log(`   Current XP: ${testUser.xpPoints}`);
    console.log(`   Wallet Address: ${testUser.walletAddress || 'Not set'}`);
    
    // Set wallet address if not set
    if (!testUser.walletAddress) {
      console.log('3. Setting wallet address...');
      testUser.walletAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      await testUser.save();
      console.log('✅ Wallet address set');
    }
    
    // Test XP earning
    console.log('4. Testing XP earning...');
    const xpToEarn = 30;
    
    console.log(`   Earning ${xpToEarn} XP...`);
    await testUser.addXP(xpToEarn, {
      eventType: 'educational_content',
      description: 'Test XP earning for token minting',
      environmentalImpact: {
        co2Offset: 1.5,
        treesPlanted: 0,
        waterSaved: 5
      }
    });
    
    console.log(`✅ XP earned! New total: ${testUser.xpPoints}`);
    
    // Check token balance
    console.log('5. Checking token balance...');
    const walletAddress = testUser.walletAddress;
    
    try {
      const response = await fetch(`http://localhost:3001/balance/${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Token balance: ${data.balanceFormatted} EcoTokens`);
      } else {
        console.log('❌ Failed to check token balance');
      }
    } catch (error) {
      console.log('❌ Error checking token balance:', error.message);
    }
    
    console.log('\n🎉 XP earning test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

testXPEarning();
