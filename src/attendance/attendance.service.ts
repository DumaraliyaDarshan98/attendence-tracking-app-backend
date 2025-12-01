import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from '../models/attendance.model';
import { DateUtil } from '../common/utils';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

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
    search?: string
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

    // Add user filter if provided
    if (userId) {
      query.userId = userId;
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

    // Add search filter if provided (after lookup to search in user fields)
    if (search && search.trim()) {
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
   * Automatically check out all open sessions at end of day (11:59:59 PM IST)
   * This method is called by a scheduled task at midnight IST
   * It checks out all sessions that were checked in but not checked out for the previous day
   */
  async autoCheckoutOpenSessions(): Promise<{ checkedOut: number; errors: number }> {
    // Get previous day's date range in IST (the day that just ended at midnight)
    // When this runs at midnight IST, we need to checkout sessions from the day that just ended
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istNow = new Date(now.getTime() + istOffset);
    
    // Get previous day (the day that just ended)
    const previousDayStart = new Date(istNow);
    previousDayStart.setDate(previousDayStart.getDate() - 1);
    previousDayStart.setHours(0, 0, 0, 0);
    
    const previousDayEnd = new Date(previousDayStart);
    previousDayEnd.setHours(23, 59, 59, 999);
    
    // Convert to UTC for MongoDB query (date field is stored as start of day in UTC)
    const previousDayStartUTC = new Date(previousDayStart.getTime() - istOffset);
    const previousDayEndUTC = new Date(previousDayEnd.getTime() - istOffset);

    // Find all open sessions from the previous day
    // The date field is stored as start of day, so we query by date range
    const openSessions = await this.attendanceModel.find({
      isCheckedOut: false,
      date: {
        $gte: previousDayStartUTC,
        $lt: new Date(previousDayStartUTC.getTime() + 24 * 60 * 60 * 1000), // Next day start
      },
    });

    let checkedOut = 0;
    let errors = 0;

    // Set checkout time to end of previous day (11:59:59 PM IST)
    // Convert to UTC for storage (same format as checkInTime)
    const checkoutTimeIST = new Date(previousDayEnd);
    const checkoutTimeUTC = new Date(checkoutTimeIST.getTime() - istOffset);

    // Check out each open session
    for (const session of openSessions) {
      try {
        // Calculate total hours from check-in to 11:59:59 PM IST of the previous day
        const totalHours = (checkoutTimeUTC.getTime() - session.checkInTime.getTime()) / (1000 * 60 * 60);
        
        // Ensure totalHours is not negative (safety check)
        if (totalHours < 0) {
          console.warn(`Session ${session._id} has negative hours, skipping`);
          errors++;
          continue;
        }
        
        session.checkOutTime = checkoutTimeUTC;
        session.isCheckedOut = true;
        session.totalHours = Math.round(totalHours * 100) / 100;
        // Keep existing check-in location, no checkout location for auto-checkout
        
        await session.save();
        checkedOut++;
      } catch (error) {
        console.error(`Error auto-checking out session ${session._id}:`, error);
        errors++;
      }
    }

    console.log(`[Auto-Checkout] Completed at ${new Date().toISOString()}: ${checkedOut} sessions checked out, ${errors} errors`);
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
    const checkInTime = new Date(`${createData.date}T${createData.checkInTime}`);
    const checkOutTime = createData.checkOutTime ? new Date(`${createData.date}T${createData.checkOutTime}`) : undefined;
    
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
      const date = updateData.date || attendance.date.toISOString().split('T')[0];
      attendance.checkInTime = new Date(`${date}T${updateData.checkInTime}`);
    }
    if (updateData.checkOutTime) {
      const date = updateData.date || attendance.date.toISOString().split('T')[0];
      attendance.checkOutTime = new Date(`${date}T${updateData.checkOutTime}`);
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
}
