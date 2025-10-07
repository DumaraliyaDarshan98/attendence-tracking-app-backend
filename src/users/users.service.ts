import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import { RolesService } from '../roles/roles.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { computeDiff } from '../common/utils/diff.util';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
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

  async importFromExcel(fileBuffer: Buffer, actor?: { _id: string; email?: string } | null): Promise<{ created: number; updated: number; skipped: number; errors: any[] }> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    let created = 0;
    let updated = 0;
    const errors: any[] = [];

    for (const [index, row] of rows.entries()) {
      try {
        const email = String(row.email || row.Email || '').trim();
        const firstname = String(row.firstname || row.Firstname || row.first_name || '').trim();
        const lastname = String(row.lastname || row.Lastname || row.last_name || '').trim();
        const mobilenumber = String(row.mobilenumber || row.Mobile || row.phone || '').trim();
        const addressline1 = String(row.addressline1 || row.Address1 || '').trim();
        const addressline2 = String(row.addressline2 || row.Address2 || '').trim();
        const city = String(row.city || '').trim();
        const state = String(row.state || '').trim();
        const center = String(row.center || row.taluka || '').trim();
        const pincode = String(row.pincode || row.zip || '').trim();
        const roleNameOrId = String(row.role || row.Role || '').trim();

        if (!email || !firstname || !lastname || !mobilenumber || !addressline1 || !city || !state || !pincode) {
          errors.push({ index, email, error: 'Missing required fields' });
          continue;
        }

        // Resolve role if provided (by name or id)
        let roleId: any = null;
        if (roleNameOrId) {
          if (roleNameOrId.match(/^[0-9a-fA-F]{24}$/)) {
            roleId = roleNameOrId;
          } else {
            const role = await this.rolesService.findByName?.(roleNameOrId) || null;
            roleId = (role as any)?._id || null;
          }
        }

        const existing = await this.userModel.findOne({ email }).exec();
        if (existing) {
          await this.userModel.updateOne({ _id: existing._id }, {
            firstname, lastname, mobilenumber, addressline1, addressline2, city, state, center, pincode, ...(roleId ? { role: roleId } : {})
          }).exec();
          updated++;
        } else {
          const password = String(row.password || 'Password@123');
          const hashedPassword = await bcrypt.hash(password, 10);
          await this.userModel.create({
            email, password: hashedPassword, firstname, lastname, role: roleId, mobilenumber, addressline1, addressline2, city, state, center, pincode
          });
          created++;
        }
      } catch (e) {
        errors.push({ index, error: (e as any)?.message || 'Unknown error' });
      }
    }

    return { created, updated, skipped: rows.length - created - updated - errors.length, errors };
  }

  async generateImportTemplate(): Promise<Buffer> {
    const headers = [[
      'firstname', 'lastname', 'email', 'mobilenumber', 'addressline1', 'addressline2', 'city', 'state', 'center', 'pincode', 'role', 'password'
    ]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    // Add a second row with hints (optional)
    XLSX.utils.sheet_add_aoa(ws, [[
      'John', 'Doe', 'john@example.com', '+11234567890', '123 Main St', '', 'New York', 'NY', 'Manhattan', '10001', 'admin', 'Password@123'
    ]], { origin: 'A2' });
    const buffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
} 