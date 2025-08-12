import { Controller, Get, Post, Put, Query, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { AttendanceService } from './attendance.service';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('checkin')
  @ApiOperation({ summary: 'User check-in for the day' })
  @ApiResponse({ 
    status: 201, 
    description: 'Check-in successful',
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
            date: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
            checkInTime: { type: 'string', format: 'date-time', example: '2024-01-15T09:00:00.000Z' },
            isCheckedOut: { type: 'boolean', example: false },
            status: { type: 'string', example: 'present' },
            sessionNumber: { type: 'number', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/attendance/checkin' }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Already checked in today' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkIn(@Request() req: any) {
    const attendance = await this.attendanceService.checkIn(req.user._id);
    return {
      code: 201,
      status: 'Created',
      data: attendance,
      timestamp: new Date().toISOString(),
      path: '/api/attendance/checkin'
    };
  }

  @Post('start-new-session')
  @ApiOperation({ summary: 'Start a new session for the same day' })
  @ApiResponse({ 
    status: 201, 
    description: 'New session started successfully',
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
            date: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
            checkInTime: { type: 'string', format: 'date-time', example: '2024-01-15T14:00:00.000Z' },
            isCheckedOut: { type: 'boolean', example: false },
            status: { type: 'string', example: 'present' },
            sessionNumber: { type: 'number', example: 2 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/attendance/start-new-session' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'No previous session found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async startNewSession(@Request() req: any) {
    const attendance = await this.attendanceService.startNewSession(req.user._id);
    return {
      code: 201,
      status: 'Created',
      data: attendance,
      timestamp: new Date().toISOString(),
      path: '/api/attendance/start-new-session'
    };
  }

  @Post('checkout')
  @ApiOperation({ summary: 'User check-out for the current session' })
  @ApiResponse({ 
    status: 200, 
    description: 'Check-out successful',
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
            date: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
            checkInTime: { type: 'string', format: 'date-time', example: '2024-01-15T09:00:00.000Z' },
            checkOutTime: { type: 'string', format: 'date-time', example: '2024-01-15T17:00:00.000Z' },
            isCheckedOut: { type: 'boolean', example: true },
            totalHours: { type: 'number', example: 8 },
            status: { type: 'string', example: 'present' },
            sessionNumber: { type: 'number', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/attendance/checkout' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'No active session found' })
  @ApiResponse({ status: 409, description: 'Already checked out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkOut(@Request() req: any) {
    const attendance = await this.attendanceService.checkOut(req.user._id);
    return {
      code: 200,
      status: 'OK',
      data: attendance,
      timestamp: new Date().toISOString(),
      path: '/api/attendance/checkout'
    };
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s attendance records for current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Today\'s attendance retrieved successfully',
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
              date: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
              checkInTime: { type: 'string', format: 'date-time', example: '2024-01-15T09:00:00.000Z' },
              checkOutTime: { type: 'string', format: 'date-time', example: '2024-01-15T17:00:00.000Z' },
              isCheckedOut: { type: 'boolean', example: true },
              totalHours: { type: 'number', example: 8 },
              status: { type: 'string', example: 'present' },
              sessionNumber: { type: 'number', example: 1 }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/attendance/today' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTodayAttendance(@Request() req: any) {
    const attendance = await this.attendanceService.getTodayAttendance(req.user._id);
    return {
      code: 200,
      status: 'OK',
      data: attendance,
      timestamp: new Date().toISOString(),
      path: '/api/attendance/today'
    };
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get attendance records for a specific date' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format', example: '2024-01-15' })
  @ApiResponse({ 
    status: 200, 
    description: 'Attendance records retrieved successfully',
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
              date: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
              checkInTime: { type: 'string', format: 'date-time', example: '2024-01-15T09:00:00.000Z' },
              checkOutTime: { type: 'string', format: 'date-time', example: '2024-01-15T17:00:00.000Z' },
              isCheckedOut: { type: 'boolean', example: true },
              totalHours: { type: 'number', example: 8 },
              status: { type: 'string', example: 'present' },
              sessionNumber: { type: 'number', example: 1 }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/attendance/date/2024-01-15' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAttendanceByDate(@Request() req: any, @Param('date') date: string) {
    const attendance = await this.attendanceService.getAttendanceByDate(req.user._id, date);
    return {
      code: 200,
      status: 'OK',
      data: attendance,
      timestamp: new Date().toISOString(),
      path: `/api/attendance/date/${date}`
    };
  }

  @Get('range')
  @ApiOperation({ summary: 'Get attendance records for a date range' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiResponse({ 
    status: 200, 
    description: 'Attendance records retrieved successfully',
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
              date: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
              checkInTime: { type: 'string', format: 'date-time', example: '2024-01-15T09:00:00.000Z' },
              checkOutTime: { type: 'string', format: 'date-time', example: '2024-01-15T17:00:00.000Z' },
              isCheckedOut: { type: 'boolean', example: true },
              totalHours: { type: 'number', example: 8 },
              status: { type: 'string', example: 'present' },
              sessionNumber: { type: 'number', example: 1 }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/attendance/range' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAttendanceByDateRange(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const attendance = await this.attendanceService.getAttendanceByDateRange(req.user._id, startDate, endDate);
    return {
      code: 200,
      status: 'OK',
      data: attendance,
      timestamp: new Date().toISOString(),
      path: '/api/attendance/range'
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all attendance records for current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'All attendance records retrieved successfully',
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
              date: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
              checkInTime: { type: 'string', format: 'date-time', example: '2024-01-15T09:00:00.000Z' },
              checkOutTime: { type: 'string', format: 'date-time', example: '2024-01-15T17:00:00.000Z' },
              isCheckedOut: { type: 'boolean', example: true },
              totalHours: { type: 'number', example: 8 },
              status: { type: 'string', example: 'present' },
              sessionNumber: { type: 'number', example: 1 }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/attendance/all' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllAttendance(@Request() req: any) {
    const attendance = await this.attendanceService.getAllUserAttendance(req.user._id);
    return {
      code: 200,
      status: 'OK',
      data: attendance,
      timestamp: new Date().toISOString(),
      path: '/api/attendance/all'
    };
  }

  @Get('admin/all-users')
  @ApiOperation({ summary: 'Get all users attendance for a specific date (Admin only)' })
  @ApiQuery({ name: 'date', required: true, description: 'Date in YYYY-MM-DD format', example: '2024-01-15' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by specific user ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'All users attendance retrieved successfully',
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
              date: { type: 'string', format: 'date', example: '2024-01-15T00:00:00.000Z' },
              checkInTime: { type: 'string', format: 'date-time', example: '2024-01-15T09:00:00.000Z' },
              checkOutTime: { type: 'string', format: 'date-time', example: '2024-01-15T17:00:00.000Z' },
              isCheckedOut: { type: 'boolean', example: true },
              totalHours: { type: 'number', example: 8 },
              status: { type: 'string', example: 'present' },
              sessionNumber: { type: 'number', example: 1 },
              user: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
                  firstname: { type: 'string', example: 'John' },
                  lastname: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' }
                }
              }
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
        path: { type: 'string', example: '/api/attendance/admin/all-users' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllUsersAttendance(
    @Query('date') date: string,
    @Query('userId') userId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const result = await this.attendanceService.getAllUsersAttendance(
      date,
      userId,
      parseInt(page),
      parseInt(limit)
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
      path: '/api/attendance/admin/all-users'
    };
  }
}
