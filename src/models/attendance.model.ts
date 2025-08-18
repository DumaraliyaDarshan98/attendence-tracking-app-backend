import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: false })
  date: Date;

  @Prop({ required: true, unique: false })
  checkInTime: Date;

  @Prop({ unique: false })
  checkOutTime?: Date;

  @Prop({ default: false, unique: false })
  isCheckedOut: boolean;

  @Prop()
  totalHours?: number;

  @Prop({ default: 'present', unique: false })
  status: 'present' | 'absent' | 'late' | 'half-day';

  @Prop({ unique: false })
  notes?: string;

  @Prop({ default: 1 })
  sessionNumber: number; // Track multiple sessions per day

  // Location tracking for check-in
  @Prop({ type: Number, required: false })
  checkInLatitude?: number;

  @Prop({ type: Number, required: false })
  checkInLongitude?: number;

  // Location tracking for check-out
  @Prop({ type: Number, required: false })
  checkOutLatitude?: number;

  @Prop({ type: Number, required: false })
  checkOutLongitude?: number;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Drop any existing indexes first to avoid conflicts
AttendanceSchema.index({ userId: 1, date: 1, sessionNumber: 1 }, {
  unique: true,
  name: 'userId_date_sessionNumber_unique'
});

// Ensure no old unique constraints exist
AttendanceSchema.index({ userId: 1, date: 1 }, { 
  unique: false,
  name: 'userId_date_non_unique'
});

// Handle index creation errors gracefully
AttendanceSchema.on('index', function (error) {
  if (error) {
    console.error('Index creation error:', error);
    // If there's an error, try to drop conflicting indexes
    if (error.code === 85) { // Index already exists
      console.log('Index already exists, continuing...');
    } else {
      console.error('Failed to create index:', error.message);
    }
  }
});
