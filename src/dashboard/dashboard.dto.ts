import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 150, description: 'Total number of employees' })
  totalEmployees: number;

  @ApiProperty({ example: 120, description: 'Number of employees present today' })
  presentToday: number;

  @ApiProperty({ example: 5, description: 'Number of employees on leave today' })
  onLeave: number;

  @ApiProperty({ example: 3, description: 'Number of new leave requests' })
  newRequests: number;
}

export class ActivityFeedParamsDto {
  @ApiProperty({ required: false, example: 10, description: 'Number of items to return' })
  limit?: number;
}

export class RecentActivityDto {
  @ApiProperty({ example: 'John Doe', description: 'User name' })
  user: string;

  @ApiProperty({ example: 'checked in', description: 'Action description' })
  action: string;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z', description: 'Time of activity' })
  time: Date | string;

  @ApiProperty({ example: 'attendance', enum: ['attendance', 'leave', 'user'], description: 'Type of activity' })
  type: string;

  @ApiProperty({ required: false, example: 'https://ui-avatars.com/api/?name=John+Doe', description: 'User avatar URL' })
  userAvatar?: string;
}

export class DepartmentStatDto {
  @ApiProperty({ example: 'North Center', description: 'Department or Center name' })
  department: string;

  @ApiProperty({ example: 45, description: 'Number of present employees' })
  present: number;

  @ApiProperty({ example: 50, description: 'Total employees in department' })
  total: number;
}

