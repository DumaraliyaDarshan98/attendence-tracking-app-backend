const { connect, disconnect } = require('mongoose');

// Database configuration (same as in your app)
const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb+srv://darshandumaraliya:rJXF3jmWDMBUeThH@attendence-tracking-app.d2dn19p.mongodb.net/?retryWrites=true&w=majority&appName=attendence-tracking-app-clus-1',
  options: {
    dbName: process.env.DB_NAME || 'attendance_tracking',
  },
};

async function migrateUserRoles() {
  try {
    // Connect to MongoDB using existing config
    const mongoose = await connect(databaseConfig.uri, databaseConfig.options);
    console.log('Connected to MongoDB');
    console.log(`Database: ${databaseConfig.options.dbName}`);

    // Get the database
    const db = mongoose.connection.db;
    
    // Get collections
    const usersCollection = db.collection('users');
    const rolesCollection = db.collection('roles');

    console.log('Starting user role migration...');

    // Find all users with string role names
    const usersWithStringRoles = await usersCollection.find({
      role: { $type: 'string' }
    }).toArray();

    console.log(`Found ${usersWithStringRoles.length} users with string role names`);

    if (usersWithStringRoles.length === 0) {
      console.log('No users with string role names found. Migration not needed.');
      return;
    }

    // Get all roles to map names to ObjectIds
    const roles = await rolesCollection.find({}).toArray();
    const roleNameToIdMap = new Map();
    
    roles.forEach(role => {
      roleNameToIdMap.set(role.name, role._id);
    });

    console.log('Available roles:', Array.from(roleNameToIdMap.keys()));

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of usersWithStringRoles) {
      const roleName = user.role;
      
      if (roleNameToIdMap.has(roleName)) {
        // Update user with correct ObjectId
        const roleId = roleNameToIdMap.get(roleName);
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { role: roleId } }
        );
        console.log(`Updated user ${user.email}: role "${roleName}" -> ObjectId ${roleId}`);
        updatedCount++;
      } else {
        // Role doesn't exist, set to null
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { role: null } }
        );
        console.log(`User ${user.email}: role "${roleName}" not found, set to null`);
        skippedCount++;
      }
    }

    console.log('\nMigration completed!');
    console.log(`✅ Updated users: ${updatedCount}`);
    console.log(`⚠️  Users with null role: ${skippedCount}`);
    console.log(`📊 Total processed: ${usersWithStringRoles.length}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateUserRoles();
