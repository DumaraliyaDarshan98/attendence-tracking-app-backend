import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import { RolesService } from '../roles/roles.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { computeDiff } from '../common/utils/diff.util';
import * as bcrypt from 'bcrypt';
import { DateUtil } from '../common/utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private rolesService: RolesService,
    private auditLogsService: AuditLogsService,
  ) { }

  async create(createUserDto: any, actor?: { _id: string; email?: string } | null): Promise<User> {
    const { 
      email, 
      password, 
      firstname, 
      lastname, 
      role, 
      mobilenumber,
      addressline1,
      addressline2,
      city,
      state,
      center,
      pincode
    } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If no role is provided, leave it as null (user will have full permissions)
    // This allows for more flexible permission handling
    const userRole = role || null;

    const user = new this.userModel({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      role: userRole,
      mobilenumber,
      addressline1,
      addressline2,
      city,
      state,
      center,
      pincode,
    });

    const saved = await user.save();
    // Audit log
    await this.auditLogsService.log({
      module: 'users',
      action: 'create',
      entityId: (saved._id as any).toString(),
      entityType: 'User',
      performedBy: (actor?._id as any) || (saved._id as any),
      performedByEmail: actor?.email,
      changes: Object.keys(createUserDto).map((k) => ({ field: k, newValue: (createUserDto as any)[k] })),
      metadata: { email: saved.email },
    });
    // Populate role details if present
    const populated = await saved.populate({ path: 'role', select: '_id name displayName description isActive' });
    return populated as unknown as User;
  }

  async findAll(): Promise<User[]> {
    return this.userModel
      .find({}, { password: 0 })
      .populate({ path: 'role', select: '_id name displayName description isActive' })
      .exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id, { password: 0 })
      .populate({ path: 'role', select: '_id name displayName description isActive' })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: any, actor?: { _id: string; email?: string } | null): Promise<User> {
    const { password, ...updateData } = updateUserDto;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const before = await this.userModel.findById(id).lean();
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true, select: '-password' })
      .populate({ path: 'role', select: '_id name displayName description isActive' })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (before) {
      const changes = computeDiff(before as any, { ...before, ...updateData }, { ignore: ['password', '__v', 'updatedAt', 'createdAt'] });
      await this.auditLogsService.log({
        module: 'users',
        action: 'update',
        entityId: (user._id as any).toString(),
        entityType: 'User',
        performedBy: (actor?._id as any) || (user._id as any),
        performedByEmail: actor?.email,
        changes,
        metadata: { email: user.email },
      });
    }
    return user;
  }

  async remove(id: string, actor?: { _id: string; email?: string } | null): Promise<void> {
    const before = await this.userModel.findById(id).lean();
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
    if (before) {
      await this.auditLogsService.log({
        module: 'users',
        action: 'delete',
        entityId: id,
        entityType: 'User',
        performedBy: (actor?._id as any) || id,
        performedByEmail: actor?.email,
        changes: Object.keys(before).map((k) => ({ field: k, oldValue: (before as any)[k] })),
        metadata: { email: (before as any).email },
      });
    }
  }

  async validatePassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
} 