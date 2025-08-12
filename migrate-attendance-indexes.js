const { connect, disconnect } = require('mongoose');

// Database configuration (same as in your app)
const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb+srv://darshandumaraliya:rJXF3jmWDMBUeThH@attendence-tracking-app.d2dn19p.mongodb.net/?retryWrites=true&w=majority&appName=attendence-tracking-app-clus-1',
  options: {
    dbName: process.env.DB_NAME || 'attendance_tracking',
  },
};

async function migrateAttendanceIndexes() {
  try {
    // Connect to MongoDB using existing config
    const mongoose = await connect(databaseConfig.uri, databaseConfig.options);
    console.log('Connected to MongoDB');
    console.log(`Database: ${databaseConfig.options.dbName}`);

    // Get the database
    const db = mongoose.connection.db;
    
    // Get attendance collection
    const attendanceCollection = db.collection('attendances');

    if (!attendanceCollection) {
      console.log('Attendance collection not found. Creating indexes for new collection...');
      return;
    }

    console.log('Starting attendance index migration...');

    // Get all existing indexes
    const existingIndexes = await attendanceCollection.indexes();
    console.log('Existing indexes:', existingIndexes.map(idx => idx.name));

    // Find and drop the old index if it exists
    const oldIndex = existingIndexes.find(idx => 
      idx.key && 
      idx.key.userId === 1 && 
      idx.key.date === 1 && 
      !idx.key.sessionNumber
    );

    if (oldIndex) {
      console.log(`Found old index: ${oldIndex.name}`);
      console.log('Dropping old index...');
      await attendanceCollection.dropIndex(oldIndex.name);
      console.log('Old index dropped successfully');
    } else {
      console.log('No old index found');
    }

    // Create the new compound index
    console.log('Creating new compound index...');
    await attendanceCollection.createIndex(
      { userId: 1, date: 1, sessionNumber: 1 },
      { 
        unique: true,
        name: 'userId_date_sessionNumber_unique'
      }
    );
    console.log('New compound index created successfully');

    // Verify the new index
    const newIndexes = await attendanceCollection.indexes();
    console.log('Updated indexes:', newIndexes.map(idx => idx.name));

    // Update existing records to have sessionNumber if missing
    console.log('Updating existing records with sessionNumber...');
    const updateResult = await attendanceCollection.updateMany(
      { sessionNumber: { $exists: false } },
      { $set: { sessionNumber: 1 } }
    );
    console.log(`Updated ${updateResult.modifiedCount} records with sessionNumber: 1`);

    console.log('\n✅ Attendance index migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateAttendanceIndexes();
