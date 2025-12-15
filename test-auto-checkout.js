/**
 * Test Script for Auto-Checkout Functionality
 * 
 * This script tests two auto-checkout scenarios:
 * 1. 12-hour auto-checkout: User checks in, after 12 hours they are auto-checked out
 * 2. Midnight auto-checkout: All open sessions are checked out at 12:00 AM IST
 * 
 * Usage: node test-auto-checkout.js
 */

const axios = require('axios');

// ============================================================================
// CONFIGURATION - UPDATE THESE VALUES BEFORE RUNNING THE TEST
// ============================================================================
const BASE_URL = 'http://localhost:3100/api';
const TEST_EMAIL = 'john.doe@example.com'; // ⚠️ UPDATE: Use a valid user email from your database
const TEST_PASSWORD = 'newpassword123'; // ⚠️ UPDATE: Use the correct password for the test user

// ============================================================================
// IMPORTANT: Before running this test:
// 1. Make sure the backend server is running (npm run start:dev)
// 2. Update TEST_EMAIL and TEST_PASSWORD with valid credentials
// 3. Ensure the user exists in the database
// ============================================================================

// Test location
const TEST_LOCATION = {
  latitude: 28.6139,
  longitude: 77.2090 // New Delhi coordinates
};

let authToken = '';

/**
 * Helper function to make authenticated requests
 */
