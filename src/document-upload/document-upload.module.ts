import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { DocumentUploadController } from './document-upload.controller';
import { DocumentUploadService } from './document-upload.service';
import { Document, DocumentSchema } from '../models/document.model';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    UsersModule,
  ],
  controllers: [DocumentUploadController],
  providers: [DocumentUploadService],
  exports: [DocumentUploadService],
})
export class DocumentUploadModule {}
