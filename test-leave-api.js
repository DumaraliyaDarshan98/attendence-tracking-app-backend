const axios = require('axios');

const BASE_URL = 'http://localhost:3100/api';

// Test data
const testLeaveId = '68a95fea080a0d16adea060e'; // Replace with actual ID from your database

async function testLeaveAPI() {
  try {
    console.log('🧪 Testing Leave Management API...\n');

    // Test 1: Get all leave requests
    console.log('1. Testing GET /leave-management/leave-requests');
    try {
      const response = await axios.get(`${BASE_URL}/leave-management/leave-requests`);
      console.log('✅ Success:', response.status, response.data.code);
      console.log('   Data count:', response.data.data?.data?.length || 0);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.statusText);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    // Test 2: Get specific leave request
    console.log('\n2. Testing GET /leave-management/leave-requests/:id');
    try {
      const response = await axios.get(`${BASE_URL}/leave-management/leave-requests/${testLeaveId}`);
      console.log('✅ Success:', response.status, response.data.code);
      console.log('   Leave ID:', response.data.data?._id);
      console.log('   Status:', response.data.data?.status);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.statusText);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    // Test 3: Test approve endpoint (without auth - should fail)
    console.log('\n3. Testing PUT /leave-management/leave-requests/:id/approve (without auth)');
    try {
      const response = await axios.put(`${BASE_URL}/leave-management/leave-requests/${testLeaveId}/approve`, {
        notes: 'Test approval'
      });
      console.log('✅ Success:', response.status, response.data.code);
    } catch (error) {
      console.log('❌ Expected Error (no auth):', error.response?.status, error.response?.statusText);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    // Test 4: Test reject endpoint (without auth - should fail)
    console.log('\n4. Testing PUT /leave-management/leave-requests/:id/reject (without auth)');
    try {
      const response = await axios.put(`${BASE_URL}/leave-management/leave-requests/${testLeaveId}/reject`, {
        rejectionReason: 'Test rejection'
      });
      console.log('✅ Success:', response.status, response.data.code);
    } catch (error) {
      console.log('❌ Expected Error (no auth):', error.response?.status, error.response?.statusText);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    // Test 5: Test CORS preflight
    console.log('\n5. Testing CORS preflight (OPTIONS request)');
    try {
      const response = await axios.options(`${BASE_URL}/leave-management/leave-requests/${testLeaveId}/approve`);
      console.log('✅ CORS preflight success:', response.status);
      console.log('   CORS headers:', {
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-methods': response.headers['access-control-allow-methods'],
        'access-control-allow-headers': response.headers['access-control-allow-headers']
      });
    } catch (error) {
      console.log('❌ CORS preflight failed:', error.message);
    }

    console.log('\n🎯 API Testing Complete!');
    console.log('\n📝 Notes:');
    console.log('   - Auth errors (401) are expected without valid JWT token');
    console.log('   - CORS should work properly now');
    console.log('   - Frontend should use PUT method for approve/reject');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLeaveAPI();
