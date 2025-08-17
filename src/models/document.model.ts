import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Types } from 'mongoose';

export type DocumentDocument = Document & MongooseDocument;

@Schema({ timestamps: true })
export class Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  originalFileName: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;

  @Prop()
  tags?: string[];

  @Prop({ default: 'document' })
  category: string;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
