import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveRequestDocument = LeaveRequest & Document;

@Schema({ timestamps: true })
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  leaveType: 'full-day' | 'half-day' | 'sick' | 'casual' | 'annual' | 'other';

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop({ default: false })
  isHalfDay: boolean;

  @Prop()
  halfDayType?: 'morning' | 'afternoon'; // For half-day leaves

  @Prop()
  totalDays: number; // Calculated field

  @Prop()
  notes?: string;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);

// Create indexes for efficient queries
LeaveRequestSchema.index({ userId: 1, startDate: 1, endDate: 1 });
LeaveRequestSchema.index({ status: 1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });
