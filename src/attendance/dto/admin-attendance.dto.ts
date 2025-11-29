import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half-day'
}

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'User ID for whom attendance is being created',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Date for the attendance record (YYYY-MM-DD format)',
    example: '2024-01-15'
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Check-in time (HH:MM format)',
    example: '09:00'
  })
  @IsString()
  checkInTime: string;

  @ApiPropertyOptional({
    description: 'Check-out time (HH:MM format)',
    example: '17:00'
  })
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiProperty({
    description: 'Attendance status',
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({
    description: 'Additional notes for the attendance record',
    example: 'Admin created entry'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Session number for the day',
    example: 1,
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  sessionNumber?: number;

  @ApiPropertyOptional({
    description: 'Check-in latitude',
    example: 40.7128,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  checkInLatitude?: number;

  @ApiPropertyOptional({
    description: 'Check-in longitude',
    example: -74.0060,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  checkInLongitude?: number;

  @ApiPropertyOptional({
    description: 'Check-out latitude',
    example: 40.7128,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  checkOutLatitude?: number;

  @ApiPropertyOptional({
    description: 'Check-out longitude',
    example: -74.0060,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  checkOutLongitude?: number;
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({
    description: 'User ID for whom attendance is being updated',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Date for the attendance record (YYYY-MM-DD format)',
    example: '2024-01-15'
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Check-in time (HH:MM format)',
    example: '09:00'
  })
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @ApiPropertyOptional({
    description: 'Check-out time (HH:MM format)',
    example: '17:00'
  })
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiPropertyOptional({
    description: 'Attendance status',
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({
    description: 'Additional notes for the attendance record',
    example: 'Admin updated entry'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Session number for the day',
    example: 1,
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  sessionNumber?: number;

  @ApiPropertyOptional({
    description: 'Check-in latitude',
    example: 40.7128,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  checkInLatitude?: number;

  @ApiPropertyOptional({
    description: 'Check-in longitude',
    example: -74.0060,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  checkInLongitude?: number;

  @ApiPropertyOptional({
    description: 'Check-out latitude',
    example: 40.7128,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  checkOutLatitude?: number;

  @ApiPropertyOptional({
    description: 'Check-out longitude',
    example: -74.0060,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  checkOutLongitude?: number;
}
