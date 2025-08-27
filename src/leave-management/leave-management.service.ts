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
    // Calculate total days
    const startDate = DateUtil.parseDateToISTStartOfDay(leaveData.startDate);
    const endDate = DateUtil.parseDateToISTStartOfDay(leaveData.endDate);
    
    if (startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    // Calculate working days (excluding weekends and holidays)
    const totalDays = this.calculateWorkingDays(startDate, endDate);
    
    const leaveRequest = new this.leaveRequestModel({
      ...leaveData,
      totalDays,
      startDate: startDate,
      endDate: endDate
    });

    return await leaveRequest.save();
  }

  async getUserLeaveRequests(userId: string): Promise<LeaveRequest[]> {
    return await this.leaveRequestModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
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
      data,
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
    return leaveRequest;
  }

  async updateLeaveRequest(id: string, updateData: any): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }
    return leaveRequest;
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

    return leaveRequest;
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
    return await leaveRequest.save();
  }

  async getLeaveRequestsByDateRange(startDate: string, endDate: string): Promise<LeaveRequest[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return await this.leaveRequestModel.find({
      startDate: { $lte: end },
      endDate: { $gte: start }
    }).populate('userId', 'firstname lastname email');
  }

  // Helper method to calculate working days
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
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
