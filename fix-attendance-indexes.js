const { MongoClient } = require('mongodb');

// Database configuration
const uri = 'mongodb+srv://darshandumaraliya:rJXF3jmWDMBUeThH@attendence-tracking-app.d2dn19p.mongodb.net/?retryWrites=true&w=majority&appName=attendence-tracking-app-clus-1';
const dbName = 'attendance_tracking';

async function fixAttendanceIndexes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const collection = db.collection('attendances');
    
    console.log('Fixing attendance indexes...');
    
    // Get all existing indexes
    const existingIndexes = await collection.indexes();
    console.log('Existing indexes:', existingIndexes.map(idx => idx.name));
    
    // Drop the problematic old unique index
    const oldIndex = existingIndexes.find(idx => 
      idx.name === 'userId_1_date_1' || 
      (idx.key && idx.key.userId === 1 && idx.key.date === 1 && idx.unique === true)
    );
    
    if (oldIndex) {
      console.log(`Dropping old index: ${oldIndex.name}`);
      await collection.dropIndex(oldIndex.name);
      console.log('Old index dropped successfully');
    }
    
    // Create the new compound index
    console.log('Creating new compound index...');
    await collection.createIndex(
      { userId: 1, date: 1, sessionNumber: 1 },
      { 
        unique: true,
        name: 'userId_date_sessionNumber_unique'
      }
    );
    
    // Create non-unique index for queries
    await collection.createIndex(
      { userId: 1, date: 1 },
      { 
        unique: false,
        name: 'userId_date_non_unique'
      }
    );
    
    // Update existing records
    const updateResult = await collection.updateMany(
      { sessionNumber: { $exists: false } },
      { $set: { sessionNumber: 1 } }
    );
    console.log(`Updated ${updateResult.modifiedCount} records`);
    
    // Verify final indexes
    const finalIndexes = await collection.indexes();
    console.log('Final indexes:', finalIndexes.map(idx => idx.name));
    
    console.log('✅ Attendance indexes fixed successfully!');
    
  } catch (error) {
    console.error('Failed to fix indexes:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

fixAttendanceIndexes();
