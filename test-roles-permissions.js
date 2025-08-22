const axios = require('axios');

const BASE_URL = 'http://localhost:3100/api';

// Test data
const testPermission = {
  name: 'test:create',
  module: 'test',
  action: 'create',
  description: 'Test permission for testing'
};

const testRole = {
  name: 'test_role',
  displayName: 'Test Role',
  description: 'A test role for testing purposes',
  isSuperAdmin: false
};

let authToken = '';
let createdPermissionId = '';
let createdRoleId = '';

async function testAuth() {
  console.log('🔐 Testing Authentication...');
  
  try {
    // Test login (you'll need to create a test user first)
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    authToken = loginResponse.data.access_token;
    console.log('✅ Login successful');
    console.log('User permissions:', loginResponse.data.user.permissions?.length || 0);
    
    return true;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    console.log('💡 Create a test user first or use existing credentials');
    return false;
  }
}

async function testPermissions() {
  console.log('\n🔑 Testing Permissions API...');
  
  try {
    // Create permission
    console.log('Creating permission...');
    const createResponse = await axios.post(`${BASE_URL}/permissions`, testPermission, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    createdPermissionId = createResponse.data.data._id;
    console.log('✅ Permission created:', createResponse.data.data.name);
    
    // Get all permissions
    console.log('Getting all permissions...');
    const listResponse = await axios.get(`${BASE_URL}/permissions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Permissions retrieved:', listResponse.data.data.length);
    
    // Get permission by ID
    console.log('Getting permission by ID...');
    const getResponse = await axios.get(`${BASE_URL}/permissions/${createdPermissionId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Permission retrieved:', getResponse.data.data.name);
    
    return true;
  } catch (error) {
    console.log('❌ Permissions test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testRoles() {
  console.log('\n👥 Testing Roles API...');
  
  try {
    // Create role
    console.log('Creating role...');
    const createResponse = await axios.post(`${BASE_URL}/roles`, testRole, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    createdRoleId = createResponse.data.data._id;
    console.log('✅ Role created:', createResponse.data.data.name);
    
    // Get all roles
    console.log('Getting all roles...');
    const listResponse = await axios.get(`${BASE_URL}/roles`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Roles retrieved:', listResponse.data.data.length);
    
    // Get role by ID
    console.log('Getting role by ID...');
    const getResponse = await axios.get(`${BASE_URL}/roles/${createdRoleId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Role retrieved:', getResponse.data.data.name);
    
    return true;
  } catch (error) {
    console.log('❌ Roles test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testAssignPermissions() {
  console.log('\n🔗 Testing Permission Assignment...');
  
  try {
    // Assign permissions to role
    console.log('Assigning permissions to role...');
    const assignResponse = await axios.post(`${BASE_URL}/roles/${createdRoleId}/permissions`, {
      permissionIds: [createdPermissionId]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Permissions assigned to role');
    console.log('Role permissions:', assignResponse.data.data.permissions.length);
    
    return true;
  } catch (error) {
    console.log('❌ Permission assignment failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    if (createdRoleId) {
      await axios.delete(`${BASE_URL}/roles/${createdRoleId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Test role deleted');
    }
    
    if (createdPermissionId) {
      await axios.delete(`${BASE_URL}/permissions/${createdPermissionId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Test permission deleted');
    }
  } catch (error) {
    console.log('⚠️ Cleanup failed:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Roles and Permissions API Tests\n');
  
  const authSuccess = await testAuth();
  if (!authSuccess) {
    console.log('\n❌ Authentication failed. Cannot continue tests.');
    return;
  }
  
  const permissionsSuccess = await testPermissions();
  const rolesSuccess = await testRoles();
  
  if (permissionsSuccess && rolesSuccess) {
    await testAssignPermissions();
  }
  
  await cleanup();
  
  console.log('\n✨ Tests completed!');
}

// Run tests
runTests().catch(console.error);
