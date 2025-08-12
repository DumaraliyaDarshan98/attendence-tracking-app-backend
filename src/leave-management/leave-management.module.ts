import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { LeaveManagementController } from './leave-management.controller';
import { LeaveManagementService } from './leave-management.service';
import { Holiday, HolidaySchema } from '../models/holiday.model';
import { LeaveRequest, LeaveRequestSchema } from '../models/leave-request.model';
import { UsersModule } from '../users/users.module';
import { appConfig } from '../config/app.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Holiday.name, schema: HolidaySchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema }
    ]),
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: { expiresIn: appConfig.jwtExpiresIn },
    }),
    UsersModule
  ],
  controllers: [LeaveManagementController],
  providers: [LeaveManagementService],
  exports: [LeaveManagementService]
})
export class LeaveManagementModule {}