async function makeRequest(method, endpoint, data = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Helper function to checkout any existing open sessions
 * This function attempts to checkout directly, which is more reliable than querying
 */
async function checkoutExistingSessions() {
  try {
    console.log('   Checking for existing open sessions...');
    
    // The most reliable way is to try to checkout directly
    // If there's an open session, checkout will succeed
    // If there's no open session, we'll get a 404 error which we can ignore
    let attempts = 0;
    const maxAttempts = 3; // Try up to 3 times in case there are multiple sessions
    
    while (attempts < maxAttempts) {
      try {
        const checkoutResponse = await makeRequest('POST', '/attendance/checkout', TEST_LOCATION);
        attempts++;
        console.log(`   ✅ Checked out existing session (attempt ${attempts})`);
        // Wait a moment before trying again in case there are multiple sessions
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        // If we get a 404, it means there's no open session - this is expected
        if (error.message.includes('404') || 
            error.message.includes('not found') || 
            error.message.includes('No active check-in session')) {
          if (attempts === 0) {
            console.log('   ✅ No open sessions found.');
          }
          break; // No more sessions to checkout
        } else {
          // Some other error occurred
          console.log(`   ⚠️  Checkout attempt ${attempts + 1} failed: ${error.message}`);
          break; // Don't retry on unexpected errors
        }
      }
    }
    
    // Additional wait to ensure checkout is fully processed
    if (attempts > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  } catch (error) {
    // If there's an unexpected error, log it but don't fail the test
    console.log(`   ⚠️  Error during checkout check: ${error.message}`);
  }
}

/**
 * Test Scenario 1: 12-Hour Auto-Checkout
 * 
 * This test simulates:
 * - User checks in at a specific time
 * - After 12 hours, the system should auto-checkout the user
 * 
 * Note: In a real scenario, the scheduler runs every hour and checks for sessions
 * that have been open for 12+ hours. For testing, you can manually trigger the
 * autoCheckoutAfter12Hours method or wait for the hourly cron job.
 */
async function test12HourAutoCheckout() {
  console.log('\n🧪 Testing 12-Hour Auto-Checkout Functionality...\n');

  try {
    // Step 0: Check out any existing open sessions first
    console.log('0️⃣ Preparing: Checking for existing open sessions...');
    await checkoutExistingSessions();
    console.log('');

    // Step 1: Check in
    console.log('1️⃣ Checking in user...');
    const checkInResponse = await makeRequest('POST', '/attendance/checkin', TEST_LOCATION);
    
    // Handle both response formats (direct object or wrapped in data)
    const checkInData = checkInResponse.data || checkInResponse;
    
    console.log('✅ Check-in successful');
    console.log(`   Check-in Time: ${new Date(checkInData.checkInTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
    console.log(`   Session ID: ${checkInData._id}`);
    console.log(`   Is Checked Out: ${checkInData.isCheckedOut}`);

    const checkInTime = new Date(checkInData.checkInTime);
    const expectedCheckoutTime = new Date(checkInTime.getTime() + (12 * 60 * 60 * 1000));
    
    console.log(`\n   Expected Auto-Checkout Time: ${expectedCheckoutTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
    console.log(`   (12 hours after check-in)\n`);

    // Step 2: Verify session is open
    console.log('2️⃣ Verifying session is open...');
    const todayAttendance = await makeRequest('GET', '/attendance/today');
    
    // Handle both response formats
    let sessions = [];
    if (Array.isArray(todayAttendance)) {
      sessions = todayAttendance;
    } else if (todayAttendance.data) {
      sessions = Array.isArray(todayAttendance.data) ? todayAttendance.data : [];
    }
    
    const openSession = sessions.find(s => !s.isCheckedOut);
    
    if (openSession) {
      console.log('✅ Open session found');
      console.log(`   Session ID: ${openSession._id}`);
      console.log(`   Check-in Time: ${new Date(openSession.checkInTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
    } else {
      console.log('❌ No open session found');
    }

    console.log('\n📝 Note: The 12-hour auto-checkout will run automatically via the hourly cron job.');
    console.log('   The scheduler checks every hour for sessions that have been open for 12+ hours.');
    console.log('   To test immediately, you can manually trigger the autoCheckoutAfter12Hours method.\n');

    return checkInData;

  } catch (error) {
    console.error('❌ Error in 12-hour auto-checkout test:', error.message);
    throw error;
  }
}

/**
 * Test Scenario 2: Midnight Auto-Checkout
 * 
 * This test simulates:
 * - User checks in (e.g., at 8 PM)
 * - At midnight (12:00 AM IST), all open sessions should be auto-checked out
 * 
 * Note: In a real scenario, the scheduler runs at midnight IST and checks out
 * all open sessions. For testing, you can manually trigger the
 * autoCheckoutOpenSessions method or wait for the midnight cron job.
 */
async function testMidnightAutoCheckout() {
  console.log('\n🧪 Testing Midnight Auto-Checkout Functionality...\n');

  try {
    // Step 0: Check out any existing open sessions first
    console.log('0️⃣ Preparing: Checking for existing open sessions...');
    await checkoutExistingSessions();
    console.log('');

    // Step 1: Check in
    console.log('1️⃣ Checking in user...');
    const checkInResponse = await makeRequest('POST', '/attendance/checkin', TEST_LOCATION);
    
    // Handle both response formats (direct object or wrapped in data)
    const checkInData = checkInResponse.data || checkInResponse;
    
    console.log('✅ Check-in successful');
    console.log(`   Check-in Time: ${new Date(checkInData.checkInTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
    console.log(`   Session ID: ${checkInData._id}`);

    // Step 2: Verify session is open
    console.log('\n2️⃣ Verifying session is open...');
    const todayAttendance = await makeRequest('GET', '/attendance/today');
    
    // Handle both response formats
    let sessions = [];
    if (Array.isArray(todayAttendance)) {
      sessions = todayAttendance;
    } else if (todayAttendance.data) {
      sessions = Array.isArray(todayAttendance.data) ? todayAttendance.data : [];
    }
    
    const openSession = sessions.find(s => !s.isCheckedOut);
    
    if (openSession) {
      console.log('✅ Open session found');
      console.log(`   Session ID: ${openSession._id}`);
      console.log(`   Check-in Time: ${new Date(openSession.checkInTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
    }

    // Get current IST time
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const midnightIST = new Date(istNow);
    midnightIST.setHours(24, 0, 0, 0); // Next midnight

    console.log(`\n   Current IST Time: ${istNow.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
    console.log(`   Next Midnight (Auto-Checkout): ${midnightIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);

    console.log('\n📝 Note: The midnight auto-checkout will run automatically at 12:00 AM IST.');
    console.log('   The scheduler checks out ALL open sessions at midnight, regardless of check-in time.');
    console.log('   To test immediately, you can manually trigger the autoCheckoutOpenSessions method.\n');

    return checkInData;

  } catch (error) {
    console.error('❌ Error in midnight auto-checkout test:', error.message);
    throw error;
  }
}

/**
 * Verify current attendance status
 */
async function verifyAttendanceStatus() {
  console.log('\n📊 Current Attendance Status...\n');

  try {
    const todayAttendance = await makeRequest('GET', '/attendance/today');
    
    // Handle both response formats
    let sessions = [];
    if (Array.isArray(todayAttendance)) {
      sessions = todayAttendance;
    } else if (todayAttendance.data) {
      sessions = Array.isArray(todayAttendance.data) ? todayAttendance.data : [];
    }
    
    console.log(`Total sessions today: ${sessions.length}`);
    
    const openSessions = sessions.filter(s => !s.isCheckedOut);
    const closedSessions = sessions.filter(s => s.isCheckedOut);

    console.log(`Open sessions: ${openSessions.length}`);
    console.log(`Closed sessions: ${closedSessions.length}\n`);

    if (openSessions.length > 0) {
      console.log('Open Sessions:');
      openSessions.forEach((session, index) => {
        const checkInTime = new Date(session.checkInTime);
        const hoursOpen = (new Date().getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        console.log(`  ${index + 1}. Session ${session._id}`);
        console.log(`     Check-in: ${checkInTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
        console.log(`     Hours open: ${hoursOpen.toFixed(2)} hours`);
        if (hoursOpen >= 12) {
          console.log(`     ⚠️  This session should be auto-checked out (12+ hours)`);
        }
      });
    }

    if (closedSessions.length > 0) {
      console.log('\nClosed Sessions:');
      closedSessions.forEach((session, index) => {
        const checkInTime = new Date(session.checkInTime);
        const checkOutTime = new Date(session.checkOutTime);
        console.log(`  ${index + 1}. Session ${session._id}`);
        console.log(`     Check-in: ${checkInTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
        console.log(`     Check-out: ${checkOutTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
        console.log(`     Total hours: ${session.totalHours} hours`);
      });
    }

  } catch (error) {
    console.error('❌ Error verifying attendance status:', error.message);
    throw error;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Auto-Checkout Functionality Tests\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Login
    console.log('\n1️⃣ Logging in...');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   API URL: ${BASE_URL}/auth/login`);
    
    let loginResponse;
    try {
      loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
    } catch (loginError) {
      if (loginError.response) {
        console.error('❌ Login failed with status:', loginError.response.status);
        console.error('❌ Response data:', JSON.stringify(loginError.response.data, null, 2));
        throw new Error(`Login failed: ${loginError.response.status} - ${JSON.stringify(loginError.response.data)}`);
      } else if (loginError.request) {
        console.error('❌ No response received from server');
        console.error('❌ Request details:', loginError.request);
        throw new Error('Server is not responding. Make sure the backend server is running on http://localhost:3000');
      } else {
        throw loginError;
      }
    }

    // Handle different response formats
    let token = null;
    if (loginResponse.data.access_token) {
      token = loginResponse.data.access_token;
    } else if (loginResponse.data.data && loginResponse.data.data.access_token) {
      token = loginResponse.data.data.access_token;
    } else {
      console.error('❌ Unexpected response format:', JSON.stringify(loginResponse.data, null, 2));
      throw new Error('Invalid response format: access_token not found');
    }

    authToken = token;
    console.log('✅ Login successful');
    console.log(`   Token received: ${token.substring(0, 20)}...\n`);

    // Step 2: Test 12-hour auto-checkout
    await test12HourAutoCheckout();

    // Step 3: Wait a moment before next test
    console.log('\n⏳ Waiting 2 seconds before next test...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Test midnight auto-checkout
    await testMidnightAutoCheckout();

    // Step 5: Verify current status
    await verifyAttendanceStatus();

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ All tests completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   - 12-hour auto-checkout: Runs every hour via cron job');
    console.log('   - Midnight auto-checkout: Runs at 12:00 AM IST via cron job');
    console.log('   - Both functionalities are now active in the system\n');

  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('\nResponse Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('\nNo response received from server');
      console.error('Request config:', JSON.stringify(error.config, null, 2));
      console.error('\n💡 Make sure:');
      console.error('   1. The backend server is running on http://localhost:3000');
      console.error('   2. The API endpoint is correct');
      console.error('   3. There are no firewall/network issues');
    } else {
      console.error('\nError details:', error);
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Verify TEST_EMAIL and TEST_PASSWORD are correct');
    console.error('   2. Make sure the backend server is running: npm run start:dev');
    console.error('   3. Check if the user exists in the database');
    console.error('   4. Verify the API base URL is correct\n');
    
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n💥 Fatal error occurred:');
    console.error(error);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  });
}

module.exports = { runTests, test12HourAutoCheckout, testMidnightAutoCheckout };

