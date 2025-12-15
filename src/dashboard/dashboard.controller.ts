import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { DashboardService } from './dashboard.service';
import { DateUtil } from '../common/utils';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get aggregated dashboard statistics' })
    @ApiResponse({
        status: 200,
        description: 'Dashboard stats retrieved successfully',
    })
    async getStats() {
        const stats = await this.dashboardService.getStats();
        return {
            code: 200,
            status: 'OK',
            data: stats,
            timestamp: DateUtil.toISOStringIST(new Date()),
            path: '/api/dashboard/stats'
        };
    }

    @Get('activity')
    @ApiOperation({ summary: 'Get recent activity feed' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    async getActivity(@Query('limit') limit: number = 10) {
        const activity = await this.dashboardService.getRecentActivity(limit);
        return {
            code: 200,
            status: 'OK',
            data: activity,
            timestamp: DateUtil.toISOStringIST(new Date()),
            path: '/api/dashboard/activity'
        };
    }

    @Get('department-stats')
    @ApiOperation({ summary: 'Get attendance statistics by department/center' })
    async getDepartmentStats() {
        const stats = await this.dashboardService.getDepartmentStats();
        return {
            code: 200,
            status: 'OK',
            data: stats,
            timestamp: DateUtil.toISOStringIST(new Date()),
            path: '/api/dashboard/department-stats'
        };
    }

    @Get('leave-requests')
    @ApiOperation({ summary: 'Get pending leave requests' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
    async getPendingLeaveRequests(@Query('limit') limit: number = 5) {
        const requests = await this.dashboardService.getPendingLeaveRequests(limit);
        return {
            code: 200,
            status: 'OK',
            data: requests,
            timestamp: DateUtil.toISOStringIST(new Date()),
            path: '/api/dashboard/leave-requests'
        };
    }
}

