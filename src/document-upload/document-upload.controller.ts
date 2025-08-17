import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentUploadService } from './document-upload.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('document-upload')
@UseGuards(AuthGuard)
export class DocumentUploadController {
  constructor(private readonly documentUploadService: DocumentUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
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
}
