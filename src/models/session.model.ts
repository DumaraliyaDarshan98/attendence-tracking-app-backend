import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ required: false })
  deviceInfo?: string;

  @Prop({ required: false })
  ipAddress?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  lastActivity?: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Add TTL index to automatically delete expired sessions (30 days)
SessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

