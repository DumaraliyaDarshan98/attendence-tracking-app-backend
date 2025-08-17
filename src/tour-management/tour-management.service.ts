import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tour, TourDocument } from '../models/tour.model';
import { CreateTourDto, UpdateTourDto, UpdateTourStatusDto } from './dto';

@Injectable()
export class TourManagementService {
  constructor(
    @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
  ) { }

  async create(createTourDto: CreateTourDto, createdBy: string): Promise<Tour> {
    const tour = new this.tourModel({
      ...createTourDto,
      createdBy: new Types.ObjectId(createdBy),
      assignedTo: new Types.ObjectId(createTourDto.assignedTo),
      expectedTime: new Date(createTourDto.expectedTime),
      status: 'assigned',
      statusHistory: [{
        status: 'assigned',
        changedBy: createdBy,
        changedByName: 'System', // Will be updated with actual user name
        notes: 'Tour assigned to user',
        changedAt: new Date()
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
    } = {}
  ): Promise<{ data: Tour[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery: any = { isActive: true };

    if (filters.status) {
      filterQuery.status = filters.status;
    }

    if (filters.assignedTo) {
      filterQuery.assignedTo = new Types.ObjectId(filters.assignedTo);
    }

    if (filters.createdBy) {
      filterQuery.createdBy = new Types.ObjectId(filters.createdBy);
    }

    if (filters.startDate || filters.endDate) {
      filterQuery.expectedTime = {};
      if (filters.startDate) {
        filterQuery.expectedTime.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        filterQuery.expectedTime.$lte = new Date(filters.endDate);
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
      updateTourDto.expectedTime = new Date(updateTourDto.expectedTime);
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
      changedAt: new Date()
    };

    // Handle specific status updates
    if (updateStatusDto.status === 'in-progress' && updateStatusDto.actualVisitTime) {
      updateData.actualVisitTime = new Date(updateStatusDto.actualVisitTime);
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

  async getToursByDateRange(startDate: string, endDate: string): Promise<Tour[]> {
    const filterQuery = {
      expectedTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      isActive: true
    };

    return await this.tourModel
      .find(filterQuery)
      .populate('assignedTo', 'firstname lastname email')
      .populate('createdBy', 'firstname lastname email')
      .sort({ expectedTime: 1 })
      .exec();
  }
}
