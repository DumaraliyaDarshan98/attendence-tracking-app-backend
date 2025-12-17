import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../models/audit-log.model';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async log(params: {
    module: string;
    action: 'create' | 'update' | 'delete';
    entityId?: string | Types.ObjectId;
    entityType?: string;
    performedBy: string | Types.ObjectId;
    performedByEmail?: string;
    changes?: { field: string; oldValue?: unknown; newValue?: unknown }[];
    metadata?: Record<string, unknown>;
  }): Promise<AuditLog> {
    const doc = new this.auditLogModel({
      module: params.module,
      action: params.action,
      entityId: params.entityId ? new Types.ObjectId(params.entityId) : undefined,
      entityType: params.entityType,
      performedBy: new Types.ObjectId(params.performedBy),
      performedByEmail: params.performedByEmail,
      changes: params.changes || [],
      metadata: params.metadata || {},
    });
    return doc.save();
  }

  async list(filters: {
    module?: string;
    action?: string;
    entityId?: string;
    performedBy?: string;
    page?: number;
    limit?: number;
  }, currentUser?: any): Promise<{ data: AuditLog[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: any = {};
    if (filters.module) query.module = filters.module;
    if (filters.action) query.action = filters.action;
    if (filters.entityId) query.entityId = new Types.ObjectId(filters.entityId);
    
    // Apply reporting state/city filtering
    let allowedUserIds: string[] | null = null;
    if (currentUser) {
      allowedUserIds = await this.usersService.getVisibleUserIds(currentUser);
    }

    if (filters.performedBy) {
      query.performedBy = new Types.ObjectId(filters.performedBy);
      // If we have allowed user IDs, make sure the requested user is in the list
      if (allowedUserIds && !allowedUserIds.includes(filters.performedBy)) {
        return {
          data: [],
          total: 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: 0,
        };
      }
    } else if (allowedUserIds) {
      // Filter by allowed user IDs for performedBy
      query.performedBy = { $in: allowedUserIds.map(id => new Types.ObjectId(id)) };
    }

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.auditLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.auditLogModel.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}


