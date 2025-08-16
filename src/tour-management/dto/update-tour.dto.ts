import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsArray, IsMongoId, IsNotEmpty, IsEnum } from 'class-validator';
import { TourDocumentDto } from './create-tour.dto';

export class UpdateTourDto {
  @ApiPropertyOptional({
    description: 'ID of the user assigned to the tour',
    example: '64f8a1b2c3d4e5f6a7b8c9d0',
  })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Purpose of the site visit',
    example: 'Site inspection for new construction project',
    minLength: 10,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  purpose?: string;

  @ApiPropertyOptional({
    description: 'Location of the site visit',
    example: '123 Main Street, Downtown Area, City',
    minLength: 5,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @ApiPropertyOptional({
    description: 'Expected time for the site visit',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expectedTime?: string;

  @ApiPropertyOptional({
    description: 'Array of documents related to the tour',
    type: [TourDocumentDto],
  })
  @IsOptional()
  @IsArray()
  documents?: TourDocumentDto[];

  @ApiPropertyOptional({
    description: 'Additional notes from the user',
    example: 'Need to check electrical connections and plumbing',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  userNotes?: string;

  @ApiPropertyOptional({
    description: 'Admin notes for the tour',
    example: 'Priority: High - Client requested urgent inspection',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Status of the tour',
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled', 'approved', 'rejected'],
    example: 'in-progress',
  })
  @IsOptional()
  @IsEnum(['pending', 'assigned', 'in-progress', 'completed', 'cancelled', 'approved', 'rejected'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Actual time when the user visited the site',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  actualVisitTime?: string;

  @ApiPropertyOptional({
    description: 'Notes when the tour is completed',
    example: 'Site inspection completed successfully. All systems working properly.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  completionNotes?: string;
}
