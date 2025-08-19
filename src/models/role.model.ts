import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface RolePermission {
  module: string;
  actions: string[]; // ['create', 'read', 'update', 'delete', 'list', 'approve', 'reject', 'export']
}

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  displayName: string;

  @Prop({ default: false })
  isSuperAdmin: boolean;

  @Prop({ type: [Object], default: [] })
  permissions: RolePermission[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;

  @Prop({ default: false })
  isSystemRole: boolean; // To prevent deletion of system roles
}

export const RoleSchema = SchemaFactory.createForClass(Role); 