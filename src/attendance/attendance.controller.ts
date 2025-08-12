import { Controller, Post, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('checkin')
  @ApiOperation({
    summary: 'User check-in',
    description: 'Record user check-in time for the current day'
  })
  @ApiResponse({
    status: 201,
    description: 'Check-in successful',
    schema: {
      example: {
        code: 201,
        status: 'Created',
        data: {
          _id: '64f8a1b2c3d4e5f6a7b8c9d0',
          userId: '64f8a1b2c3d4e5f6a7b8c9d0',
          date: '2023-12-08T00:00:00.000Z',
          checkInTime: '2023-12-08T09:00:00.000Z',
          isCheckedOut: false,
          status: 'present',
          sessionNumber: 1,
          createdAt: '2023-12-08T09:00:00.000Z',
          updatedAt: '2023-12-08T09:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'User needs to check out from current session before checking in again'
  })
  async checkIn(@Request() req: any) {
    const userId = req.user._id;
    return this.attendanceService.checkIn(userId);
  }

  @Post('new-session')
  @ApiOperation({
    summary: 'Start new session',
    description: 'Start a new attendance session for the current day after checking out from previous session'
  })
  @ApiResponse({
    status: 201,
    description: 'New session started successfully',
    schema: {
      example: {
        code: 201,
        status: 'Created',
        data: {
          _id: '64f8a1b2c3d4e5f6a7b8c9d0',
          userId: '64f8a1b2c3d4e5f6a7b8c9d0',
          date: '2023-12-08T00:00:00.000Z',
          checkInTime: '2023-12-08T18:00:00.000Z',
          isCheckedOut: false,
          status: 'present',
          sessionNumber: 2,
          createdAt: '2023-12-08T18:00:00.000Z',
          updatedAt: '2023-12-08T18:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'User needs to check out from current session before starting a new one'
  })
  async startNewSession(@Request() req: any) {
    const userId = req.user._id;
    return this.attendanceService.startNewSession(userId);
  }

  @Post('checkout')
  @ApiOperation({
    summary: 'User check-out',
    description: 'Record user check-out time for the current day'
  })
  @ApiResponse({
    status: 200,
    description: 'Check-out successful',
    schema: {
      example: {
        code: 200,
        status: 'OK',
        data: {
          _id: '64f8a1b2c3d4e5f6a7b8c9d0',
          userId: '64f8a1b2c3d4e5f6a7b8c9d0',
          date: '2023-12-08T09:00:00.000Z',
          checkInTime: '2023-12-08T09:00:00.000Z',
          checkOutTime: '2023-12-08T17:00:00.000Z',
          isCheckedOut: true,
          totalHours: 8,
          status: 'present',
          sessionNumber: 1,
          createdAt: '2023-12-08T09:00:00.000Z',
          updatedAt: '2023-12-08T17:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'No active check-in session found for today'
  })
  async checkOut(@Request() req: any) {
    const userId = req.user._id;
    return this.attendanceService.checkOut(userId);
  }

  @Get('today')
  @ApiOperation({
    summary: 'Get today\'s attendance',
    description: 'Get all attendance records for the current day'
  })
  @ApiResponse({
    status: 200,
    description: 'Today\'s attendance records',
    schema: {
      example: {
        code: 200,
        status: 'OK',
        data: [
          {
            _id: '64f8a1b2c3d4e5f6a7b8c9d0',
            userId: '64f8a1b2c3d4e5f6a7b8c9d0',
            date: '2023-12-08T00:00:00.000Z',
            checkInTime: '2023-12-08T09:00:00.000Z',
            checkOutTime: '2023-12-08T17:00:00.000Z',
            isCheckedOut: true,
            totalHours: 8,
            status: 'present',
            sessionNumber: 1
          },
          {
            _id: '64f8a1b2c3d4e5f6a7b8c9d1',
            userId: '64f8a1b2c3d4e5f6a7b8c9d0',
            date: '2023-12-08T00:00:00.000Z',
            checkInTime: '2023-12-08T18:00:00.000Z',
            isCheckedOut: false,
            status: 'present',
            sessionNumber: 2
          }
        ]
      }
    }
  })
  async getTodayAttendance(@Request() req: any) {
    const userId = req.user._id;
    return this.attendanceService.getTodayAttendance(userId);
  }

  @Get('date/:date')
  @ApiOperation({
    summary: 'Get attendance by specific date',
    description: 'Get attendance records for a specific date'
  })
  @ApiParam({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    example: '2023-12-08'
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance records for the specified date',
    schema: {
      example: {
        code: 200,
        status: 'OK',
        data: [
          {
            _id: '64f8a1b2c3d4e5f6a7b8c9d0',
            userId: '64f8a1b2c3d4e5f6a7b8c9d0',
            date: '2023-12-08T00:00:00.000Z',
            checkInTime: '2023-12-08T09:00:00.000Z',
            checkOutTime: '2023-12-08T17:00:00.000Z',
            isCheckedOut: true,
            totalHours: 8,
            status: 'present',
            sessionNumber: 1
          }
        ]
      }
    }
  })
  async getAttendanceByDate(@Request() req: any, @Param('date') date: string) {
    const userId = req.user._id;
    return this.attendanceService.getAttendanceByDate(userId, date);
  }

  @Get('range')
  @ApiOperation({
    summary: 'Get attendance by date range',
    description: 'Get attendance records for a date range'
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date in YYYY-MM-DD format',
    example: '2023-12-01'
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date in YYYY-MM-DD format',
    example: '2023-12-08'
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance records for the specified date range',
    schema: {
      example: {
        code: 200,
        status: 'OK',
        data: [
          {
            _id: '64f8a1b2c3d4e5f6a7b8c9d0',
            userId: '64f8a1b2c3d4e5f6a7b8c9d0',
            date: '2023-12-08T00:00:00.000Z',
            checkInTime: '2023-12-08T09:00:00.000Z',
            checkOutTime: '2023-12-08T17:00:00.000Z',
            isCheckedOut: true,
            totalHours: 8,
            status: 'present',
            sessionNumber: 1
          }
        ]
      }
    }
  })
  async getAttendanceByDateRange(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const userId = req.user._id;
    return this.attendanceService.getAttendanceByDateRange(userId, startDate, endDate);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all attendance records',
    description: 'Get all attendance records for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'All attendance records',
    schema: {
      example: {
        code: 200,
        status: 'OK',
        data: [
          {
            _id: '64f8a1b2c3d4e5f6a7b8c9d0',
            userId: '64f8a1b2c3d4e5f6a7b8c9d0',
            date: '2023-12-08T00:00:00.000Z',
            checkInTime: '2023-12-08T09:00:00.000Z',
            checkOutTime: '2023-12-08T17:00:00.000Z',
            isCheckedOut: true,
            totalHours: 8,
            status: 'present',
            sessionNumber: 1
          }
        ]
      }
    }
  })
  async getAllAttendance(@Request() req: any) {
    const userId = req.user._id;
    return this.attendanceService.getAllUserAttendance(userId);
  }

  @Get('admin/all')
  @ApiOperation({
    summary: 'Admin: Get all users attendance data',
    description: 'Get attendance records for all users with date filter, pagination, and user filter'
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format (required)',
    example: '2023-12-08',
    required: true
  })
  @ApiQuery({
    name: 'userId',
    description: 'Filter by specific user ID (optional)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0',
    required: false
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    example: 1,
    required: false
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of records per page',
    example: 10,
    required: false
  })
  @ApiResponse({
    status: 200,
    description: 'All users attendance data with pagination',
    schema: {
      example: {
        code: 200,
        status: 'OK',
        data: {
          data: [
            {
              _id: '64f8a1b2c3d4e5f6a7b8c9d0',
              userId: {
                _id: '64f8a1b2c3d4e5f6a7b8c9d0',
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@example.com'
              },
              date: '2023-12-08T00:00:00.000Z',
              checkInTime: '2023-12-08T09:00:00.000Z',
              checkOutTime: '2023-12-08T17:00:00.000Z',
              isCheckedOut: true,
              totalHours: 8,
              status: 'present',
              sessionNumber: 1
            }
          ],
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3
        }
      }
    }
  })
  async getAllUsersAttendance(
    @Query('date') date: string,
    @Query('userId') userId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    if (!date) {
      throw new Error('Date parameter is required');
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return this.attendanceService.getAllUsersAttendance(
      date,
      userId,
      pageNum,
      limitNum
    );
  }
}
