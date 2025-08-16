import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TourManagementService } from './tour-management.service';
import {
  CreateTourDto,
  UpdateTourDto,
  UpdateTourStatusDto,
  TourResponseDto,
  ToursListResponseDto,
} from './dto';
import { AuthGuard } from '../guards/auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Tour Management')
@Controller('tour-management')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class TourManagementController {
  constructor(private readonly tourManagementService: TourManagementService) {}

  @Post('tours')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tour/site visit' })
  @ApiBody({
    description: 'Tour creation data',
    type: CreateTourDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Tour created successfully',
    type: TourResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createTourDto: CreateTourDto, @Request() req: any) {
    const tour = await this.tourManagementService.create(createTourDto, req.user._id);
    return {
      code: 201,
      status: 'Created',
      data: tour,
      timestamp: new Date().toISOString(),
      path: '/api/tour-management/tours'
    };
  }

  @Get('tours')
  @ApiOperation({ summary: 'Get all tours with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled', 'approved', 'rejected'], description: 'Filter by status' })
  @ApiQuery({ name: 'assignedTo', required: false, type: String, description: 'Filter by assigned user ID' })
  @ApiQuery({ name: 'createdBy', required: false, type: String, description: 'Filter by creator user ID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Tours retrieved successfully',
    type: ToursListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('createdBy') createdBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const page = parseInt(query.page?.toString()) || 1;
    const limit = parseInt(query.limit?.toString()) || 10;

    const filters = {
      status,
      assignedTo,
      createdBy,
      startDate,
      endDate,
    };

    const result = await this.tourManagementService.findAll(page, limit, filters);
    
    return {
      code: 200,
      status: 'OK',
      data: result,
      timestamp: new Date().toISOString(),
      path: '/api/tour-management/tours'
    };
  }

  @Get('tours/my')
  @ApiOperation({ summary: 'Get tours assigned to the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'User tours retrieved successfully',
    type: ToursListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMyTours(
    @Query() query: PaginationQueryDto,
    @Request() req: any,
  ) {
    const page = parseInt(query.page?.toString()) || 1;
    const limit = parseInt(query.limit?.toString()) || 10;

    const result = await this.tourManagementService.findByUser(req.user._id, page, limit);
    
    return {
      code: 200,
      status: 'OK',
      data: result,
      timestamp: new Date().toISOString(),
      path: '/api/tour-management/tours/my'
    };
  }

  @Get('tours/:id')
  @ApiOperation({ summary: 'Get a specific tour by ID' })
  @ApiParam({ name: 'id', description: 'Tour ID' })
  @ApiResponse({
    status: 200,
    description: 'Tour retrieved successfully',
    type: TourResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    const tour = await this.tourManagementService.findOne(id);
    return {
      code: 200,
      status: 'OK',
      data: tour,
      timestamp: new Date().toISOString(),
      path: `/api/tour-management/tours/${id}`
    };
  }

  @Patch('tours/:id')
  @ApiOperation({ summary: 'Update a tour' })
  @ApiParam({ name: 'id', description: 'Tour ID' })
  @ApiBody({
    description: 'Tour update data',
    type: UpdateTourDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Tour updated successfully',
    type: TourResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateTourDto: UpdateTourDto,
  ) {
    const tour = await this.tourManagementService.update(id, updateTourDto);
    return {
      code: 200,
      status: 'OK',
      data: tour,
      timestamp: new Date().toISOString(),
      path: `/api/tour-management/tours/${id}`
    };
  }

  @Patch('tours/:id/status')
  @ApiOperation({ summary: 'Update tour status with history tracking' })
  @ApiParam({ name: 'id', description: 'Tour ID' })
  @ApiBody({
    description: 'Status update data',
    type: UpdateTourStatusDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Tour status updated successfully',
    type: TourResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTourStatusDto,
    @Request() req: any,
  ) {
    const changedByName = `${req.user.firstname} ${req.user.lastname}`;
    const tour = await this.tourManagementService.updateStatus(
      id,
      updateStatusDto,
      req.user._id,
      changedByName
    );
    
    return {
      code: 200,
      status: 'OK',
      data: tour,
      timestamp: new Date().toISOString(),
      path: `/api/tour-management/tours/${id}/status`
    };
  }

  @Get('tours/:id/status-history')
  @ApiOperation({ summary: 'Get tour status change history' })
  @ApiParam({ name: 'id', description: 'Tour ID' })
  @ApiResponse({
    status: 200,
    description: 'Status history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'in-progress' },
              changedBy: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
              changedByName: { type: 'string', example: 'John Doe' },
              notes: { type: 'string', example: 'Tour started successfully' },
              changedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:00:00.000Z' }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatusHistory(@Param('id') id: string) {
    const history = await this.tourManagementService.getStatusHistory(id);
    return {
      code: 200,
      status: 'OK',
      data: history,
      timestamp: new Date().toISOString(),
      path: `/api/tour-management/tours/${id}/status-history`
    };
  }

  @Get('tours/range')
  @ApiOperation({ summary: 'Get tours within a date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Tours retrieved successfully',
    type: [TourResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid dates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getToursByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const tours = await this.tourManagementService.getToursByDateRange(startDate, endDate);
    return {
      code: 200,
      status: 'OK',
      data: tours,
      timestamp: new Date().toISOString(),
      path: '/api/tour-management/tours/range'
    };
  }

  @Delete('tours/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tour (soft delete)' })
  @ApiParam({ name: 'id', description: 'Tour ID' })
  @ApiResponse({ status: 204, description: 'Tour deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string) {
    await this.tourManagementService.remove(id);
    return {
      code: 204,
      status: 'No Content',
      data: { message: 'Tour deleted successfully' },
      timestamp: new Date().toISOString(),
      path: `/api/tour-management/tours/${id}`
    };
  }
}
