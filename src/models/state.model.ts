import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StateDocument = State & Document;

@Schema({ timestamps: true })
export class State {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;
}

export const StateSchema = SchemaFactory.createForClass(State);
