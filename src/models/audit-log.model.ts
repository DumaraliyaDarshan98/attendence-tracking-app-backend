import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  module: string; // e.g. users, attendance, leave

  @Prop({ required: true })
  action: 'create' | 'update' | 'delete';

  @Prop({ type: Types.ObjectId, required: false })
  entityId?: Types.ObjectId;

  @Prop({ required: false })
  entityType?: string; // model name or collection

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  performedBy: Types.ObjectId;

  @Prop({ required: false })
  performedByEmail?: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, unknown>;

  @Prop({
    type: [
      {
        field: { type: String, required: true },
        oldValue: { type: Object, required: false },
        newValue: { type: Object, required: false },
      },
    ],
    default: [],
  })
  changes: { field: string; oldValue?: unknown; newValue?: unknown }[];
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ module: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ entityId: 1, createdAt: -1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });


