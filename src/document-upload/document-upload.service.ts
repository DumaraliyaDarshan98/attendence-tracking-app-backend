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

      // Save file to disk - handle both buffer and path-based uploads
      if (file.buffer) {
        // Memory storage - file has buffer
        fs.writeFileSync(filePath, file.buffer);
      } else if (file.path) {
        // Disk storage - file has path, copy from source
        fs.copyFileSync(file.path, filePath);
      } else {
        throw new BadRequestException('Invalid file data');
      }

      // Create document record
      const document = new this.documentModel({
        uploadedBy: userId,
        fileName: uniqueFileName,
        originalFileName: file.originalname,
        fileUrl: `${'http://147.93.111.92:3100'}/uploads/${uniqueFileName}`,
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

  async uploadMultipleDocuments(
    files: any,
    userId: string,
  ): Promise<any> {
    try {
      const uploadPromises = files.map(async (file) => {
        // Generate unique filename
        const uniqueFileName = this.generateUniqueFileName(file.originalname);
        const filePath = path.join(this.uploadDir, uniqueFileName);

        // Save file to disk - handle both buffer and path-based uploads
        if (file.buffer) {
          // Memory storage - file has buffer
          fs.writeFileSync(filePath, file.buffer);
        } else if (file.path) {
          // Disk storage - file has path, copy from source
          fs.copyFileSync(file.path, filePath);
        } else {
          throw new BadRequestException('Invalid file data');
        }

        // Create document record
        const document = new this.documentModel({
          uploadedBy: userId,
          fileName: uniqueFileName,
          originalFileName: file.originalname,
          fileUrl: `${'http://147.93.111.92:3100'}/uploads/${uniqueFileName}`,
          fileType: file.mimetype,
          fileSize: file.size,
          description: '',
          tags: [],
          category: 'document',
        });

        const savedDocument = await document.save();
        this.logger.log(`Document uploaded successfully: ${savedDocument.fileName}`);

        return {
          fileName: savedDocument.originalFileName,
          fileUrl: savedDocument.fileUrl,
          fileType: savedDocument.fileType,
          fileSize: savedDocument.fileSize,
        };
      });

      const results = await Promise.all(uploadPromises);
      this.logger.log(`Multiple documents uploaded successfully: ${results.length} files`);
      
      return results;
    } catch (error) {
      console.log(
        "error", error
      )
      this.logger.error(`Failed to upload multiple documents: ${error.message}`);
      throw new BadRequestException('Failed to upload multiple documents');
    }
  }
}
