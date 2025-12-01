import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: false , default: null })
  role: Types.ObjectId;

  @Prop({ required: true })
  mobilenumber: string;

  @Prop({ required: false })
  addressline1?: string;

  @Prop({ required: false })
  addressline2?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  state?: string;

  @Prop({ required: false })
  center?: string;

  @Prop({ required: false })
  pincode?: string;

  @Prop({ required: false })
  designation?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User); 