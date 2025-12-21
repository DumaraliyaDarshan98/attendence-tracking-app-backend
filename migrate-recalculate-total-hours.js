const { connect, disconnect } = require('mongoose');

// Database configuration (same as in your app)
const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb+srv://darshandumaraliya:rJXF3jmWDMBUeThH@attendence-tracking-app.d2dn19p.mongodb.net/?retryWrites=true&w=majority&appName=attendence-tracking-app-clus-1',
  options: {
    dbName: process.env.DB_NAME || 'attendance_tracking',
  },
};

/**
 * Migration script to recalculate totalHours for all attendance records
 * This script:
 * 1. Finds all attendance records with checkInTime and checkOutTime
 * 2. Recalculates totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60)
 * 3. Updates records with the correct totalHours value
 */
async function migrateRecalculateTotalHours() {
  try {
    // Connect to MongoDB
    const mongoose = await connect(databaseConfig.uri, databaseConfig.options);
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${databaseConfig.options.dbName}`);

    // Get the database
    const db = mongoose.connection.db;
    
    // Get attendance collection
    const attendanceCollection = db.collection('attendances');

    if (!attendanceCollection) {
      console.log('❌ Attendance collection not found.');
      return;
    }

    console.log('\n🔄 Starting totalHours recalculation migration...\n');

    // Find all records that have both checkInTime and checkOutTime
    const query = {
      checkInTime: { $exists: true, $ne: null },
      checkOutTime: { $exists: true, $ne: null },
      isCheckedOut: true
    };

    // Get total count for progress tracking
    const totalCount = await attendanceCollection.countDocuments(query);
    console.log(`📈 Found ${totalCount} attendance records to process\n`);

    if (totalCount === 0) {
      console.log('✅ No records to process. Migration complete.');
      await disconnect();
      return;
    }

    // Process records in batches
    const batchSize = 100;
    let processed = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Use cursor for efficient batch processing
    const cursor = attendanceCollection.find(query).batchSize(batchSize);
    
    let batch = [];
    
    for await (const record of cursor) {
      try {
        // Calculate totalHours
        const checkInTime = new Date(record.checkInTime);
        const checkOutTime = new Date(record.checkOutTime);
        
        // Validate dates
        if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime())) {
          console.warn(`⚠️  Skipping record ${record._id}: Invalid date values`);
          skipped++;
          continue;
        }
        
        // Calculate difference in milliseconds
        const diffMs = checkOutTime.getTime() - checkInTime.getTime();
        
        // Skip if negative (invalid data)
        if (diffMs < 0) {
          console.warn(`⚠️  Skipping record ${record._id}: Negative time difference (checkOutTime < checkInTime)`);
          skipped++;
          continue;
        }
        
        // Convert to hours and round to 2 decimal places
        const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
        
        // Check if totalHours needs to be updated
        const needsUpdate = 
          record.totalHours === undefined || 
          record.totalHours === null || 
          Math.abs(record.totalHours - totalHours) > 0.01; // Allow 0.01 hour tolerance
        
        if (needsUpdate) {
          batch.push({
            updateOne: {
              filter: { _id: record._id },
              update: { 
                $set: { 
                  totalHours: totalHours 
                } 
              }
            }
          });
          
          // Execute batch when it reaches batchSize
          if (batch.length >= batchSize) {
            const result = await attendanceCollection.bulkWrite(batch, { ordered: false });
            updated += result.modifiedCount;
            batch = [];
          }
        }
        
        processed++;
        
        // Log progress every 100 records
        if (processed % 100 === 0) {
          console.log(`📊 Progress: ${processed}/${totalCount} processed, ${updated} updated, ${skipped} skipped`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing record ${record._id}:`, error.message);
        errors++;
      }
    }
    
    // Process remaining batch
    if (batch.length > 0) {
      const result = await attendanceCollection.bulkWrite(batch, { ordered: false });
      updated += result.modifiedCount;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log(`📊 Total records processed: ${processed}`);
    console.log(`✅ Records updated: ${updated}`);
    console.log(`⏭️  Records skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');

    // Verify some records
    console.log('🔍 Verifying updated records...\n');
    const sampleRecords = await attendanceCollection.find(query).limit(5).toArray();
    
    for (const record of sampleRecords) {
      const checkIn = new Date(record.checkInTime);
      const checkOut = new Date(record.checkOutTime);
      const calculatedHours = Math.round(((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)) * 100) / 100;
      
      console.log(`Record ID: ${record._id}`);
      console.log(`  Check-in: ${checkIn.toISOString()}`);
      console.log(`  Check-out: ${checkOut.toISOString()}`);
      console.log(`  Stored totalHours: ${record.totalHours}`);
      console.log(`  Calculated totalHours: ${calculatedHours}`);
      console.log(`  Match: ${Math.abs(record.totalHours - calculatedHours) < 0.01 ? '✅' : '❌'}\n`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration
if (require.main === module) {
  migrateRecalculateTotalHours()
    .then(() => {
      console.log('\n✅ Script execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script execution failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateRecalculateTotalHours };

