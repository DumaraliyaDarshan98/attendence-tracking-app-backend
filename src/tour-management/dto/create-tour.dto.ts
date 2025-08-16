import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class TourDocumentDto {
  @ApiProperty({
    description: 'Name of the uploaded file',
    example: 'site_plan.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'URL of the uploaded file',
    example: 'https://example.com/uploads/site_plan.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    description: 'Type of the file',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 1024000,
  })
  @IsNotEmpty()
  fileSize: number;
}

export class CreateTourDto {
  @ApiProperty({
    description: 'ID of the user assigned to the tour',
    example: '64f8a1b2c3d4e5f6a7b8c9d0',
  })
  @IsMongoId()
  assignedTo: string;

  @ApiProperty({
    description: 'Purpose of the site visit',
    example: 'Site inspection for new construction project',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({
    description: 'Location of the site visit',
    example: '123 Main Street, Downtown Area, City',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Expected time for the site visit',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsDateString()
  expectedTime: string;

  @ApiPropertyOptional({
    description: 'Array of documents related to the tour',
    type: [TourDocumentDto],
    example: [
      {
        fileName: 'site_plan.pdf',
        fileUrl: 'https://example.com/uploads/site_plan.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000
      }
    ],
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
}
