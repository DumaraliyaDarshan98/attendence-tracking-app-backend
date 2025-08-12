import { connect, disconnect } from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

async function migrateUserRoles() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_tracking';
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the database
    const db = connect().connection.db;
    
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

// Run migration if called directly
if (require.main === module) {
  migrateUserRoles();
}

export { migrateUserRoles };
