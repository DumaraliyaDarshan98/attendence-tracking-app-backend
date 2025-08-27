import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { DocumentUploadService } from './document-upload.service';
import { AuthGuard } from '../guards/auth.guard';
import { 
  ApiTags, 
  ApiOperation, 
  ApiConsumes, 
  ApiBody, 
  ApiResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { MultipleDocumentUploadResponseDto } from './dto/document-response.dto';

@ApiTags('Document Upload')
@ApiBearerAuth()
@Controller('document-upload')
@UseGuards(AuthGuard)
export class DocumentUploadController {
  constructor(private readonly documentUploadService: DocumentUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file to upload (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, JPEG, PNG, GIF, ZIP, RAR)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Document uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            fileName: { type: 'string', example: 'site_plan.pdf' },
            fileUrl: { type: 'string', example: 'https://example.com/uploads/site_plan.pdf' },
            fileSize: { type: 'number', example: 1024000 },
            fileType: { type: 'string', example: 'application/pdf' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - No file uploaded or invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpg|jpeg|png|gif|zip|rar)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req?.user?._id || req?.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const document = await this.documentUploadService.uploadDocument(file, userId);

    return {
      success: true,
      message: 'Document uploaded successfully',
      data: {
        fileName: document.originalFileName,
        fileUrl: document.fileUrl,
        fileSize: document.fileSize,
        fileType: document.fileType,
      }
    };
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow up to 10 files
  @ApiOperation({ summary: 'Upload multiple documents' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Multiple document files to upload (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, JPEG, PNG, GIF, ZIP, RAR)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Multiple documents uploaded successfully',
    type: MultipleDocumentUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - No files uploaded or invalid files' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadMultipleDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    console.log(
      "files", files
    )
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const userId = req?.user?._id || req?.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    try {
      const documents = await this.documentUploadService.uploadMultipleDocuments(files, userId);

      return {
        success: true,
        message: `${documents.length} documents uploaded successfully`,
        data: documents
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload documents: ${error.message}`);
    }
  }
}
