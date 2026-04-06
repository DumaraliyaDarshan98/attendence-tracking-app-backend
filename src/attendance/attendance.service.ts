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

    return this.attendanceModel
      .find({
        userId: new Types.ObjectId(userId),
        date: {
          $gte: start,
          $lte: end,
        },
      })
      .sort({ date: -1, sessionNumber: -1 })
      .lean()
      .exec();
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

  // Admin method to get all users' attendance with filters and pagination.
  // Summary counts (totalEmployees, presentToday, lateToday, absentToday) are calculated
  // from the full filtered dataset at DB level, not from the paginated page.
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
    currentUser?: any,
    status?: string
  ): Promise<{
    data: Attendance[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalEmployees: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
  }> {
    if (!date || typeof date !== 'string' || !date.trim()) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        totalEmployees: 0,
        presentToday: 0,
        lateToday: 0,
        absentToday: 0,
      };
    }
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
          totalEmployees: 0,
          presentToday: 0,
          lateToday: 0,
          absentToday: 0,
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
    const centerFilter = center || taluka;

    // Summary counts depend ONLY on date (and visibility). Do not use state/city/taluka/search/status for summary.
    const totalEmployees = await this.usersService.getCountByFilters(currentUser); // no location filters

    // Derived status: same logic as frontend — 10:10 AM UTC cutoff for late.
    // absent: backend status 'absent' or no checkInTime; late: checkInTime > 10:10 UTC; else present.
    const derivedStatusExpr = {
      $switch: {
        branches: [
          {
            case: { $or: [{ $eq: ['$status', 'absent'] }, { $not: '$checkInTime' }] },
            then: 'absent',
          },
          {
            case: {
              $gt: [
                { $add: [{ $multiply: [{ $hour: '$checkInTime' }, 60] }, { $minute: '$checkInTime' }] },
                610,
              ],
            },
            then: 'late',
          },
        ],
        default: 'present',
      },
    };

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Add location filters (ensure values are strings)
    const matchStage: any = {};
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
                  options: 'i',
                },
              },
            },
          ],
        },
      });
    }

    // Add derived status for table data and total
    pipeline.push({ $addFields: { derivedStatus: derivedStatusExpr } });

    // Status filter for table data only (present | late)
    const statusLower = status?.toLowerCase?.();
    const statusFilter = (statusLower === 'present' || statusLower === 'late') ? statusLower : null;

    // One status per user per day: late=3, present=2, absent=1 (for summary aggregation)
    const statusPriorityExpr = {
      $switch: {
        branches: [
          { case: { $eq: ['$derivedStatus', 'late'] }, then: 3 },
          { case: { $eq: ['$derivedStatus', 'present'] }, then: 2 },
        ],
        default: 1,
      },
    };

    // Summary: depends ONLY on date (and visibility). Run separate aggregation with no state/city/search/status.
    const summaryQuery: any = {
      date: { $gte: startDate, $lte: endDate },
      ...(query.userId && { userId: query.userId }),
    };
    const summaryPipeline = [
      { $match: summaryQuery },
      { $addFields: { derivedStatus: derivedStatusExpr } },
      { $addFields: { statusPriority: statusPriorityExpr } },
      { $group: { _id: '$userId', statusPriority: { $max: '$statusPriority' } } },
      {
        $group: {
          _id: null,
          presentToday: { $sum: { $cond: [{ $eq: ['$statusPriority', 2] }, 1, 0] } },
          lateToday: { $sum: { $cond: [{ $eq: ['$statusPriority', 3] }, 1, 0] } },
        },
      },
    ];
    const [summaryResult] = await this.attendanceModel.aggregate(summaryPipeline).exec();
    const presentToday = summaryResult?.presentToday ?? 0;
    const lateToday = summaryResult?.lateToday ?? 0;
    const absentToday = Math.max(0, totalEmployees - presentToday - lateToday);

    // When status=absent, return paginated list of absent users (users in scope with no present/late on date)
    if (statusLower === 'absent') {
      const inScopeUserIds = await this.usersService.getVisibleUserIdsByFilters(currentUser, state, city, centerFilter);
      const presentOrLateAgg = await this.attendanceModel.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate }, ...(query.userId && { userId: query.userId }) } },
        { $addFields: { derivedStatus: derivedStatusExpr } },
        { $match: { derivedStatus: { $in: ['present', 'late'] } } },
        { $group: { _id: null, userIds: { $addToSet: '$userId' } } },
      ]).exec();
      const presentOrLateIds = new Set(
        ((presentOrLateAgg[0]?.userIds as Types.ObjectId[]) || []).map((id: Types.ObjectId) => id.toString()),
      );
      const absentUserIds = inScopeUserIds.filter(id => !presentOrLateIds.has(id));
      const { data: absentUsers, total: absentTotal } = await this.usersService.getUsersByIdsPaginated(
        absentUserIds,
        search,
        skip,
        limit,
      );
      const formattedData = absentUsers.map((u: any) => ({
        _id: null,
        userId: {
          _id: u._id,
          firstname: u.firstname,
          lastname: u.lastname,
          email: u.email,
          mobilenumber: u.mobilenumber,
        },
        date: startDate,
        checkInTime: null,
        checkOutTime: null,
        isCheckedOut: false,
        status: 'absent',
        sessionNumber: 0,
        checkInLatitude: null,
        checkInLongitude: null,
        checkOutLatitude: null,
        checkOutLongitude: null,
        createdAt: null,
        updatedAt: null,
      }));
      return {
        data: formattedData as any,
        total: absentTotal,
        page,
        limit,
        totalPages: Math.ceil(absentTotal / limit),
        totalEmployees,
        presentToday,
        lateToday,
        absentToday,
      };
    }

    // Data pipeline: optional status filter, then sort, skip, limit, project
    const dataPipeline: any[] = [];
    if (statusFilter) {
      dataPipeline.push({ $match: { derivedStatus: statusFilter } });
    }
    dataPipeline.push(
      { $sort: { date: -1, sessionNumber: -1 } },
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
            mobilenumber: '$user.mobilenumber',
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
          updatedAt: 1,
        },
      },
    );

    // Total pipeline: count for current filters (state/city/search/status) — for table pagination only
    const totalPipeline: any[] = [];
    if (statusFilter) {
      totalPipeline.push({ $match: { derivedStatus: statusFilter } });
    }
    totalPipeline.push({ $count: 'count' });

    // Single $facet: filtered data + filtered total (no summary branch — summary is date-only above)
    pipeline.push({
      $facet: {
        data: dataPipeline,
        total: totalPipeline,
      },
    });

    // Execute main aggregation (table data + pagination total)
    const result = await this.attendanceModel.aggregate(pipeline).exec();

    const data = result[0]?.data || [];
    const total = result[0]?.total[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as any,
      total,
      page,
      limit,
      totalPages,
      totalEmployees,
      presentToday,
      lateToday,
      absentToday,
    };
  }

  /**
   * Dedicated API: get paginated user listing by status for a date.
   * - Present: has attendance record for the date with check-in; check-in time <= 10:10 AM IST.
   * - Late: check-in time after 10:10 AM IST.
   * - Absent: no attendance record for the date or no check-in.
   * Uses 10:10 AM IST (not UTC) for late cutoff.
   */
  async getUsersByStatusForDate(
    date: string,
    status: 'present' | 'late' | 'absent' | 'total',
    page: number,
    limit: number,
    search: string | undefined,
    state: string | undefined,
    city: string | undefined,
    center: string | undefined,
    currentUser: any,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalEmployees: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
  }> {
    if (!date || typeof date !== 'string' || !date.trim()) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        totalEmployees: 0,
        presentToday: 0,
        lateToday: 0,
        absentToday: 0,
      };
    }
    const startDate = DateUtil.parseDateToISTStartOfDay(date);
    const endDate = DateUtil.parseDateToISTEndOfDay(date);
    const skip = (page - 1) * limit;
    const centerFilter = center || undefined;

    const inScopeUserIds = await this.usersService.getVisibleUserIdsByFilters(
      currentUser,
      state,
      city,
      centerFilter,
    );

    const allowedUserIdsForQuery = inScopeUserIds.map((id) => new Types.ObjectId(id));

    const query: any = {
      date: { $gte: startDate, $lte: endDate },
      userId: { $in: allowedUserIdsForQuery },
    };

    // 10:10 AM IST = 610 minutes from IST midnight. UTC to IST: add 330 minutes and mod 1440.
    const istMinutesFromMidnight = {
      $mod: [
        {
          $add: [
            { $add: [{ $multiply: [{ $hour: '$checkInTime' }, 60] }, { $minute: '$checkInTime' }] },
            330,
          ],
        },
        1440,
      ],
    };
    const derivedStatusExpr = {
      $switch: {
        branches: [
          {
            case: { $or: [{ $eq: ['$status', 'absent'] }, { $not: '$checkInTime' }] },
            then: 'absent',
          },
          { case: { $gt: [istMinutesFromMidnight, 610] }, then: 'late' },
        ],
        default: 'present',
      },
    };

    const statusPriority = {
      $switch: {
        branches: [
          { case: { $eq: ['$derivedStatus', 'late'] }, then: 3 },
          { case: { $eq: ['$derivedStatus', 'present'] }, then: 2 },
        ],
        default: 1,
      },
    };

    const totalEmployees = inScopeUserIds.length;
    const summaryAgg = await this.attendanceModel
      .aggregate([
        { $match: query },
        { $addFields: { derivedStatus: derivedStatusExpr } },
        { $addFields: { statusPriority } },
        { $group: { _id: '$userId', statusPriority: { $max: '$statusPriority' } } },
        {
          $group: {
            _id: null,
            presentToday: { $sum: { $cond: [{ $eq: ['$statusPriority', 2] }, 1, 0] } },
            lateToday: { $sum: { $cond: [{ $eq: ['$statusPriority', 3] }, 1, 0] } },
          },
        },
      ])
      .exec();
    const presentToday = summaryAgg[0]?.presentToday ?? 0;
    const lateToday = summaryAgg[0]?.lateToday ?? 0;
    const absentToday = Math.max(0, totalEmployees - presentToday - lateToday);

    if (status === 'absent') {
      const presentOrLateAgg = await this.attendanceModel
        .aggregate([
          { $match: query },
          { $addFields: { derivedStatus: derivedStatusExpr } },
          { $match: { derivedStatus: { $in: ['present', 'late'] } } },
          { $group: { _id: null, userIds: { $addToSet: '$userId' } } },
        ])
        .exec();
      const presentOrLateIds = new Set(
        ((presentOrLateAgg[0]?.userIds as Types.ObjectId[]) || []).map((id: Types.ObjectId) =>
          id.toString(),
        ),
      );
      const absentUserIds = inScopeUserIds.filter((id) => !presentOrLateIds.has(id));
      const { data: absentUsers, total: absentTotal } =
        await this.usersService.getUsersByIdsPaginated(absentUserIds, search, skip, limit);
      const formattedData = absentUsers.map((u: any) => ({
        _id: null,
        userId: {
          _id: u._id,
          firstname: u.firstname,
          lastname: u.lastname,
          email: u.email,
          mobilenumber: u.mobilenumber,
        },
        date: startDate,
        checkInTime: null,
        checkOutTime: null,
        isCheckedOut: false,
        status: 'absent',
        sessionNumber: 0,
        checkInLatitude: null,
        checkInLongitude: null,
        checkOutLatitude: null,
        checkOutLongitude: null,
        createdAt: null,
        updatedAt: null,
      }));
      return {
        data: formattedData,
        total: absentTotal,
        page,
        limit,
        totalPages: Math.ceil(absentTotal / limit),
        totalEmployees,
        presentToday,
        lateToday,
        absentToday,
      };
    }

    if (status === 'total') {
      const { data: users, total: totalCount } = await this.usersService.getUsersByIdsPaginated(
        inScopeUserIds,
        search,
        skip,
        limit,
      );
      const formattedData = users.map((u: any) => ({
        _id: null,
        userId: {
          _id: u._id,
          firstname: u.firstname,
          lastname: u.lastname,
          email: u.email,
          mobilenumber: u.mobilenumber,
        },
        date: startDate,
        checkInTime: null,
        checkOutTime: null,
        isCheckedOut: false,
        status: '',
        sessionNumber: 0,
        checkInLatitude: null,
        checkInLongitude: null,
        checkOutLatitude: null,
        checkOutLongitude: null,
        createdAt: null,
        updatedAt: null,
      }));
      return {
        data: formattedData,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalEmployees,
        presentToday,
        lateToday,
        absentToday,
      };
    }

    const statusFilter = status === 'present' || status === 'late' ? status : null;
    if (!statusFilter) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        totalEmployees,
        presentToday,
        lateToday,
        absentToday,
      };
    }

    // Filter by derived status BEFORE $lookup so data pipeline matches summary counts
    const pipeline: any[] = [
      { $match: query },
      { $addFields: { derivedStatus: derivedStatusExpr } },
      { $match: { derivedStatus: statusFilter } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];

    const matchStage: any = {};
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
                  options: 'i',
                },
              },
            },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { date: -1, sessionNumber: -1 } },
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
            mobilenumber: '$user.mobilenumber',
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
          updatedAt: 1,
        },
      },
    );

    const countPipeline: any[] = [
      { $match: query },
      { $addFields: { derivedStatus: derivedStatusExpr } },
      { $match: { derivedStatus: statusFilter } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];
    if (Object.keys(matchStage).length > 0) {
      countPipeline.push({ $match: matchStage });
    }
    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = search.trim();
      countPipeline.push({
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
                  options: 'i',
                },
              },
            },
          ],
        },
      });
    }
    countPipeline.push({ $count: 'count' });

    const [dataResult, countResult] = await Promise.all([
      this.attendanceModel.aggregate(pipeline).exec(),
      this.attendanceModel.aggregate(countPipeline).exec(),
    ]);
    const data = dataResult || [];
    const total = countResult[0]?.count ?? 0;

    return {
      data: data as any[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalEmployees,
      presentToday,
      lateToday,
      absentToday,
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
