import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class UpdateTourStatusDto {
  @ApiProperty({
    description: 'New status for the tour',
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled', 'approved', 'rejected'],
    example: 'in-progress',
  })
  @IsEnum(['pending', 'assigned', 'in-progress', 'completed', 'cancelled', 'approved', 'rejected'])
  status: string;

  @ApiPropertyOptional({
    description: 'Notes about the status change',
    example: 'Tour started successfully. User arrived at site.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Actual visit time (required when status is in-progress)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  actualVisitTime?: string;

  @ApiPropertyOptional({
    description: 'Completion notes (required when status is completed)',
    example: 'Site inspection completed successfully. All systems working properly.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  completionNotes?: string;
}
