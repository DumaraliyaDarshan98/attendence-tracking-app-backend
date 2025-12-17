import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import { Attendance, AttendanceDocument } from '../models/attendance.model';
import { LeaveRequest, LeaveRequestDocument } from '../models/leave-request.model';
import { DashboardStatsDto, RecentActivityDto, DepartmentStatDto } from './dashboard.dto';
import { UsersService } from '../users/users.service';
import { DateUtil } from '../common/utils';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
        @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
    ) { }

    async getStats(currentUser?: any): Promise<DashboardStatsDto> {
        const today = DateUtil.getCurrentDateISTStartOfDay();
        const endOfDay = DateUtil.getCurrentDateISTEndOfDay();

        // Get visible user IDs
        let allowedUserIds: string[] | null = null;
        let userFilter: any = {};
        if (currentUser) {
            allowedUserIds = await this.usersService.getVisibleUserIds(currentUser);
            if (allowedUserIds) {
                userFilter = { userId: { $in: allowedUserIds.map(id => new Types.ObjectId(id)) } };
            }
        }

        const [totalEmployees, presentToday, onLeave, newRequests] = await Promise.all([
            // Count active employees with roles
            allowedUserIds
                ? this.userModel.countDocuments({ 
                    isActive: true, 
                    role: { $ne: null },
                    _id: { $in: allowedUserIds.map(id => new Types.ObjectId(id)) }
                })
                : this.userModel.countDocuments({ isActive: true, role: { $ne: null } }),

            // Count distinct users who checked in today
            allowedUserIds
                ? this.attendanceModel.distinct('userId', {
                    date: { $gte: today, $lte: endOfDay },
                    userId: { $in: allowedUserIds.map(id => new Types.ObjectId(id)) }
                }).then(ids => ids.length)
                : this.attendanceModel.distinct('userId', {
                    date: { $gte: today, $lte: endOfDay }
                }).then(ids => ids.length),

            // Count employees on approved leave today
            allowedUserIds
                ? this.leaveRequestModel.countDocuments({
                    startDate: { $lte: endOfDay },
                    endDate: { $gte: today },
                    status: 'approved',
                    userId: { $in: allowedUserIds.map(id => new Types.ObjectId(id)) }
                })
                : this.leaveRequestModel.countDocuments({
                    startDate: { $lte: endOfDay },
                    endDate: { $gte: today },
                    status: 'approved'
                }),

            // Count pending leave requests
            allowedUserIds
                ? this.leaveRequestModel.countDocuments({ 
                    status: 'pending',
                    userId: { $in: allowedUserIds.map(id => new Types.ObjectId(id)) }
                })
                : this.leaveRequestModel.countDocuments({ status: 'pending' }),
        ]);

        return {
            totalEmployees,
            presentToday,
            onLeave,
            newRequests,
        };
    }

    async getRecentActivity(limit: number = 10, currentUser?: any): Promise<RecentActivityDto[]> {
        // Get visible user IDs
        let allowedUserIds: string[] | null = null;
        if (currentUser) {
            allowedUserIds = await this.usersService.getVisibleUserIds(currentUser);
        }

        const attendanceFilter: any = {};
        const leaveFilter: any = {};
        if (allowedUserIds) {
            attendanceFilter.userId = { $in: allowedUserIds.map(id => new Types.ObjectId(id)) };
            leaveFilter.userId = { $in: allowedUserIds.map(id => new Types.ObjectId(id)) };
        }

        // Fetch recent attendance
        const recentAttendance = await this.attendanceModel
            .find(attendanceFilter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'firstname lastname');

        // Fetch recent leave requests
        const recentLeaves = await this.leaveRequestModel
            .find(leaveFilter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'firstname lastname');

        const activities: RecentActivityDto[] = [];

        recentAttendance.forEach((att) => {
            const user = att.userId as unknown as User;
            if (user) {
                activities.push({
                    user: `${user.firstname} ${user.lastname}`,
                    action: att.checkOutTime ? 'checked out' : 'checked in',
                    time: (att as any).updatedAt || (att as any).createdAt,
                    type: 'attendance',
                    userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstname + ' ' + user.lastname)}&background=random&size=128`
                });
            }
        });

        recentLeaves.forEach((leave) => {
            const user = leave.userId as unknown as User;
            if (user) {
                activities.push({
                    user: `${user.firstname} ${user.lastname}`,
                    action: `requested ${leave.leaveType} leave`,
                    time: (leave as any).createdAt,
                    type: 'leave',
                    userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstname + ' ' + user.lastname)}&background=random&size=128`
                });
            }
        });

        // Sort combined list and take top N
        return activities
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, limit);
    }

    async getDepartmentStats(currentUser?: any): Promise<DepartmentStatDto[]> {
        const today = DateUtil.getCurrentDateISTStartOfDay();
        const endOfDay = DateUtil.getCurrentDateISTEndOfDay();

        // Get visible user IDs
        let allowedUserIds: string[] | null = null;
        if (currentUser) {
            allowedUserIds = await this.usersService.getVisibleUserIds(currentUser);
        }

        const matchStage: any = {
            isActive: true,
            center: {
                $exists: true,
                $nin: [null, '']
            },
            role: { $ne: null }
        };

        if (allowedUserIds) {
            matchStage._id = { $in: allowedUserIds.map(id => new Types.ObjectId(id)) };
        }

        // Optimized single aggregation query to get all stats at once
        const stats = await this.userModel.aggregate([
            // Match active users with centers
            {
                $match: matchStage
            },
            // Group by center to get total count
            {
                $group: {
                    _id: '$center',
                    total: { $sum: 1 },
                    userIds: { $push: '$_id' }
                }
            },
            // Lookup attendance for today
            {
                $lookup: {
                    from: 'attendances',
                    let: { centerUsers: '$userIds' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$userId', '$$centerUsers'] },
                                        { $gte: ['$date', today] },
                                        { $lte: ['$date', endOfDay] }
                                    ]
                                }
                            }
                        },
                        { $group: { _id: '$userId' } } // Get distinct users
                    ],
                    as: 'presentUsers'
                }
            },
            // Calculate present count
            {
                $project: {
                    department: '$_id',
                    total: 1,
                    present: { $size: '$presentUsers' }
                }
            },
            // Sort by department name
            { $sort: { department: 1 } }
        ]);

        return stats.map(stat => ({
            department: stat.department || 'Unassigned',
            present: stat.present,
            total: stat.total
        }));
    }

    async getPendingLeaveRequests(limit: number = 5, currentUser?: any) {
        // Get visible user IDs
        let allowedUserIds: string[] | null = null;
        if (currentUser) {
            allowedUserIds = await this.usersService.getVisibleUserIds(currentUser);
        }

        const filter: any = { status: 'pending' };
        if (allowedUserIds) {
            filter.userId = { $in: allowedUserIds.map(id => new Types.ObjectId(id)) };
        }

        return this.leaveRequestModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'firstname lastname');
    }
}

