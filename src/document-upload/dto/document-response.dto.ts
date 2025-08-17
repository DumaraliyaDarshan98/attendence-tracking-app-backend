import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({
    description: 'Document ID',
    example: '64f8a1b2c3d4e5f6a7b8c9d0',
  })
  _id: string;

  @ApiProperty({
    description: 'Name of the uploaded file',
    example: 'site_plan.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'Original name of the file',
    example: 'site_plan.pdf',
  })
  originalFileName: string;

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

  @ApiProperty({
    description: 'Whether the document is active',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Description of the document',
    example: 'Site plan for construction project',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorizing the document',
    example: ['construction', 'site-plan', 'pdf'],
  })
  tags?: string[];

  @ApiProperty({
    description: 'Category of the document',
    example: 'document',
  })
  category: string;

  @ApiProperty({
    description: 'Date when the document was created',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the document was last updated',
    example: '2024-01-15T10:00:00.000Z',
  })
  updatedAt: Date;
}

export class UploadDocumentResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Document uploaded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Uploaded document information',
    type: DocumentResponseDto,
  })
  document: DocumentResponseDto;
}

export class UploadMultipleDocumentsResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Documents uploaded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Number of documents uploaded',
    example: 3,
  })
  count: number;

  @ApiProperty({
    description: 'Array of uploaded documents',
    type: [DocumentResponseDto],
  })
  documents: DocumentResponseDto[];
}

export class DocumentsListResponseDto {
  @ApiProperty({
    description: 'Array of documents',
    type: [DocumentResponseDto],
  })
  documents: DocumentResponseDto[];

  @ApiProperty({
    description: 'Total number of documents',
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
