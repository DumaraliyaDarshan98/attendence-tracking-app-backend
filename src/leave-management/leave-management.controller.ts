import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { LeaveManagementService } from './leave-management.service';

@ApiTags('Leave Management')
@Controller('leave-management')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class LeaveManagementController {
  constructor(private readonly leaveManagementService: LeaveManagementService) {}

  // Holiday Management Endpoints
  @Post('holidays')
  @ApiOperation({ summary: 'Create a new holiday' })
  @ApiBody({
    description: 'Holiday data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'New Year Day', description: 'Name of the holiday' },
        date: { type: 'string', format: 'date', example: '2024-01-01', description: 'Date of the holiday' },
        description: { type: 'string', example: 'New Year celebration', description: 'Description of the holiday' },
        isActive: { type: 'boolean', example: true, description: 'Whether the holiday is active' },
        isOptional: { type: 'boolean', example: false, description: 'Whether the holiday is optional' }
      },
      required: ['name', 'date', 'description']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Holiday created successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 201 },
        status: { type: 'string', example: 'Created' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            name: { type: 'string', example: 'New Year Day' },
            date: { type: 'string', format: 'date', example: '2024-01-01T00:00:00.000Z' },
            description: { type: 'string', example: 'New Year celebration' },
            isActive: { type: 'boolean', example: true },
            isOptional: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/holidays' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createHoliday(@Body() holidayData: any) {
    const holiday = await this.leaveManagementService.createHoliday(holidayData);
    return {
      code: 201,
      status: 'Created',
      data: holiday,
      timestamp: new Date().toISOString(),
      path: '/api/leave-management/holidays'
    };
  }

  @Get('holidays')
  @ApiOperation({ summary: 'Get all active holidays' })
  @ApiResponse({ 
    status: 200, 
    description: 'Holidays retrieved successfully',
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
              _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
              name: { type: 'string', example: 'New Year Day' },
              date: { type: 'string', format: 'date', example: '2024-01-01T00:00:00.000Z' },
              description: { type: 'string', example: 'New Year celebration' },
              isActive: { type: 'boolean', example: true },
              isOptional: { type: 'boolean', example: false }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/holidays' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllHolidays() {
    const holidays = await this.leaveManagementService.getAllHolidays();
    return {
      code: 200,
      status: 'OK',
      data: holidays,
      timestamp: new Date().toISOString(),
      path: '/api/leave-management/holidays'
    };
  }

  @Get('holidays/year/:year')
  @ApiOperation({ summary: 'Get holidays for a specific year' })
  @ApiParam({ name: 'year', description: 'Year (e.g., 2024)', example: '2024' })
  @ApiResponse({ 
    status: 200, 
    description: 'Holidays retrieved successfully',
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
              _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
              name: { type: 'string', example: 'New Year Day' },
              date: { type: 'string', format: 'date', example: '2024-01-01T00:00:00.000Z' },
              description: { type: 'string', example: 'New Year celebration' },
              isActive: { type: 'boolean', example: true },
              isOptional: { type: 'boolean', example: false }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/holidays/year/2024' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getHolidaysByYear(@Param('year') year: string) {
    const holidays = await this.leaveManagementService.getHolidaysByYear(parseInt(year));
    return {
      code: 200,
      status: 'OK',
      data: holidays,
      timestamp: new Date().toISOString(),
      path: `/api/leave-management/holidays/year/${year}`
    };
  }

  @Get('holidays/:id')
  @ApiOperation({ summary: 'Get holiday by ID' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiResponse({ 
    status: 200, 
    description: 'Holiday retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            name: { type: 'string', example: 'New Year Day' },
            date: { type: 'string', format: 'date', example: '2024-01-01T00:00:00.000Z' },
            description: { type: 'string', example: 'New Year celebration' },
            isActive: { type: 'boolean', example: true },
            isOptional: { type: 'boolean', example: false }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/holidays/64f8a1b2c3d4e5f6a7b8c9d0' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getHolidayById(@Param('id') id: string) {
    const holiday = await this.leaveManagementService.getHolidayById(id);
    return {
      code: 200,
      status: 'OK',
      data: holiday,
      timestamp: new Date().toISOString(),
      path: `/api/leave-management/holidays/${id}`
    };
  }

  @Put('holidays/:id')
  @ApiOperation({ summary: 'Update holiday' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiBody({
    description: 'Holiday update data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated New Year Day', description: 'Name of the holiday' },
        date: { type: 'string', format: 'date', example: '2024-01-01', description: 'Date of the holiday' },
        description: { type: 'string', example: 'Updated New Year celebration', description: 'Description of the holiday' },
        isActive: { type: 'boolean', example: true, description: 'Whether the holiday is active' },
        isOptional: { type: 'boolean', example: false, description: 'Whether the holiday is optional' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Holiday updated successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            name: { type: 'string', example: 'Updated New Year Day' },
            date: { type: 'string', format: 'date', example: '2024-01-01T00:00:00.000Z' },
            description: { type: 'string', example: 'Updated New Year celebration' },
            isActive: { type: 'boolean', example: true },
            isOptional: { type: 'boolean', example: false }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/holidays/64f8a1b2c3d4e5f6a7b8c9d0' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateHoliday(@Param('id') id: string, @Body() updateData: any) {
    const holiday = await this.leaveManagementService.updateHoliday(id, updateData);
    return {
      code: 200,
      status: 'OK',
      data: holiday,
      timestamp: new Date().toISOString(),
      path: `/api/leave-management/holidays/${id}`
    };
  }

  @Delete('holidays/:id')
  @ApiOperation({ summary: 'Delete holiday' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiResponse({ 
    status: 200, 
    description: 'Holiday deleted successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: { type: 'string', example: 'Holiday deleted successfully' },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/holidays/64f8a1b2c3d4e5f6a7b8c9d0' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteHoliday(@Param('id') id: string) {
    await this.leaveManagementService.deleteHoliday(id);
    return {
      code: 200,
      status: 'OK',
      data: 'Holiday deleted successfully',
      timestamp: new Date().toISOString(),
      path: `/api/leave-management/holidays/${id}`
    };
  }

  // Leave Request Endpoints
  @Post('leave-requests')
  @ApiOperation({ summary: 'Create a new leave request' })
  @ApiBody({
    description: 'Leave request data',
    schema: {
      type: 'object',
      properties: {
        leaveType: { 
          type: 'string', 
          enum: ['full-day', 'half-day', 'sick', 'casual', 'annual', 'other'],
          example: 'annual',
          description: 'Type of leave'
        },
        startDate: { 
          type: 'string', 
          format: 'date', 
          example: '2024-01-15', 
          description: 'Start date of leave' 
        },
        endDate: { 
          type: 'string', 
          format: 'date', 
          example: '2024-01-17', 
          description: 'End date of leave' 
        },
        reason: { 
          type: 'string', 
          example: 'Family vacation', 
          description: 'Reason for leave' 
        },
        isHalfDay: { 
          type: 'boolean', 
          example: false, 
          description: 'Whether this is a half-day leave' 
        },
        halfDayType: { 
          type: 'string', 
          enum: ['morning', 'afternoon'],
          example: 'morning',
          description: 'Half-day type (morning/afternoon)' 
        },
        notes: { 
          type: 'string', 
          example: 'Additional notes about the leave', 
          description: 'Additional notes' 
        }
      },
      required: ['leaveType', 'startDate', 'endDate', 'reason']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Leave request created successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 201 },
        status: { type: 'string', example: 'Created' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            userId: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            leaveType: { type: 'string', example: 'annual' },
            startDate: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
            endDate: { type: 'string', format: 'date', example: '2024-01-17T00:00:00.000Z' },
            reason: { type: 'string', example: 'Family vacation' },
            status: { type: 'string', example: 'pending' },
            isHalfDay: { type: 'boolean', example: false },
            totalDays: { type: 'number', example: 3 },
            notes: { type: 'string', example: 'Additional notes about the leave' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createLeaveRequest(@Body() leaveData: any, @Request() req: any) {
    const leaveRequest = await this.leaveManagementService.createLeaveRequest({
      ...leaveData,
      userId: req.user._id
    });
    return {
      code: 201,
      status: 'Created',
      data: leaveRequest,
      timestamp: new Date().toISOString(),
      path: '/api/leave-management/leave-requests'
    };
  }

  @Get('leave-requests/my')
  @ApiOperation({ summary: 'Get current user\'s leave requests' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave requests retrieved successfully',
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
              _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
              leaveType: { type: 'string', example: 'annual' },
              startDate: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
              endDate: { type: 'string', format: 'date', example: '2024-01-17T00:00:00.000Z' },
              reason: { type: 'string', example: 'Family vacation' },
              status: { type: 'string', example: 'pending' },
              isHalfDay: { type: 'boolean', example: false },
              totalDays: { type: 'number', example: 3 }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests/my' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyLeaveRequests(@Request() req: any) {
    const leaveRequests = await this.leaveManagementService.getUserLeaveRequests(req.user._id);
    return {
      code: 200,
      status: 'OK',
      data: leaveRequests,
      timestamp: new Date().toISOString(),
      path: '/api/leave-management/leave-requests/my'
    };
  }

  @Get('leave-requests')
  @ApiOperation({ summary: 'Get all leave requests with advanced filters (Admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', example: 'pending' })
  @ApiQuery({ name: 'leaveType', required: false, description: 'Filter by leave type', example: 'annual' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (YYYY-MM-DD)', example: '2024-12-31' })
  @ApiQuery({ name: 'isHalfDay', required: false, description: 'Filter by half day', example: true })
  @ApiQuery({ name: 'approvedBy', required: false, description: 'Filter by approver ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave requests retrieved successfully',
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
              _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
              userId: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
              leaveType: { type: 'string', example: 'annual' },
              startDate: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
              endDate: { type: 'string', format: 'date', example: '2024-01-17T00:00:00.000Z' },
              reason: { type: 'string', example: 'Family vacation' },
              status: { type: 'string', example: 'pending' },
              isHalfDay: { type: 'boolean', example: false },
              totalDays: { type: 'number', example: 3 }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 25 },
            totalPages: { type: 'number', example: 3 }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllLeaveRequests(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('leaveType') leaveType?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('isHalfDay') isHalfDay?: string,
    @Query('approvedBy') approvedBy?: string
  ) {
    const filters: any = {};

    if (status) filters.status = status;
    if (leaveType) filters.leaveType = leaveType;
    if (userId) filters.userId = userId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (isHalfDay !== undefined) filters.isHalfDay = isHalfDay === 'true';
    if (approvedBy) filters.approvedBy = approvedBy;

    const result = await this.leaveManagementService.getAllLeaveRequests(
      parseInt(page),
      parseInt(limit),
      filters
    );
    return {
      code: 200,
      status: 'OK',
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      },
      timestamp: new Date().toISOString(),
      path: '/api/leave-management/leave-requests'
    };
  }

  @Get('leave-requests/range')
  @ApiOperation({ summary: 'Get leave requests by date range' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)', example: '2024-12-31' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave requests retrieved successfully',
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
              _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
              leaveType: { type: 'string', example: 'annual' },
              startDate: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
              endDate: { type: 'string', format: 'date', example: '2024-01-17T00:00:00.000Z' },
              reason: { type: 'string', example: 'Family vacation' },
              status: { type: 'string', example: 'approved' },
              totalDays: { type: 'number', example: 3 }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests/range' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLeaveRequestsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const leaveRequests = await this.leaveManagementService.getLeaveRequestsByDateRange(startDate, endDate);
    return {
      code: 200,
      status: 'OK',
      data: leaveRequests,
      timestamp: new Date().toISOString(),
      path: '/api/leave-management/leave-requests/range'
    };
  }

  @Get('leave-requests/balance')
  @ApiOperation({ summary: 'Get current user\'s leave balance' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave balance retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            annual: { type: 'number', example: 20 },
            casual: { type: 'number', example: 10 },
            sick: { type: 'number', example: 15 },
            used: { type: 'number', example: 5 },
            remaining: { type: 'number', example: 40 }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests/balance' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLeaveBalance(@Request() req: any) {
    const balance = await this.leaveManagementService.getUserLeaveBalance(req.user._id);
    return {
      code: 200,
      status: 'OK',
      data: balance,
      timestamp: new Date().toISOString(),
      path: '/api/leave-management/leave-requests/balance'
    };
  }

  @Get('leave-requests/:id')
  @ApiOperation({ summary: 'Get leave request by ID' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave request retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            userId: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            leaveType: { type: 'string', example: 'annual' },
            startDate: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
            endDate: { type: 'string', format: 'date', example: '2024-01-17T00:00:00.000Z' },
            reason: { type: 'string', example: 'Family vacation' },
            status: { type: 'string', example: 'pending' },
            isHalfDay: { type: 'boolean', example: false },
            totalDays: { type: 'number', example: 3 }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLeaveRequestById(@Param('id') id: string) {
    const leaveRequest = await this.leaveManagementService.getLeaveRequestById(id);
    return {
      code: 200,
      status: 'OK',
      data: leaveRequest,
      timestamp: new Date().toISOString(),
      path: `/api/leave-management/leave-requests/${id}`
    };
  }

  @Put('leave-requests/:id')
  @ApiOperation({ summary: 'Update leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiBody({
    description: 'Leave request update data',
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Updated reason for leave', description: 'Updated reason' },
        notes: { type: 'string', example: 'Updated notes', description: 'Updated notes' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave request updated successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            reason: { type: 'string', example: 'Updated reason for leave' },
            notes: { type: 'string', example: 'Updated notes' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateLeaveRequest(@Param('id') id: string, @Body() updateData: any) {
    const leaveRequest = await this.leaveManagementService.updateLeaveRequest(id, updateData);
    return {
      code: 200,
      status: 'OK',
      data: leaveRequest,
      timestamp: new Date().toISOString(),
      path: `/api/leave-management/leave-requests/${id}`
    };
  }

  @Put('leave-requests/:id/status')
  @ApiOperation({ summary: 'Update leave request status (approve/reject)' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiBody({
    description: 'Status update data',
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['approved', 'rejected'],
          example: 'approved',
          description: 'New status for the leave request' 
        },
        notes: { 
          type: 'string', 
          example: 'Approved with notes', 
          description: 'Notes when approving (optional)' 
        },
        rejectionReason: { 
          type: 'string', 
          example: 'Insufficient notice period', 
          description: 'Reason when rejecting (required for rejection)' 
        }
      },
      required: ['status']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave request status updated successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            status: { type: 'string', example: 'approved' },
            approvedBy: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            approvedAt: { type: 'string', format: 'date-time' },
            notes: { type: 'string', example: 'Approved with notes' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/status' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async updateLeaveRequestStatus(
    @Param('id') id: string,
    @Body() body: { 
      status: 'approved' | 'rejected';
      notes?: string;
      rejectionReason?: string;
    },
    @Request() req: any
  ) {
    const leaveRequest = await this.leaveManagementService.updateLeaveRequestStatus(
      id,
      body.status,
      req.user._id,
      {
        notes: body.notes,
        rejectionReason: body.rejectionReason
      }
    );
    return {
      code: 200,
      status: 'OK',
      data: leaveRequest,
      timestamp: new Date().toISOString(),
      path: `/api/leave-management/leave-requests/${id}/status`
    };
  }

  @Put('leave-requests/:id/approve')
  @ApiOperation({ summary: 'Approve leave request (Legacy endpoint)' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiBody({
    description: 'Approval data',
    schema: {
      type: 'object',
      properties: {
        notes: { 
          type: 'string', 
          example: 'Approved with notes', 
          description: 'Notes for approval (optional)' 
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave request approved successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            status: { type: 'string', example: 'approved' },
            approvedBy: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            approvedAt: { type: 'string', format: 'date-time' },
            notes: { type: 'string', example: 'Approved with notes' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/approve' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async approveLeaveRequest(
    @Param('id') id: string,
    @Body() body: { notes?: string },
    @Request() req: any
  ) {
    const leaveRequest = await this.leaveManagementService.approveLeaveRequest(
      id,
      req.user._id,
      body.notes
    );
    return {
      code: 200,
      status: 'OK',
      data: leaveRequest,
      timestamp: new Date().toISOString(),
      path: `/api/leave-management/leave-requests/${id}/approve`
    };
  }

  @Put('leave-requests/:id/reject')
  @ApiOperation({ summary: 'Reject leave request (Legacy endpoint)' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiBody({
    description: 'Rejection data',
    schema: {
      type: 'object',
      properties: {
        rejectionReason: { 
          type: 'string', 
          example: 'Insufficient notice period', 
          description: 'Reason for rejection (required)' 
        }
      },
      required: ['rejectionReason']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave request rejected successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            status: { type: 'string', example: 'rejected' },
            approvedBy: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            approvedAt: { type: 'string', format: 'date-time' },
            rejectionReason: { type: 'string', example: 'Insufficient notice period' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/reject' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async rejectLeaveRequest(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
    @Request() req: any
  ) {
    const leaveRequest = await this.leaveManagementService.rejectLeaveRequest(
      id,
      req.user._id,
      body.rejectionReason
    );
    return {
      code: 200,
      status: 'OK',
      data: leaveRequest,
      timestamp: new Date().toISOString(),
      path: `/api/leave-management/leave-requests/${id}/reject`
    };
  }

  @Put('leave-requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave request cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            status: { type: 'string', example: 'cancelled' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/cancel' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelLeaveRequest(@Param('id') id: string, @Request() req: any) {
    const leaveRequest = await this.leaveManagementService.cancelLeaveRequest(id, req.user._id);
    return {
      code: 200,
      status: 'OK',
      data: leaveRequest,
      timestamp: new Date().toISOString(),
      path: `/api/leave-management/leave-requests/${id}/cancel`
    };
  }

}
