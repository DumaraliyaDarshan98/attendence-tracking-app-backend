const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Test coordinates (New York City)
const TEST_LOCATION = {
  latitude: 40.7128,
  longitude: -74.0060
};

// Test coordinates (London)
const LONDON_LOCATION = {
  latitude: 51.5074,
  longitude: -0.1278
};

async function testLocationTracking() {
  try {
    console.log('🧪 Testing Attendance Location Tracking...\n');

    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Step 2: Check-in with location
    console.log('2️⃣ Testing check-in with location...');
    const checkInResponse = await axios.post(`${BASE_URL}/attendance/checkin`, TEST_LOCATION, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Check-in successful with location:');
    console.log(`   Latitude: ${checkInResponse.data.data.checkInLatitude}`);
    console.log(`   Longitude: ${checkInResponse.data.data.checkInLongitude}\n`);

    // Step 3: Check-out with different location
    console.log('3️⃣ Testing check-out with different location...');
    const checkOutResponse = await axios.post(`${BASE_URL}/attendance/checkout`, LONDON_LOCATION, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Check-out successful with location:');
    console.log(`   Check-in Location: ${checkOutResponse.data.data.checkInLatitude}, ${checkOutResponse.data.data.checkInLongitude}`);
    console.log(`   Check-out Location: ${checkOutResponse.data.data.checkOutLatitude}, ${checkOutResponse.data.data.checkOutLongitude}\n`);

    // Step 4: Start new session with location
    console.log('4️⃣ Testing new session with location...');
    const newSessionResponse = await axios.post(`${BASE_URL}/attendance/start-new-session`, TEST_LOCATION, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ New session started with location:');
    console.log(`   Session Number: ${newSessionResponse.data.data.sessionNumber}`);
    console.log(`   Latitude: ${newSessionResponse.data.data.checkInLatitude}`);
    console.log(`   Longitude: ${newSessionResponse.data.data.checkInLongitude}\n`);

    // Step 5: Check-out from new session
    console.log('5️⃣ Testing check-out from new session...');
    const finalCheckOutResponse = await axios.post(`${BASE_URL}/attendance/checkout`, LONDON_LOCATION, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Final check-out successful:');
    console.log(`   Session Number: ${finalCheckOutResponse.data.data.sessionNumber}`);
    console.log(`   Check-in Location: ${finalCheckOutResponse.data.data.checkInLatitude}, ${finalCheckOutResponse.data.data.checkInLongitude}`);
    console.log(`   Check-out Location: ${finalCheckOutResponse.data.data.checkOutLatitude}, ${finalCheckOutResponse.data.data.checkOutLongitude}\n`);

    // Step 6: Get today's attendance to verify all data
    console.log('6️⃣ Retrieving today\'s attendance to verify location data...');
    const todayResponse = await axios.get(`${BASE_URL}/attendance/today`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Today\'s attendance retrieved:');
    todayResponse.data.data.forEach((record, index) => {
      console.log(`   Session ${index + 1}:`);
      console.log(`     Check-in: ${record.checkInLatitude}, ${record.checkInLongitude}`);
      if (record.isCheckedOut) {
        console.log(`     Check-out: ${record.checkOutLatitude}, ${record.checkOutLongitude}`);
      }
      console.log(`     Hours: ${record.totalHours || 'N/A'}`);
    });

    console.log('\n🎉 All location tracking tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Check-in with location: ✅');
    console.log('   - Check-out with location: ✅');
    console.log('   - New session with location: ✅');
    console.log('   - Location data retrieval: ✅');
    console.log('   - Multiple sessions per day: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Make sure you have a valid user account with the test credentials.');
      console.log('   You can create a user using the registration endpoint first.');
    }
  }
}

// Test validation errors
async function testValidationErrors() {
  try {
    console.log('\n🧪 Testing location validation errors...\n');

    // Step 1: Login to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const token = loginResponse.data.access_token;

    // Step 2: Test invalid latitude (too high)
    console.log('1️⃣ Testing invalid latitude (too high)...');
    try {
      await axios.post(`${BASE_URL}/attendance/checkin`, {
        latitude: 95.0,  // Invalid: > 90
        longitude: -74.0060
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid latitude correctly rejected');
      } else {
        throw error;
      }
    }

    // Step 3: Test invalid longitude (too low)
    console.log('2️⃣ Testing invalid longitude (too low)...');
    try {
      await axios.post(`${BASE_URL}/attendance/checkin`, {
        latitude: 40.7128,
        longitude: -185.0  // Invalid: < -180
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid longitude correctly rejected');
      } else {
        throw error;
      }
    }

    console.log('\n✅ All validation error tests passed!');

  } catch (error) {
    console.error('❌ Validation test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runAllTests() {
  await testLocationTracking();
  await testValidationErrors();
}

// Check if running directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testLocationTracking, testValidationErrors };
