import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import { RolesService } from '../roles/roles.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { SessionsService } from '../sessions/sessions.service';
import { AttendanceService } from '../attendance/attendance.service';
import { LeaveManagementService } from '../leave-management/leave-management.service';
import { TourManagementService } from '../tour-management/tour-management.service';
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
    private sessionsService: SessionsService,
    @Inject(forwardRef(() => AttendanceService))
    private attendanceService: AttendanceService,
    @Inject(forwardRef(() => LeaveManagementService))
    private leaveManagementService: LeaveManagementService,
    @Inject(forwardRef(() => TourManagementService))
    private tourManagementService: TourManagementService,
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
      pincode,
      designation,
      reportingState,
      reportingCity
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
    const userRole = role || '6889eb3a408b2d934cd0b2bf';

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
      designation,
      reportingState: reportingState || [],
      reportingCity: reportingCity || [],
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

  async findAll(query?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; state?: string; city?: string; center?: string }, currentUser?: any): Promise<{ data: User[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    const search = query?.search || '';
    const sortBy = query?.sortBy || 'createdAt';
    const sortOrder = query?.sortOrder || 'desc';

    // Build search query
    const searchQuery: any = {};
    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = search.trim();
      searchQuery.$or = [
        { firstname: { $regex: searchTerm, $options: 'i' } },
        { lastname: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { mobilenumber: { $regex: searchTerm, $options: 'i' } },
        { city: { $regex: searchTerm, $options: 'i' } },
        { state: { $regex: searchTerm, $options: 'i' } },
        { center: { $regex: searchTerm, $options: 'i' } },
        { pincode: { $regex: searchTerm, $options: 'i' } },
        { designation: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // Add filter for state (ensure it's a string)
    if (query?.state && typeof query.state === 'string' && query.state.trim()) {
      searchQuery.state = { $regex: String(query.state).trim(), $options: 'i' };
    }

    // Add filter for city (ensure it's a string)
    if (query?.city && typeof query.city === 'string' && query.city.trim()) {
      searchQuery.city = { $regex: String(query.city).trim(), $options: 'i' };
    }

    // Add filter for center (taluka) (ensure it's a string)
    if (query?.center && typeof query.center === 'string' && query.center.trim()) {
      searchQuery.center = { $regex: String(query.center).trim(), $options: 'i' };
    }

    // Apply reporting state/city filtering based on current user
    if (currentUser) {
      // Get current user's role to check if super admin
      const currentUserWithRole = await this.userModel
        .findById(currentUser._id || currentUser.id)
        .populate({ path: 'role', select: '_id name displayName description isActive isSuperAdmin' })
        .exec();
      
      const isSuperAdmin = (currentUserWithRole?.role as any)?.isSuperAdmin || false;
      
      if (!isSuperAdmin) {
        // If user has reporting state/city, filter by them
        const reportingStates = currentUserWithRole?.reportingState || [];
        const reportingCities = currentUserWithRole?.reportingCity || [];
        
        if (reportingStates.length > 0 || reportingCities.length > 0) {
          // Filter users whose reporting state/city overlaps with current user's reporting state/city
          // User B is visible if:
          // - User B's reportingState contains any of current user's reportingStates OR
          // - User B's reportingCity contains any of current user's reportingCities
          const reportingFilter: any[] = [];
          
          if (reportingStates.length > 0) {
            reportingFilter.push({ reportingState: { $in: reportingStates } });
          }
          
          if (reportingCities.length > 0) {
            reportingFilter.push({ reportingCity: { $in: reportingCities } });
          }
          
          if (reportingFilter.length > 0) {
            // Combine with existing $or if present, otherwise create new
            if (searchQuery.$or) {
              // If there's already an $or (from search), we need to combine properly
              const existingOr = searchQuery.$or;
              delete searchQuery.$and;
              searchQuery.$and = [
                { $or: existingOr },
                { $or: reportingFilter }
              ];
            } else {
              searchQuery.$or = reportingFilter;
            }
          }
        } else {
          // If user has no reporting state/city, show only their own record
          searchQuery._id = currentUser._id || currentUser.id;
        }
      }
      // If super admin, no additional filtering needed - show all users
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination
    const total = await this.userModel.countDocuments(searchQuery).exec();

    // Get paginated results
    const data = await this.userModel
      .find(searchQuery, { password: 0 })
      .populate({ path: 'role', select: '_id name displayName description isActive isSuperAdmin' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
    
    // Add login status for each user
    const usersWithLoginStatus = await Promise.all(
      data.map(async (user) => {
        const userObj = user.toObject();
        const activeSession = await this.sessionsService.findActiveSessionByUser(
          (user._id as any).toString()
        );
        return {
          ...userObj,
          isLoggedIn: !!activeSession,
        };
      })
    );
    
    return {
      data: usersWithLoginStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id, { password: 0 })
      .populate({ path: 'role', select: '_id name displayName description isActive' })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as unknown as User;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
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
        const designation = String(row.designation || row.Designation || '').trim();
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
            firstname, lastname, mobilenumber, addressline1, addressline2, city, state, center, pincode, designation, ...(roleId ? { role: roleId } : {})
          }).exec();
          updated++;
        } else {
          const password = String(row.password || 'Password@123');
          const hashedPassword = await bcrypt.hash(password, 10);
          await this.userModel.create({
            email, password: hashedPassword, firstname, lastname, role: roleId, mobilenumber, addressline1, addressline2, city, state, center, pincode, designation
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
      'firstname', 'lastname', 'email', 'mobilenumber', 'addressline1', 'addressline2', 'city', 'state', 'center', 'pincode', 'designation', 'role', 'password'
    ]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    // Add a second row with hints (optional)
    XLSX.utils.sheet_add_aoa(ws, [[
      'John', 'Doe', 'john@example.com', '+11234567890', '123 Main St', '', 'New York', 'NY', 'Manhattan', '10001', 'Software Engineer', 'admin', 'Password@123'
    ]], { origin: 'A2' });
    const buffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  async logoutFromAllDevices(userId: string, actor?: { _id: string; email?: string } | null): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    await this.sessionsService.invalidateAllUserSessions(userId);
    
    // Audit log
    await this.auditLogsService.log({
      module: 'users',
      // action: 'logout_all_devices',
      action: 'update',
      entityId: userId,
      entityType: 'User',
      performedBy: (actor?._id as any) || userId,
      performedByEmail: actor?.email,
      changes: [],
      metadata: { email: user.email, action: 'logout_all_devices' },
    });
  }

  async getVisibleUserIds(currentUser: any): Promise<string[] | null> {
    // Returns array of user IDs that should be visible to current user
    // Returns null if all users should be visible (super admin)
    if (!currentUser) {
      return null;
    }

    const currentUserWithRole = await this.userModel
      .findById(currentUser._id || currentUser.id)
      .populate({ path: 'role', select: '_id name displayName description isActive isSuperAdmin' })
      .exec();
    
    const isSuperAdmin = (currentUserWithRole?.role as any)?.isSuperAdmin || false;
    
    if (isSuperAdmin) {
      return null; // Super admin can see all users
    }

    const reportingStates = currentUserWithRole?.reportingState || [];
    const reportingCities = currentUserWithRole?.reportingCity || [];
    
    if (reportingStates.length === 0 && reportingCities.length === 0) {
      // User has no reporting state/city, can only see themselves
      return [currentUser._id || currentUser.id];
    }

    // Find users whose reporting state/city overlaps with current user's
    const userFilter: any = {
      $or: []
    };

    if (reportingStates.length > 0) {
      userFilter.$or.push({ reportingState: { $in: reportingStates } });
    }

    if (reportingCities.length > 0) {
      userFilter.$or.push({ reportingCity: { $in: reportingCities } });
    }

    if (userFilter.$or.length === 0) {
      return [currentUser._id || currentUser.id];
    }

    const visibleUsers = await this.userModel.find(userFilter).select('_id').exec();
    const ids = visibleUsers.map(u => (u._id as any).toString());
    // Ensure current user can always see at least their own data when reporting scope matches no one
    if (ids.length === 0) {
      const selfId = (currentUser._id || currentUser.id)?.toString?.() || String(currentUser._id || currentUser.id);
      return selfId ? [selfId] : [];
    }
    return ids;
  }

  /**
   * Count users matching the same filters used for time logs: visibility (reporting) + state/city/center.
   * Used for "Total Employees" on the time logs dashboard (all employees in scope, not just those with attendance that day).
   */
  async getCountByFilters(
    currentUser: any,
    state?: string,
    city?: string,
    center?: string,
  ): Promise<number> {
    const baseFilter: any = {};
    const allowedUserIds = await this.getVisibleUserIds(currentUser);
    if (allowedUserIds) {
      baseFilter._id = { $in: allowedUserIds.map(id => new Types.ObjectId(id)) };
    }
    if (state && typeof state === 'string' && state.trim()) {
      baseFilter.state = { $regex: String(state).trim(), $options: 'i' };
    }
    if (city && typeof city === 'string' && city.trim()) {
      baseFilter.city = { $regex: String(city).trim(), $options: 'i' };
    }
    if (center && typeof center === 'string' && center.trim()) {
      baseFilter.center = { $regex: String(center).trim(), $options: 'i' };
    }
    return this.userModel.countDocuments(baseFilter).exec();
  }

  /**
   * Get user IDs that match visibility and optional state/city/center (for absent list etc.).
   */
  async getVisibleUserIdsByFilters(
    currentUser: any,
    state?: string,
    city?: string,
    center?: string,
  ): Promise<string[]> {
    const baseFilter: any = {};
    const allowedUserIds = await this.getVisibleUserIds(currentUser);
    if (allowedUserIds) {
      baseFilter._id = { $in: allowedUserIds.map(id => new Types.ObjectId(id)) };
    }
    if (state && typeof state === 'string' && state.trim()) {
      baseFilter.state = { $regex: String(state).trim(), $options: 'i' };
    }
    if (city && typeof city === 'string' && city.trim()) {
      baseFilter.city = { $regex: String(city).trim(), $options: 'i' };
    }
    if (center && typeof center === 'string' && center.trim()) {
      baseFilter.center = { $regex: String(center).trim(), $options: 'i' };
    }
    const users = await this.userModel.find(baseFilter).select('_id').lean().exec();
    return users.map(u => (u._id as any).toString());
  }

  /**
   * Get paginated users by IDs with optional search. Used for absent-user listing.
   */
  async getUsersByIdsPaginated(
    ids: string[],
    search?: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number }> {
    if (!ids.length) {
      return { data: [], total: 0 };
    }
    const filter: any = { _id: { $in: ids.map(id => new Types.ObjectId(id)) } };
    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { firstname: { $regex: term, $options: 'i' } },
        { lastname: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { mobilenumber: { $regex: term, $options: 'i' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('firstname lastname email mobilenumber')
        .sort({ firstname: 1, lastname: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    return { data: data as any[], total };
  }

  async generateComprehensiveReport(userId: string, startDate: string, endDate: string): Promise<Buffer> {
    // Get user information
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get attendance records
    const attendanceRecords = await this.attendanceService.getAttendanceByDateRange(userId, startDate, endDate);

    // Get leave requests
    const leaveRequests = await this.leaveManagementService.getAllLeaveRequests(1, 10000, {
      userId,
      startDate,
      endDate,
    });

    // Get tours
    const toursResult = await this.tourManagementService.findByUser(userId, 1, 10000);
    const tours = toursResult.data.filter(tour => {
      const tourDate = new Date(tour.expectedTime);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return tourDate >= start && tourDate <= end;
    });

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: User Information
    const userData = [
      ['User Information'],
      ['Field', 'Value'],
      ['First Name', user.firstname || ''],
      ['Last Name', user.lastname || ''],
      ['Email', user.email || ''],
      ['Mobile Number', user.mobilenumber || ''],
      ['Designation', user.designation || ''],
      ['Role', (user.role as any)?.displayName || (user.role as any)?.name || 'No Role'],
      ['Address Line 1', user.addressline1 || ''],
      ['Address Line 2', user.addressline2 || ''],
      ['City', user.city || ''],
      ['State', user.state || ''],
      ['Center/Taluka', user.center || ''],
      ['Pincode', user.pincode || ''],
      ['Status', user.isActive ? 'Active' : 'Inactive'],
      ['Created At', user.createdAt ? new Date(user.createdAt).toLocaleString() : ''],
      ['Updated At', user.updatedAt ? new Date(user.updatedAt).toLocaleString() : ''],
    ];
    const userWs = XLSX.utils.aoa_to_sheet(userData);
    XLSX.utils.book_append_sheet(wb, userWs, 'User Information');

    // Sheet 2: Attendance Records
    const attendanceHeaders = [
      'Date',
      'Check-In Time',
      'Check-Out Time',
      'Total Hours',
      'Status',
      'Session Number',
      'Check-In Location (Lat, Long)',
      'Check-Out Location (Lat, Long)',
    ];
    const attendanceRows = attendanceRecords.map(record => [
      record.date ? new Date(record.date).toLocaleDateString() : '',
      record.checkInTime ? new Date(record.checkInTime).toLocaleString() : '',
      record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : '',
      record.totalHours || '',
      record.status || '',
      record.sessionNumber || '',
      record.checkInLatitude && record.checkInLongitude
        ? `${record.checkInLatitude}, ${record.checkInLongitude}`
        : '',
      record.checkOutLatitude && record.checkOutLongitude
        ? `${record.checkOutLatitude}, ${record.checkOutLongitude}`
        : '',
    ]);
    const attendanceData = [attendanceHeaders, ...attendanceRows];
    const attendanceWs = XLSX.utils.aoa_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(wb, attendanceWs, 'Attendance');

    // Sheet 3: Leave Requests
    const leaveHeaders = [
      'Leave Type',
      'Start Date',
      'End Date',
      'Total Days',
      'Status',
      'Reason',
      'Is Half Day',
      'Half Day Type',
      'Approved By',
      'Approved At',
      'Rejection Reason',
      'Notes',
      'Created At',
    ];
    const leaveRows = leaveRequests.data.map(leave => [
      leave.leaveType || '',
      leave.startDate ? new Date(leave.startDate).toLocaleDateString() : '',
      leave.endDate ? new Date(leave.endDate).toLocaleDateString() : '',
      leave.totalDays || '',
      leave.status || '',
      leave.reason || '',
      leave.isHalfDay ? 'Yes' : 'No',
      leave.halfDayType || '',
      leave.approvedBy
        ? `${(leave.approvedBy as any).firstname || ''} ${(leave.approvedBy as any).lastname || ''}`
        : '',
      leave.approvedAt ? new Date(leave.approvedAt).toLocaleString() : '',
      leave.rejectionReason || '',
      leave.notes || '',
      leave.createdAt ? new Date(leave.createdAt).toLocaleString() : '',
    ]);
    const leaveData = [leaveHeaders, ...leaveRows];
    const leaveWs = XLSX.utils.aoa_to_sheet(leaveData);
    XLSX.utils.book_append_sheet(wb, leaveWs, 'Leaves');

    // Sheet 4: Tours
    const tourHeaders = [
      'Purpose',
      'Location',
      'Expected Time',
      'Actual Visit Time',
      'Status',
      'User Notes',
      'Admin Notes',
      'Completion Notes',
      'Created At',
      'Updated At',
    ];
    const tourRows = tours.map(tour => [
      tour.purpose || '',
      tour.location || '',
      tour.expectedTime ? new Date(tour.expectedTime).toLocaleString() : '',
      tour.actualVisitTime ? new Date(tour.actualVisitTime).toLocaleString() : '',
      tour.status || '',
      tour.userNotes || '',
      tour.adminNotes || '',
      tour.completionNotes || '',
      tour.createdAt ? new Date(tour.createdAt).toLocaleString() : '',
      tour.updatedAt ? new Date(tour.updatedAt).toLocaleString() : '',
    ]);
    const tourData = [tourHeaders, ...tourRows];
    const tourWs = XLSX.utils.aoa_to_sheet(tourData);
    XLSX.utils.book_append_sheet(wb, tourWs, 'Tours');

    // Generate buffer
    const buffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
} 