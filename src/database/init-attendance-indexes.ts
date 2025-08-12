import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from '../models/attendance.model';

@Injectable()
export class AttendanceIndexService {
  private readonly logger = new Logger(AttendanceIndexService.name);

  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

  async initializeIndexes(): Promise<void> {
    try {
      this.logger.log('Starting attendance index initialization...');

      // Get the collection
      const collection = this.attendanceModel.collection;

      // Get all existing indexes
      const existingIndexes = await collection.indexes();
      this.logger.log('Existing indexes:', existingIndexes.map(idx => idx.name));

      // Find and drop the old unique index if it exists
      const oldUniqueIndex = existingIndexes.find(idx => 
        idx.key && 
        idx.key.userId === 1 && 
        idx.key.date === 1 && 
        idx.unique === true &&
        !idx.key.sessionNumber
      );

      if (oldUniqueIndex) {
        this.logger.log(`Found old unique index: ${oldUniqueIndex.name}`);
        this.logger.log('Dropping old unique index...');
        await collection.dropIndex(oldUniqueIndex.name || '');
        this.logger.log('Old unique index dropped successfully');
      }

      // Drop any conflicting indexes
      const conflictingIndexes = existingIndexes.filter(idx => 
        idx.name === 'userId_1_date_1' || 
        (idx.key && idx.key.userId === 1 && idx.key.date === 1 && idx.unique === true)
      );

      for (const idx of conflictingIndexes) {
        try {
          this.logger.log(`Dropping conflicting index: ${idx.name}`);
          await collection.dropIndex(idx.name || '');
        } catch (error) {
          this.logger.warn(`Could not drop index ${idx.name}:`, error.message);
        }
      }

      // Create the new compound index
      this.logger.log('Creating new compound index...');
      await collection.createIndex(
        { userId: 1, date: 1, sessionNumber: 1 },
        { 
          unique: true,
          name: 'userId_date_sessionNumber_unique'
        }
      );
      this.logger.log('New compound index created successfully');

      // Create a non-unique index for userId + date queries
      this.logger.log('Creating non-unique userId_date index...');
      await collection.createIndex(
        { userId: 1, date: 1 },
        { 
          unique: false,
          name: 'userId_date_non_unique'
        }
      );

      // Update existing records to have sessionNumber if missing
      this.logger.log('Updating existing records with sessionNumber...');
      const updateResult = await this.attendanceModel.updateMany(
        { sessionNumber: { $exists: false } },
        { $set: { sessionNumber: 1 } }
      );
      this.logger.log(`Updated ${updateResult.modifiedCount} records with sessionNumber: 1`);

      // Verify the final indexes
      const finalIndexes = await collection.indexes();
      this.logger.log('Final indexes:', finalIndexes.map(idx => idx.name));

      this.logger.log('✅ Attendance index initialization completed successfully!');

    } catch (error) {
      this.logger.error('Failed to initialize attendance indexes:', error);
      throw error;
    }
  }
}
