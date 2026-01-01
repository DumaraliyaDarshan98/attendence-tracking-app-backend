import { Injectable, ConflictException, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from '../models/attendance.model';
import { UsersService } from '../users/users.service';
import { DateUtil } from '../common/utils';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) { }

  async checkIn(userId: string, location?: { latitude?: number; longitude?: number }): Promise<Attendance> {
    const today = DateUtil.getCurrentDateISTStartOfDay();

    try {
      // Check if user has an open session (checked in but not checked out) for today
      const openSession = await this.attendanceModel.findOne({
        userId,
        date: {
          $gte: today,
          $lt: DateUtil.getCurrentDateISTEndOfDay(),
        },
        isCheckedOut: false,
      });

      if (openSession) {
        throw new ConflictException('You need to check out from your current session before checking in again');
      }

      // Find the next session number for today
      const nextSessionNumber = await this.getNextSessionNumber(userId, today);

      const attendance = new this.attendanceModel({
        userId,
        date: today, // Use start of day for date matching
        checkInTime: DateUtil.getCurrentDateIST(),
        status: 'present',
        sessionNumber: nextSessionNumber,
        checkInLatitude: location?.latitude,
        checkInLongitude: location?.longitude,
      });

      return await attendance.save();
    } catch (error) {
      // Handle duplicate key errors specifically
      if (error.code === 11000) {
        // If it's a duplicate key error, try to find the next available session number
        const nextSessionNumber = await this.getNextSessionNumber(userId, today);

        const attendance = new this.attendanceModel({
          userId,
          date: today, // Use start of day for date matching
          checkInTime: DateUtil.getCurrentDateIST(),
          status: 'present',
          sessionNumber: nextSessionNumber,
          checkInLatitude: location?.latitude,
          checkInLongitude: location?.longitude,
        });

        return await attendance.save();
      }
      throw error;
    }
  }

  private async getNextSessionNumber(userId: string, date: Date): Promise<number> {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const todaySessions = await this.attendanceModel.find({
      userId,
      date: {
        $gte: date,
        $lte: endOfDay,
      },
    }).sort({ sessionNumber: -1 }).limit(1);

    return todaySessions.length > 0 ? todaySessions[0].sessionNumber + 1 : 1;
  }

  async startNewSession(userId: string, location?: { latitude?: number; longitude?: number }): Promise<Attendance> {
    const today = DateUtil.getCurrentDateISTStartOfDay();

    // Check if user has an open session for today
    const openSession = await this.attendanceModel.findOne({
      userId,
      date: {
        $gte: today,
        $lt: DateUtil.getCurrentDateISTEndOfDay(),
      },
      isCheckedOut: false,
    });

    if (openSession) {
      throw new ConflictException('You need to check out from your current session before starting a new one');
    }

    // Get next session number
    const nextSessionNumber = await this.getNextSessionNumber(userId, today);

    const attendance = new this.attendanceModel({
      userId,
      date: today, // Use start of day for date matching
      checkInTime: DateUtil.getCurrentDateIST(),
      status: 'present',
      sessionNumber: nextSessionNumber,
      checkInLatitude: location?.latitude,
      checkInLongitude: location?.longitude,
    });

    return await attendance.save();
  }

  async checkOut(userId: string, location?: { latitude?: number; longitude?: number }): Promise<Attendance> {
    const today = DateUtil.getCurrentDateISTStartOfDay();

    // Find the most recent open session for today
    const attendance = await this.attendanceModel.findOne({
      userId,
      date: {
        $gte: today,
        $lt: DateUtil.getCurrentDateISTEndOfDay(),
      },
      isCheckedOut: false,
    }).sort({ sessionNumber: -1 });

    if (!attendance) {
      throw new NotFoundException('No active check-in session found for today');
    }

    const checkOutTime = DateUtil.getCurrentDateIST();
    const totalHours = (checkOutTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);

    attendance.checkOutTime = checkOutTime;
    attendance.isCheckedOut = true;
    attendance.totalHours = Math.round(totalHours * 100) / 100;
    attendance.checkOutLatitude = location?.latitude;
    attendance.checkOutLongitude = location?.longitude;

    return attendance.save();
  }

  async getAttendanceByDate(userId: string, date: string): Promise<Attendance[]> {
    const startDate = DateUtil.parseDateToISTStartOfDay(date);
    const endDate = DateUtil.parseDateToISTEndOfDay(date);

    return this.attendanceModel.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: -1 }).exec();
  }

  async getAttendanceByDateRange(userId: string, startDate: string, endDate: string): Promise<Attendance[]> {
    const start = DateUtil.parseDateToISTStartOfDay(startDate);
    const end = DateUtil.parseDateToISTEndOfDay(endDate);

    return this.attendanceModel.find({
      userId,
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ date: -1 }).exec();
  }

  async getTodayAttendance(userId: string): Promise<Attendance[]> {
    const today = DateUtil.getCurrentDateISTStartOfDay();
    const endOfDay = DateUtil.getCurrentDateISTEndOfDay();

    return this.attendanceModel.find({
      userId,
      date: {
        $gte: today,
        $lte: endOfDay,
      },
    }).sort({ sessionNumber: -1 }).exec();
  }

  async getAllUserAttendance(userId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ userId }).sort({ date: -1 }).exec();
  }

  // Admin method to get all users' attendance with filters and pagination
  async getAllUsersAttendance(
    date: string,
    userId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    state?: string,
    city?: string,
    center?: string,
    taluka?: string,
    currentUser?: any
  ): Promise<{ data: Attendance[]; total: number; page: number; limit: number; totalPages: number }> {
    const startDate = DateUtil.parseDateToISTStartOfDay(date);
    const endDate = DateUtil.parseDateToISTEndOfDay(date);

    // Build query
    const query: any = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    // Apply reporting state/city filtering
    let allowedUserIds: string[] | null = null;
    if (currentUser) {
      allowedUserIds = await this.usersService.getVisibleUserIds(currentUser);
    }

    // Add user filter if provided
    if (userId) {
      // If we have allowed user IDs, make sure the requested user is in the list
      if (allowedUserIds && !allowedUserIds.includes(userId)) {
        // User doesn't have access to this user's data
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
      // User has access - filter by this specific user
      query.userId = new Types.ObjectId(userId);
    } else if (allowedUserIds) {
      // Filter by allowed user IDs
      query.userId = { $in: allowedUserIds.map(id => new Types.ObjectId(id)) };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $match: query
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // Add location filters (ensure values are strings)
    const matchStage: any = {};
    const centerFilter = center || taluka;
    if (state && typeof state === 'string' && state.trim()) {
      matchStage['user.state'] = { $regex: String(state).trim(), $options: 'i' };
    }
    if (city && typeof city === 'string' && city.trim()) {
      matchStage['user.city'] = { $regex: String(city).trim(), $options: 'i' };
    }
    if (centerFilter && typeof centerFilter === 'string' && centerFilter.trim()) {
      matchStage['user.center'] = { $regex: String(centerFilter).trim(), $options: 'i' };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Add search filter if provided (after lookup to search in user fields)
    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = search.trim();
      pipeline.push({
        $match: {
          $or: [
            { 'user.firstname': { $regex: searchTerm, $options: 'i' } },
            { 'user.lastname': { $regex: searchTerm, $options: 'i' } },
            { 'user.email': { $regex: searchTerm, $options: 'i' } },
            { 'user.mobilenumber': { $regex: searchTerm, $options: 'i' } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ['$user.firstname', ' ', '$user.lastname'] },
                  regex: searchTerm,
                  options: 'i'
                }
              }
            }
          ]
        }
      });
    }

    // Add sorting and pagination
    pipeline.push(
      {
        $sort: { date: -1, sessionNumber: -1 }
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                userId: {
                  _id: '$user._id',
                  firstname: '$user.firstname',
                  lastname: '$user.lastname',
                  email: '$user.email',
                  mobilenumber: '$user.mobilenumber'
                },
                date: 1,
                checkInTime: 1,
                checkOutTime: 1,
                isCheckedOut: 1,
                totalHours: 1,
                status: 1,
                sessionNumber: 1,
                checkInLatitude: 1,
                checkInLongitude: 1,
                checkOutLatitude: 1,
                checkOutLongitude: 1,
                createdAt: 1,
                updatedAt: 1
              }
            }
          ],
          total: [{ $count: 'count' }]
        }
      }
    );

    // Execute aggregation
    const result = await this.attendanceModel.aggregate(pipeline).exec();

    const data = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as any,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Automatically check out all open sessions at midnight (12:00 AM IST)
   * This method is called by a scheduled task at midnight IST
   * It checks out ALL open sessions regardless of when they were checked in
   * 
   * Example: If user checks in at 8 PM IST, they will be auto-checked out at 12:00 AM IST (midnight)
   */
  async autoCheckoutOpenSessions(): Promise<{ checkedOut: number; errors: number }> {
    this.logger.log('Starting midnight auto-checkout for all open sessions...');

    // Get current UTC time
    const nowUTC = new Date();

    // Calculate IST offset (IST is UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;

    // Get current time in IST
    const nowIST = new Date(nowUTC.getTime() + istOffset);

    // Set checkout time to midnight IST (00:00:00 of current day in IST)
    const midnightIST = new Date(nowIST);
    midnightIST.setHours(0, 0, 0, 0);
    midnightIST.setMinutes(0, 0, 0);

    // Convert midnight IST back to UTC for storage (checkInTime is stored as UTC)
    const midnightUTC = new Date(midnightIST.getTime() - istOffset);

    // Find ALL open sessions (regardless of date)
    const openSessions = await this.attendanceModel.find({
      isCheckedOut: false,
    });

    let checkedOut = 0;
    let errors = 0;

    // Check out each open session
    for (const session of openSessions) {
      try {
        // Calculate total hours from check-in to midnight IST
        const totalHours = (midnightUTC.getTime() - session.checkInTime.getTime()) / (1000 * 60 * 60);

        // Ensure totalHours is not negative (safety check)
        if (totalHours < 0) {
          this.logger.warn(`Session ${session._id} has negative hours, skipping`);
          errors++;
          continue;
        }

        session.checkOutTime = midnightUTC;
        session.isCheckedOut = true;
        session.totalHours = Math.round(totalHours * 100) / 100;
        // Keep existing check-in location, no checkout location for auto-checkout

        await session.save();
        checkedOut++;
        this.logger.debug(`Auto-checked out session ${session._id} at midnight for user ${session.userId}`);
      } catch (error) {
        this.logger.error(`Error auto-checking out session ${session._id}:`, error);
        errors++;
      }
    }

    this.logger.log(`[Midnight Auto-Checkout] Completed: ${checkedOut} sessions checked out, ${errors} errors`);
    return { checkedOut, errors };
  }

  /**
   * Automatically check out sessions that have been open for 12 hours or more
   * This method is called by a scheduled task that runs every hour
   * It checks out sessions where check-in time was 12+ hours ago
   * 
   * Example: If user checks in at 5 AM IST, they will be auto-checked out at 5 PM IST (12 hours later)
   */
  async autoCheckoutAfter12Hours(): Promise<{ checkedOut: number; errors: number }> {
    this.logger.debug('Starting 12-hour auto-checkout for open sessions...');

    // Get current UTC time (JavaScript Date objects are always in UTC internally)
    const nowUTC = new Date();

    // Calculate 12 hours ago in UTC (12 hours = 12 * 60 * 60 * 1000 milliseconds)
    const twelveHoursAgoUTC = new Date(nowUTC.getTime() - (12 * 60 * 60 * 1000));

    // Find all open sessions where check-in was 12+ hours ago
    // checkInTime is stored as UTC Date in MongoDB
    const openSessions = await this.attendanceModel.find({
      isCheckedOut: false,
      checkInTime: {
        $lte: twelveHoursAgoUTC, // Check-in was 12+ hours ago
      },
    });

    let checkedOut = 0;
    let errors = 0;

    // Check out each session that has been open for 12+ hours
    for (const session of openSessions) {
      try {
        // Calculate checkout time: exactly 12 hours after check-in
        const checkoutTimeUTC = new Date(session.checkInTime.getTime() + (12 * 60 * 60 * 1000));

        // Ensure checkout time doesn't exceed current time (safety check)
        const actualCheckoutTime = checkoutTimeUTC.getTime() > nowUTC.getTime()
          ? nowUTC
          : checkoutTimeUTC;

        // Calculate total hours (should be exactly 12 hours, or less if current time is used)
        const totalHours = (actualCheckoutTime.getTime() - session.checkInTime.getTime()) / (1000 * 60 * 60);

        // Ensure totalHours is not negative (safety check)
        if (totalHours < 0) {
          this.logger.warn(`Session ${session._id} has negative hours, skipping`);
          errors++;
          continue;
        }

        session.checkOutTime = actualCheckoutTime;
        session.isCheckedOut = true;
        session.totalHours = Math.round(totalHours * 100) / 100;
        // Keep existing check-in location, no checkout location for auto-checkout

        await session.save();
        checkedOut++;
        this.logger.debug(`Auto-checked out session ${session._id} after 12 hours for user ${session.userId}`);
      } catch (error) {
        this.logger.error(`Error auto-checking out session ${session._id}:`, error);
        errors++;
      }
    }

    if (checkedOut > 0 || errors > 0) {
      this.logger.log(`[12-Hour Auto-Checkout] Completed: ${checkedOut} sessions checked out, ${errors} errors`);
    }

    return { checkedOut, errors };
  }

  // Admin methods for creating, updating, and deleting attendance records
  async createAttendanceRecord(createData: {
    userId: string;
    date: string;
    checkInTime: string;
    checkOutTime?: string;
    status: 'present' | 'absent' | 'late' | 'half-day';
    notes?: string;
    sessionNumber?: number;
    checkInLatitude?: number;
    checkInLongitude?: number;
    checkOutLatitude?: number;
    checkOutLongitude?: number;
  }): Promise<Attendance> {
    const date = DateUtil.parseDateToISTStartOfDay(createData.date);
    // Use parseDateTimeToIST to properly handle IST timezone when parsing time strings
    // This ensures that "11:55" is interpreted as 11:55 IST, not UTC
    const checkInTime = DateUtil.parseDateTimeToIST(`${createData.date}T${createData.checkInTime}`);
    const checkOutTime = createData.checkOutTime ? DateUtil.parseDateTimeToIST(`${createData.date}T${createData.checkOutTime}`) : undefined;

    // Calculate total hours if checkout time is provided
    let totalHours: number | undefined;
    if (checkOutTime) {
      totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      totalHours = Math.round(totalHours * 100) / 100;
    }

    const attendance = new this.attendanceModel({
      userId: new Types.ObjectId(createData.userId),
      date: date,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      isCheckedOut: !!checkOutTime,
      totalHours: totalHours,
      status: createData.status,
      notes: createData.notes,
      sessionNumber: createData.sessionNumber || 1,
      checkInLatitude: createData.checkInLatitude,
      checkInLongitude: createData.checkInLongitude,
      checkOutLatitude: createData.checkOutLatitude,
      checkOutLongitude: createData.checkOutLongitude,
    });

    return await attendance.save();
  }

  async updateAttendanceRecord(id: string, updateData: {
    userId?: string;
    date?: string;
    checkInTime?: string;
    checkOutTime?: string;
    status?: 'present' | 'absent' | 'late' | 'half-day';
    notes?: string;
    sessionNumber?: number;
    checkInLatitude?: number;
    checkInLongitude?: number;
    checkOutLatitude?: number;
    checkOutLongitude?: number;
  }): Promise<Attendance> {
    const attendance = await this.attendanceModel.findById(id);
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    // Update fields
    if (updateData.userId) attendance.userId = new Types.ObjectId(updateData.userId);
    if (updateData.date) attendance.date = DateUtil.parseDateToISTStartOfDay(updateData.date);
    if (updateData.checkInTime) {
      // Use formatDateToISTString to get the date in IST format (not UTC)
      // This ensures we use the correct date when combining with time
      const date = updateData.date || DateUtil.formatDateToISTString(attendance.date);
      // Use parseDateTimeToIST to properly handle IST timezone when parsing time strings
      // This ensures that "11:55" is interpreted as 11:55 IST, not UTC
      attendance.checkInTime = DateUtil.parseDateTimeToIST(`${date}T${updateData.checkInTime}`);
    }
    if (updateData.checkOutTime) {
      // Use formatDateToISTString to get the date in IST format (not UTC)
      // This ensures we use the correct date when combining with time
      const date = updateData.date || DateUtil.formatDateToISTString(attendance.date);
      // Use parseDateTimeToIST to properly handle IST timezone when parsing time strings
      // This ensures that "11:56" is interpreted as 11:56 IST, not UTC
      attendance.checkOutTime = DateUtil.parseDateTimeToIST(`${date}T${updateData.checkOutTime}`);
    }
    if (updateData.status) attendance.status = updateData.status;
    if (updateData.notes !== undefined) attendance.notes = updateData.notes;
    if (updateData.sessionNumber) attendance.sessionNumber = updateData.sessionNumber;
    if (updateData.checkInLatitude !== undefined) attendance.checkInLatitude = updateData.checkInLatitude;
    if (updateData.checkInLongitude !== undefined) attendance.checkInLongitude = updateData.checkInLongitude;
    if (updateData.checkOutLatitude !== undefined) attendance.checkOutLatitude = updateData.checkOutLatitude;
    if (updateData.checkOutLongitude !== undefined) attendance.checkOutLongitude = updateData.checkOutLongitude;

    // Recalculate total hours if times are updated
    if (attendance.checkInTime && attendance.checkOutTime) {
      attendance.totalHours = (attendance.checkOutTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);
      attendance.totalHours = Math.round(attendance.totalHours * 100) / 100;
      attendance.isCheckedOut = true;
    } else {
      attendance.isCheckedOut = false;
      attendance.totalHours = undefined;
    }

    return await attendance.save();
  }

  async deleteAttendanceRecord(id: string): Promise<void> {
    const attendance = await this.attendanceModel.findById(id);
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    await this.attendanceModel.findByIdAndDelete(id);
  }

  // Helper method to check if user has access to a specific user's attendance
  async checkUserAccess(currentUser: any, targetUserId: string): Promise<boolean> {
    const allowedUserIds = await this.usersService.getVisibleUserIds(currentUser);
    if (!allowedUserIds) {
      // Super admin or no restrictions
      return true;
    }
    return allowedUserIds.includes(targetUserId);
  }

  // Helper method to get attendance record by ID
  async getAttendanceById(id: string): Promise<Attendance | null> {
    return this.attendanceModel.findById(id);
  }
}
