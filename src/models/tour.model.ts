import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TourDocument = Tour & Document;

@Schema({ timestamps: true })
export class TourStatusHistory {
  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  changedBy: string; // User ID who changed the status

  @Prop({ required: true })
  changedByName: string; // User name for display

  @Prop()
  notes?: string; // Optional notes about the status change

  @Prop({ default: Date.now })
  changedAt: Date;
}

@Schema({ timestamps: true })
export class TourDocument {
  @Prop({ type: String })
  fileName: string;

  @Prop({ type: String })
  fileUrl: string;

  @Prop({ type: String })
  fileType: string;

  @Prop({ type: Number })
  fileSize: number;
}

@Schema({ timestamps: true })
export class Tour {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedTo: Types.ObjectId; // User assigned to the tour

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId; // User who created the tour

  @Prop({ required: true })
  purpose: string; // Purpose of the site visit

  @Prop({ required: true })
  location: string; // Location of the site visit

  @Prop({ required: true })
  expectedTime: Date; // Expected time for the visit

  @Prop({ type: [TourDocument], default: [] })
  documents: TourDocument[]; // Multiple documents

  @Prop()
  userNotes?: string; // Notes from the user

  @Prop({ default: 'pending' })
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'approved' | 'rejected';

  @Prop({ type: [TourStatusHistory], default: [] })
  statusHistory: TourStatusHistory[]; // History of status changes

  @Prop()
  adminNotes?: string; // Notes from admin

  @Prop()
  actualVisitTime?: Date; // Actual time when user visited

  @Prop()
  completionNotes?: string; // Notes when tour is completed

  @Prop({ default: true })
  isActive: boolean;
}

export const TourSchema = SchemaFactory.createForClass(Tour);

// Add indexes for better query performance
TourSchema.index({ assignedTo: 1, status: 1 });
TourSchema.index({ createdBy: 1 });
TourSchema.index({ status: 1 });
TourSchema.index({ expectedTime: 1 });
