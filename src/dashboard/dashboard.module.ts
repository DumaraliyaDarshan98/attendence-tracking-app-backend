import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User, UserSchema } from '../models/user.model';
import { Attendance, AttendanceSchema } from '../models/attendance.model';
import { LeaveRequest, LeaveRequestSchema } from '../models/leave-request.model';
import { UsersModule } from '../users/users.module';
import { appConfig } from '../config/app.config';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Attendance.name, schema: AttendanceSchema },
            { name: LeaveRequest.name, schema: LeaveRequestSchema },
        ]),
        JwtModule.register({
            secret: appConfig.jwtSecret,
            signOptions: { expiresIn: appConfig.jwtExpiresIn },
        }),
        forwardRef(() => UsersModule),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }

