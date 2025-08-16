import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TourStatusHistoryDto {
  @ApiProperty({
    description: 'Status of the tour',
    example: 'in-progress',
  })
  status: string;

  @ApiProperty({
    description: 'ID of the user who changed the status',
    example: '64f8a1b2c3d4e5f6a7b8c9d0',
  })
  changedBy: string;

  @ApiProperty({
    description: 'Name of the user who changed the status',
    example: 'John Doe',
  })
  changedByName: string;

  @ApiPropertyOptional({
    description: 'Notes about the status change',
    example: 'Tour started successfully',
  })
  notes?: string;

  @ApiProperty({
    description: 'When the status was changed',
    example: '2024-01-15T10:00:00.000Z',
  })
  changedAt: Date;
}

export class TourDocumentResponseDto {
  @ApiProperty({
    description: 'Name of the uploaded file',
    example: 'site_plan.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'URL of the uploaded file',
    example: 'https://example.com/uploads/site_plan.pdf',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Type of the file',
    example: 'application/pdf',
  })
  fileType: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 1024000,
  })
  fileSize: number;
}

export class TourResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the tour',
    example: '64f8a1b2c3d4e5f6a7b8c9d0',
  })
  _id: string;

  @ApiProperty({
    description: 'User assigned to the tour',
    example: {
      _id: '64f8a1b2c3d4e5f6a7b8c9d0',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com'
    },
  })
  assignedTo: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };

  @ApiProperty({
    description: 'User who created the tour',
    example: {
      _id: '64f8a1b2c3d4e5f6a7b8c9d1',
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@example.com'
    },
  })
  createdBy: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };

  @ApiProperty({
    description: 'Purpose of the site visit',
    example: 'Site inspection for new construction project',
  })
  purpose: string;

  @ApiProperty({
    description: 'Location of the site visit',
    example: '123 Main Street, Downtown Area, City',
  })
  location: string;

  @ApiProperty({
    description: 'Expected time for the site visit',
    example: '2024-01-15T10:00:00.000Z',
  })
  expectedTime: Date;

  @ApiProperty({
    description: 'Array of documents related to the tour',
    type: [TourDocumentResponseDto],
  })
  documents: TourDocumentResponseDto[];

  @ApiPropertyOptional({
    description: 'Additional notes from the user',
    example: 'Need to check electrical connections and plumbing',
  })
  userNotes?: string;

  @ApiProperty({
    description: 'Current status of the tour',
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled', 'approved', 'rejected'],
    example: 'in-progress',
  })
  status: string;

  @ApiProperty({
    description: 'History of status changes',
    type: [TourStatusHistoryDto],
  })
  statusHistory: TourStatusHistoryDto[];

  @ApiPropertyOptional({
    description: 'Admin notes for the tour',
    example: 'Priority: High - Client requested urgent inspection',
  })
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Actual time when the user visited the site',
    example: '2024-01-15T10:30:00.000Z',
  })
  actualVisitTime?: Date;

  @ApiPropertyOptional({
    description: 'Notes when the tour is completed',
    example: 'Site inspection completed successfully. All systems working properly.',
  })
  completionNotes?: string;

  @ApiProperty({
    description: 'Whether the tour is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Date when the tour was created',
    example: '2024-01-15T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the tour was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class ToursListResponseDto {
  @ApiProperty({
    description: 'Array of tours',
    type: [TourResponseDto],
  })
  tours: TourResponseDto[];

  @ApiProperty({
    description: 'Total number of tours',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;
}
