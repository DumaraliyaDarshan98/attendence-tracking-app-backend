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
        return this.dashboardService.getStats();
    }

    @Get('activity')
    @ApiOperation({ summary: 'Get recent activity feed' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    async getActivity(@Query('limit') limit: number = 10) {
        return this.dashboardService.getRecentActivity(limit);
    }

    @Get('department-stats')
    @ApiOperation({ summary: 'Get attendance statistics by department/center' })
    async getDepartmentStats() {
        return this.dashboardService.getDepartmentStats();
    }

    @Get('leave-requests')
    @ApiOperation({ summary: 'Get pending leave requests' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
    async getPendingLeaveRequests(@Query('limit') limit: number = 5) {
        return this.dashboardService.getPendingLeaveRequests(limit);
    }
}

