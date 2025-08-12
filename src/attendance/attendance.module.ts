import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Attendance, AttendanceSchema } from '../models/attendance.model';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceIndexService } from '../database/init-attendance-indexes';
import { UsersModule } from '../users/users.module';
import { appConfig } from '../config/app.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema }
    ]),
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: { expiresIn: appConfig.jwtExpiresIn },
    }),
    UsersModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceIndexService],
  exports: [AttendanceService],
})
export class AttendanceModule implements OnModuleInit {
  constructor(private readonly attendanceIndexService: AttendanceIndexService) {}

  async onModuleInit() {
    try {
      await this.attendanceIndexService.initializeIndexes();
    } catch (error) {
      console.error('Failed to initialize attendance indexes:', error);
    }
  }
}
