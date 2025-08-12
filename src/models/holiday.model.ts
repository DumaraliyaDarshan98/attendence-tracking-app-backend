import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HolidayDocument = Holiday & Document;

@Schema({ timestamps: true })
export class Holiday {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isOptional: boolean; // Optional holidays (like Good Friday)
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);

// Create index for date-based queries
HolidaySchema.index({ date: 1 });
HolidaySchema.index({ isActive: 1 });
