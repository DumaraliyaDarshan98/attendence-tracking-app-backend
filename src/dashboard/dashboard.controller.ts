import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
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
    async getStats(@Request() req: any) {
        return this.dashboardService.getStats(req.user);
    }

    @Get('activity')
    @ApiOperation({ summary: 'Get recent activity feed' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    async getActivity(@Request() req: any, @Query('limit') limit: number = 10) {
        return this.dashboardService.getRecentActivity(limit, req.user);
    }

    @Get('department-stats')
    @ApiOperation({ summary: 'Get attendance statistics by department/center' })
    async getDepartmentStats(@Request() req: any) {
        return this.dashboardService.getDepartmentStats(req.user);
    }

    @Get('leave-requests')
    @ApiOperation({ summary: 'Get pending leave requests' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
    async getPendingLeaveRequests(@Request() req: any, @Query('limit') limit: number = 5) {
        return this.dashboardService.getPendingLeaveRequests(limit, req.user);
    }
}

