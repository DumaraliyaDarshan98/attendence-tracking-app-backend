import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from '../models/attendance.model';
import { DateUtil } from '../common/utils';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

  async checkIn(userId: string, location?: { latitude?: number; longitude?: number }): Promise<Attendance> {
    const today = DateUtil.getCurrentDateISTStartOfDay();

    try {
      // Check if user has an open session (checked in but not checked out) for today
      const openSession = await this.attendanceModel.findOne({
        userId,
        date: today,
        isCheckedOut: false,
      });

      if (openSession) {
        throw new ConflictException('You need to check out from your current session before checking in again');
      }

      // Find the next session number for today
      const nextSessionNumber = await this.getNextSessionNumber(userId, today);

      const attendance = new this.attendanceModel({
        userId,
        date: today,
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
          date: today,
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
    const todaySessions = await this.attendanceModel.find({
      userId,
      date: date,
    }).sort({ sessionNumber: -1 }).limit(1);

    return todaySessions.length > 0 ? todaySessions[0].sessionNumber + 1 : 1;
  }

  async startNewSession(userId: string, location?: { latitude?: number; longitude?: number }): Promise<Attendance> {
    const today = DateUtil.getCurrentDateISTStartOfDay();

    // Check if user has an open session for today
    const openSession = await this.attendanceModel.findOne({
      userId,
      date: today,
      isCheckedOut: false,
    });

    if (openSession) {
      throw new ConflictException('You need to check out from your current session before starting a new one');
    }

    // Get next session number
    const nextSessionNumber = await this.getNextSessionNumber(userId, today);

    const attendance = new this.attendanceModel({
      userId,
      date: today,
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
      date: today,
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

    return this.attendanceModel.find({
      userId,
      date: today,
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
    limit: number = 10
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

    // Execute queries
    const [data, total] = await Promise.all([
      this.attendanceModel
        .find(query)
        .populate('userId', 'firstname lastname email')
        .sort({ date: -1, sessionNumber: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.attendanceModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
