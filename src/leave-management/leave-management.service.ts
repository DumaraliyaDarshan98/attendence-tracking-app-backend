import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Holiday, HolidayDocument } from '../models/holiday.model';
import { LeaveRequest, LeaveRequestDocument } from '../models/leave-request.model';
import { DateUtil } from '../common/utils';

@Injectable()
export class LeaveManagementService {
  constructor(
    @InjectModel(Holiday.name) private holidayModel: Model<HolidayDocument>,
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
  ) {}

  // Holiday Management Methods
  async createHoliday(holidayData: any): Promise<Holiday> {
    const holiday = new this.holidayModel(holidayData);
    return await holiday.save();
  }

  async getAllHolidays(): Promise<Holiday[]> {
    return await this.holidayModel.find({ isActive: true }).sort({ date: 1 });
  }

  async getHolidayById(id: string): Promise<Holiday> {
    const holiday = await this.holidayModel.findById(id);
    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }
    return holiday;
  }

  async updateHoliday(id: string, updateData: any): Promise<Holiday> {
    const holiday = await this.holidayModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }
    return holiday;
  }

  async deleteHoliday(id: string): Promise<void> {
    const result = await this.holidayModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Holiday not found');
    }
  }

  async getHolidaysByYear(year: number): Promise<Holiday[]> {
    const startDate = DateUtil.getStartOfYearIST(year);
    const endDate = DateUtil.getEndOfYearIST(year);
    
    return await this.holidayModel.find({
      date: { $gte: startDate, $lte: endDate },
      isActive: true
    }).sort({ date: 1 });
  }

  // Leave Request Methods
  async createLeaveRequest(leaveData: any): Promise<LeaveRequest> {
    // Parse dates to IST
    const startDate = DateUtil.parseDateToISTStartOfDay(leaveData.startDate);
    const endDate = DateUtil.parseDateToISTStartOfDay(leaveData.endDate);
    
    if (startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    // Calculate total days (accounting for half-day leaves)
    const totalDays = this.calculateTotalDays(startDate, endDate, leaveData.isHalfDay || false);
    
    const leaveRequest = new this.leaveRequestModel({
      ...leaveData,
      totalDays,
      startDate: startDate,
      endDate: endDate
    });

    const saved = await leaveRequest.save();
    return this.transformLeaveRequestForResponse(saved);
  }

  async getUserLeaveRequests(userId: string): Promise<LeaveRequest[]> {
    const leaveRequests = await this.leaveRequestModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    return this.transformLeaveRequestsForResponse(leaveRequests);
  }

  async getAllLeaveRequests(
    page: number = 1, 
    limit: number = 10, 
    filters: {
      status?: string;
      leaveType?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
      isHalfDay?: boolean;
      approvedBy?: string;
    } = {}
  ): Promise<{ data: LeaveRequest[], total: number, page: number, limit: number, totalPages: number }> {
    const filter: any = {};

    // Apply filters
    if (filters.status) {
      filter.status = filters.status;
    }
    if (filters.leaveType) {
      filter.leaveType = filters.leaveType;
    }
    if (filters.userId) {
      filter.userId = new Types.ObjectId(filters.userId);
    }
    if (filters.isHalfDay !== undefined) {
      filter.isHalfDay = filters.isHalfDay;
    }
    if (filters.approvedBy) {
      filter.approvedBy = new Types.ObjectId(filters.approvedBy);
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      filter.$and = [];
      
      if (filters.startDate) {
        filter.$and.push({ startDate: { $gte: new Date(filters.startDate) } });
      }
      if (filters.endDate) {
        filter.$and.push({ endDate: { $lte: new Date(filters.endDate) } });
      }
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.leaveRequestModel.find(filter)
        .populate('userId', 'firstname lastname email')
        .populate('approvedBy', 'firstname lastname email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.leaveRequestModel.countDocuments(filter)
    ]);

    return {
      data: this.transformLeaveRequestsForResponse(data),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestModel.findById(id)
      .populate('userId', 'firstname lastname email')
      .populate('approvedBy', 'firstname lastname email');
    
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }
    return this.transformLeaveRequestForResponse(leaveRequest);
  }

  async updateLeaveRequest(id: string, updateData: any): Promise<LeaveRequest> {
    // Get existing leave request
    const existingLeaveRequest = await this.leaveRequestModel.findById(id);
    if (!existingLeaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // If dates or half-day status is being updated, recalculate totalDays
    if (updateData.startDate || updateData.endDate || updateData.isHalfDay !== undefined) {
      const startDate = updateData.startDate 
        ? DateUtil.parseDateToISTStartOfDay(updateData.startDate)
        : existingLeaveRequest.startDate;
      const endDate = updateData.endDate
        ? DateUtil.parseDateToISTStartOfDay(updateData.endDate)
        : existingLeaveRequest.endDate;
      
      if (startDate > endDate) {
        throw new BadRequestException('Start date cannot be after end date');
      }

      const isHalfDay = updateData.isHalfDay !== undefined 
        ? updateData.isHalfDay 
        : existingLeaveRequest.isHalfDay;

      // Recalculate total days
      updateData.totalDays = this.calculateTotalDays(startDate, endDate, isHalfDay);
      updateData.startDate = startDate;
      updateData.endDate = endDate;
    }

    const leaveRequest = await this.leaveRequestModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }
    return this.transformLeaveRequestForResponse(leaveRequest);
  }

  async updateLeaveRequestStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    approverId: string, 
    data: { notes?: string; rejectionReason?: string }
  ): Promise<LeaveRequest> {
    // First, get the existing leave request
    const existingLeaveRequest = await this.leaveRequestModel.findById(id);
    if (!existingLeaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    const updateData: any = {
      status,
      approvedBy: new Types.ObjectId(approverId),
      approvedAt: DateUtil.getCurrentDateIST()
    };

    if (status === 'approved') {
      updateData.notes = data.notes || existingLeaveRequest.notes;
    } else if (status === 'rejected') {
      if (!data.rejectionReason) {
        throw new BadRequestException('Rejection reason is required when rejecting a leave request');
      }
      updateData.rejectionReason = data.rejectionReason;
    }

    const leaveRequest = await this.leaveRequestModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    return this.transformLeaveRequestForResponse(leaveRequest);
  }

  // Legacy methods for backward compatibility
  async approveLeaveRequest(id: string, approverId: string, notes?: string): Promise<LeaveRequest> {
    return this.updateLeaveRequestStatus(id, 'approved', approverId, { notes });
  }

  async rejectLeaveRequest(id: string, approverId: string, rejectionReason: string): Promise<LeaveRequest> {
    return this.updateLeaveRequestStatus(id, 'rejected', approverId, { rejectionReason });
  }

  async cancelLeaveRequest(id: string, userId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestModel.findById(id);
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // if (leaveRequest.userId.toString() !== userId) {
    //   throw new BadRequestException('You can only cancel your own leave requests');
    // }

    if (leaveRequest.status !== 'pending') {
      throw new BadRequestException('Only pending leave requests can be cancelled');
    }

    leaveRequest.status = 'cancelled';
    const saved = await leaveRequest.save();
    return this.transformLeaveRequestForResponse(saved);
  }

  async deleteLeaveRequest(id: string): Promise<void> {
    const existing = await this.leaveRequestModel.findById(id);
    if (!existing) {
      throw new NotFoundException('Leave request not found');
    }
    await this.leaveRequestModel.findByIdAndDelete(id);
  }

  async getLeaveRequestsByDateRange(startDate: string, endDate: string): Promise<LeaveRequest[]> {
    const start = DateUtil.parseDateToISTStartOfDay(startDate);
    const end = DateUtil.parseDateToISTEndOfDay(endDate);

    const leaveRequests = await this.leaveRequestModel.find({
      startDate: { $lte: end },
      endDate: { $gte: start }
    }).populate('userId', 'firstname lastname email');
    
    return this.transformLeaveRequestsForResponse(leaveRequests);
  }

  // Helper method to calculate total days (accounting for half-day leaves)
  private calculateTotalDays(startDate: Date, endDate: Date, isHalfDay: boolean): number {
    // If it's a half-day leave and startDate equals endDate, return 0.5
    if (isHalfDay && startDate.getTime() === endDate.getTime()) {
      // Check if it's a weekend
      const dayOfWeek = startDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 0; // Weekend half-day doesn't count
      }
      return 0.5;
    }

    // Calculate working days (excluding weekends)
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        if (isHalfDay) {
          workingDays += 0.5; // Each day counts as 0.5 for half-day leaves
        } else {
          workingDays += 1; // Full day
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  }

  // Helper method to calculate working days (legacy, kept for backward compatibility)
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    return this.calculateTotalDays(startDate, endDate, false);
  }

  // Transform a single leave request to include IST-formatted dates
  private transformLeaveRequestForResponse(leaveRequest: any): any {
    if (!leaveRequest) {
      return leaveRequest;
    }

    // Convert Mongoose document to plain object if needed
    const transformed = leaveRequest.toObject ? leaveRequest.toObject() : { ...leaveRequest };
    
    // Format dates to IST strings (YYYY-MM-DD format)
    // Dates are stored as Date objects in MongoDB, convert them to IST date strings
    if (transformed.startDate) {
      const startDate = transformed.startDate instanceof Date 
        ? transformed.startDate 
        : new Date(transformed.startDate);
      if (!isNaN(startDate.getTime())) {
        transformed.startDate = DateUtil.formatDateToISTString(startDate);
      }
    }
    if (transformed.endDate) {
      const endDate = transformed.endDate instanceof Date 
        ? transformed.endDate 
        : new Date(transformed.endDate);
      if (!isNaN(endDate.getTime())) {
        transformed.endDate = DateUtil.formatDateToISTString(endDate);
      }
    }
    if (transformed.approvedAt) {
      const approvedAt = transformed.approvedAt instanceof Date 
        ? transformed.approvedAt 
        : new Date(transformed.approvedAt);
      if (!isNaN(approvedAt.getTime())) {
        transformed.approvedAt = DateUtil.formatDateToISTString(approvedAt);
      }
    }

    return transformed;
  }

  // Transform an array of leave requests to include IST-formatted dates
  private transformLeaveRequestsForResponse(leaveRequests: any[]): any[] {
    if (!Array.isArray(leaveRequests)) {
      return leaveRequests;
    }

    return leaveRequests.map(leaveRequest => this.transformLeaveRequestForResponse(leaveRequest));
  }

  // Get user's leave balance (you can extend this based on your leave policy)
  async getUserLeaveBalance(userId: string): Promise<any> {
    const currentYear = DateUtil.getCurrentYearIST();
    const startOfYear = DateUtil.getStartOfYearIST(currentYear);
    const endOfYear = DateUtil.getEndOfYearIST(currentYear);

    const approvedLeaves = await this.leaveRequestModel.find({
      userId: new Types.ObjectId(userId),
      status: 'approved',
      startDate: { $gte: startOfYear },
      endDate: { $lte: endOfYear }
    });

    const totalDaysTaken = approvedLeaves.reduce((sum, leave) => sum + leave.totalDays, 0);

    // Default leave allocation (you can make this configurable)
    const leaveAllocation = {
      annual: 21,
      casual: 7,
      sick: 10,
      other: 5
    };

    return {
      allocation: leaveAllocation,
      used: totalDaysTaken,
      remaining: Object.values(leaveAllocation).reduce((a, b) => a + b, 0) - totalDaysTaken
    };
  }
}
