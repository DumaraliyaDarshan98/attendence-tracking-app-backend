import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentDocument } from '../models/document.model';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentUploadService {
  private readonly logger = new Logger(DocumentUploadService.name);
  private readonly uploadDir = 'uploads';

  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
  ) {
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
  ): Promise<any> {
    try {
      // Generate unique filename
      const uniqueFileName = this.generateUniqueFileName(file.originalname);
      const filePath = path.join(this.uploadDir, uniqueFileName);

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Create document record
      const document = new this.documentModel({
        uploadedBy: userId,
        fileName: uniqueFileName,
        originalFileName: file.originalname,
        fileUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${uniqueFileName}`,
        fileType: file.mimetype,
        fileSize: file.size,
        description: '',
        tags: [],
        category: 'document',
      });

      const savedDocument = await document.save();
      this.logger.log(`Document uploaded successfully: ${savedDocument.fileName}`);

      return savedDocument;
    } catch (error) {
      this.logger.error(`Failed to upload document: ${error.message}`);
      throw new BadRequestException('Failed to upload document');
    }
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    const nameWithoutExtension = path.basename(originalName, extension);
    
    return `${nameWithoutExtension}_${timestamp}_${randomString}${extension}`;
  }
}
