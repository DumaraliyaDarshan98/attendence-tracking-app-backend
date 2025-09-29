import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveManagementModule } from './leave-management/leave-management.module';
import { TourManagementModule } from './tour-management/tour-management.module';
import { DocumentUploadModule } from './document-upload/document-upload.module';
import { StateModule } from './state/state.module';
import { CityModule } from './city/city.module';
import { SeederService } from './database/seeder.service';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, RolesModule, PermissionsModule, AttendanceModule, LeaveManagementModule, TourManagementModule, DocumentUploadModule, StateModule, CityModule],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {}
