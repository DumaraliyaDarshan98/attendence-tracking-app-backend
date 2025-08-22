const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system';
const DB_NAME = 'attendance_system';

// New permission structure mapping
const MODULE_ACTION_MAPPING = {
  'users': ['create', 'read', 'update', 'delete', 'list'],
  'roles': ['create', 'read', 'update', 'delete', 'list'],
  'permissions': ['create', 'read', 'update', 'delete', 'list'],
  'attendance': ['create', 'read', 'update', 'delete', 'list', 'export'],
  'leave': ['create', 'read', 'update', 'delete', 'list', 'approve', 'reject'],
  'holiday': ['create', 'read', 'update', 'delete', 'list'],
  'tour': ['create', 'read', 'update', 'delete', 'list', 'approve', 'reject'],
  'timelog': ['create', 'read', 'update', 'delete', 'list', 'export'],
  'reports': ['read', 'list', 'export']
};

async function migrateRolesAndPermissions() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const rolesCollection = db.collection('roles');
    const permissionsCollection = db.collection('permissions');
    
    console.log('📊 Connected to database:', DB_NAME);
    
    // Check if we need to migrate
    const existingRoles = await rolesCollection.find({}).toArray();
    const hasNewStructure = existingRoles.some(role => 
      role.permissions && 
      Array.isArray(role.permissions) && 
      role.permissions.length > 0 && 
      typeof role.permissions[0] === 'object' && 
      'module' in role.permissions[0]
    );
    
    if (hasNewStructure) {
      console.log('✅ Roles already have the new permission structure. No migration needed.');
      return;
    }
    
    console.log('🔄 Starting migration to new permission structure...');
    
    // Get all existing permissions
    const existingPermissions = await permissionsCollection.find({}).toArray();
    console.log(`📋 Found ${existingPermissions.length} existing permissions`);
    
    // Create permission lookup map
    const permissionMap = new Map();
    existingPermissions.forEach(perm => {
      permissionMap.set(perm._id.toString(), perm);
    });
    
    // Migrate each role
    for (const role of existingRoles) {
      console.log(`🔄 Migrating role: ${role.name}`);
      
      if (role.isSuperAdmin) {
        // Super admin gets all permissions
        role.permissions = Object.keys(MODULE_ACTION_MAPPING).map(module => ({
          module,
          actions: [...MODULE_ACTION_MAPPING[module]]
        }));
        role.isSystemRole = true;
      } else {
        // Convert old permission references to new structure
        const newPermissions = [];
        const modulePermissions = new Map();
        
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(permissionId => {
            const permission = permissionMap.get(permissionId.toString());
            if (permission) {
              if (!modulePermissions.has(permission.module)) {
                modulePermissions.set(permission.module, new Set());
              }
              modulePermissions.get(permission.module).add(permission.action);
            }
          });
        }
        
        // Convert to new format
        modulePermissions.forEach((actions, module) => {
          newPermissions.push({
            module,
            actions: Array.from(actions)
          });
        });
        
        role.permissions = newPermissions;
        role.isSystemRole = role.name === 'admin' || role.name === 'manager' || role.name === 'user';
      }
      
      // Update the role
      await rolesCollection.updateOne(
        { _id: role._id },
        { 
          $set: { 
            permissions: role.permissions,
            isSystemRole: role.isSystemRole || false
          }
        }
      );
      
      console.log(`✅ Migrated role: ${role.name} with ${role.permissions.length} module permissions`);
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Display summary
    const updatedRoles = await rolesCollection.find({}).toArray();
    console.log('\n📊 Migration Summary:');
    updatedRoles.forEach(role => {
      const totalActions = role.permissions.reduce((sum, perm) => sum + perm.actions.length, 0);
      console.log(`  - ${role.name}: ${role.permissions.length} modules, ${totalActions} total actions`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateRolesAndPermissions()
    .then(() => {
      console.log('🚀 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateRolesAndPermissions };
