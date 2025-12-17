import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tour, TourDocument } from '../models/tour.model';
import { CreateTourDto, UpdateTourDto, UpdateTourStatusDto } from './dto';
import { UsersService } from '../users/users.service';
import { DateUtil } from '../common/utils';

@Injectable()
export class TourManagementService {
  constructor(
    @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) { }

  async create(createTourDto: CreateTourDto, createdBy: string): Promise<Tour> {
    const tour = new this.tourModel({
      ...createTourDto,
      createdBy: new Types.ObjectId(createdBy),
      assignedTo: new Types.ObjectId(createTourDto.assignedTo),
      expectedTime: DateUtil.parseDateTimeToIST(createTourDto.expectedTime),
      status: 'assigned',
      statusHistory: [{
        status: 'assigned',
        changedBy: createdBy,
        changedByName: 'System', // Will be updated with actual user name
        notes: 'Tour assigned to user',
        changedAt: DateUtil.getCurrentDateIST()
      }]
    });

    return await tour.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters: {
      status?: string;
      assignedTo?: string;
      createdBy?: string;
      startDate?: string;
      endDate?: string;
    } = {},
    currentUser?: any
  ): Promise<{ data: Tour[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery: any = { isActive: true };

    if (filters.status) {
      filterQuery.status = filters.status;
    }

    // Apply reporting state/city filtering
    let allowedUserIds: string[] | null = null;
    if (currentUser) {
      allowedUserIds = await this.usersService.getVisibleUserIds(currentUser);
    }

    // Apply user filtering based on reporting state/city
    if (allowedUserIds) {
      // User can see tours assigned to OR created by visible users
      const allowedObjectIds = allowedUserIds.map(id => new Types.ObjectId(id));
      
      if (filters.assignedTo) {
        // If specific assignedTo is requested, check if user has access
        if (!allowedUserIds.includes(filters.assignedTo)) {
          return {
            data: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          };
        }
        // User has access - show tours assigned to this user OR created by any visible user
        filterQuery.$or = [
          { assignedTo: new Types.ObjectId(filters.assignedTo) },
          { createdBy: { $in: allowedObjectIds } }
        ];
      } else if (filters.createdBy) {
        // If specific createdBy is requested, check if user has access
        if (!allowedUserIds.includes(filters.createdBy)) {
          return {
            data: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          };
        }
        // User has access - show tours created by this user OR assigned to any visible user
        filterQuery.$or = [
          { createdBy: new Types.ObjectId(filters.createdBy) },
          { assignedTo: { $in: allowedObjectIds } }
        ];
      } else {
        // No specific user filter - show tours assigned to OR created by visible users
        filterQuery.$or = [
          { assignedTo: { $in: allowedObjectIds } },
          { createdBy: { $in: allowedObjectIds } }
        ];
      }
    } else {
      // Super admin or no restrictions - apply filters normally
      if (filters.assignedTo) {
        filterQuery.assignedTo = new Types.ObjectId(filters.assignedTo);
      }
      if (filters.createdBy) {
        filterQuery.createdBy = new Types.ObjectId(filters.createdBy);
      }
    }

    if (filters.startDate || filters.endDate) {
      filterQuery.expectedTime = {};
      if (filters.startDate) {
        filterQuery.expectedTime.$gte = DateUtil.parseDateToISTStartOfDay(filters.startDate);
      }
      if (filters.endDate) {
        filterQuery.expectedTime.$lte = DateUtil.parseDateToISTEndOfDay(filters.endDate);
      }
    }

    const [tours, total] = await Promise.all([
      this.tourModel
        .find(filterQuery)
        .populate('assignedTo', 'firstname lastname email')
        .populate('createdBy', 'firstname lastname email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.tourModel.countDocuments(filterQuery)
    ]);

    return {
      data: tours,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<Tour> {
    const tour = await this.tourModel
      .findById(id)
      .populate('assignedTo', 'firstname lastname email')
      .populate('createdBy', 'firstname lastname email')
      .exec();

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    return tour;
  }

  async findByUser(userId: string, page: number = 1, limit: number = 10): Promise<{ data: Tour[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const filterQuery = {
      assignedTo: new Types.ObjectId(userId),
      isActive: true
    };

    const [tours, total] = await Promise.all([
      this.tourModel
        .find(filterQuery)
        .populate('assignedTo', 'firstname lastname email')
        .populate('createdBy', 'firstname lastname email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.tourModel.countDocuments(filterQuery)
    ]);

    return {
      data: tours,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(id: string, updateTourDto: any): Promise<Tour> {
    const tour = await this.tourModel.findById(id);

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    // Update fields
    if (updateTourDto.assignedTo) {
      updateTourDto.assignedTo = new Types.ObjectId(updateTourDto.assignedTo);
    }

    if (updateTourDto.expectedTime) {
      updateTourDto.expectedTime = DateUtil.parseDateTimeToIST(updateTourDto.expectedTime);
    }

    const updatedTour: any = await this.tourModel
      .findByIdAndUpdate(id, updateTourDto, { new: true })
      .populate('assignedTo', 'firstname lastname email')
      .populate('createdBy', 'firstname lastname email')
      .exec();

    return updatedTour;
  }

  async updateStatus(id: string, updateStatusDto: UpdateTourStatusDto, changedBy: string, changedByName: string): Promise<Tour> {
    const tour = await this.tourModel.findById(id);

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    // Validate status transition
    this.validateStatusTransition(tour.status, updateStatusDto.status);

    // Prepare update data
    const updateData: any = {
      status: updateStatusDto.status
    };

    // Add status history entry
    const statusHistoryEntry = {
      status: updateStatusDto.status,
      changedBy,
      changedByName,
      notes: updateStatusDto.notes || '',
      changedAt: DateUtil.getCurrentDateIST()
    };

    // Handle specific status updates
    if (updateStatusDto.status === 'in-progress' && updateStatusDto.actualVisitTime) {
      updateData.actualVisitTime = DateUtil.parseDateToISTStartOfDay(updateStatusDto.actualVisitTime);
    }

    if (updateStatusDto.status === 'completed' && updateStatusDto.completionNotes) {
      updateData.completionNotes = updateStatusDto.completionNotes;
    }

    // Update tour with new status and history
    const updatedTour: any = await this.tourModel
      .findByIdAndUpdate(
        id,
        {
          ...updateData,
          $push: { statusHistory: statusHistoryEntry }
        },
        { new: true }
      )
      .populate('assignedTo', 'firstname lastname email')
      .populate('createdBy', 'firstname lastname email')
      .exec();

    return updatedTour;
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['assigned', 'cancelled'],
      'assigned': ['in-progress', 'cancelled', 'approved', 'rejected'],
      'in-progress': ['completed', 'cancelled'],
      'completed': ['approved', 'rejected'],
      'approved': ['in-progress'], // Can restart if needed
      'rejected': ['assigned'], // Can reassign
      'cancelled': ['assigned'] // Can reassign cancelled tours
    };

    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'`
      );
    }
  }

  async remove(id: string): Promise<void> {
    const tour = await this.tourModel.findById(id);

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    // Soft delete - mark as inactive
    await this.tourModel.findByIdAndUpdate(id, { isActive: false });
  }

  async getStatusHistory(id: string): Promise<any[]> {
    const tour = await this.tourModel.findById(id);

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    return tour.statusHistory || [];
  }

  async getToursByDateRange(startDate: string, endDate: string, currentUser?: any): Promise<Tour[]> {
    const filterQuery: any = {
      expectedTime: {
        $gte: DateUtil.parseDateToISTStartOfDay(startDate),
        $lte: DateUtil.parseDateToISTEndOfDay(endDate)
      },
      isActive: true
    };

    // Apply reporting state/city filtering
    let allowedUserIds: string[] | null = null;
    if (currentUser) {
      allowedUserIds = await this.usersService.getVisibleUserIds(currentUser);
      if (allowedUserIds) {
        filterQuery.$or = [
          { assignedTo: { $in: allowedUserIds.map(id => new Types.ObjectId(id)) } },
          { createdBy: { $in: allowedUserIds.map(id => new Types.ObjectId(id)) } }
        ];
      }
    }

    return await this.tourModel
      .find(filterQuery)
      .populate('assignedTo', 'firstname lastname email')
      .populate('createdBy', 'firstname lastname email')
      .sort({ expectedTime: 1 })
      .exec();
  }
}
