import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from '../models/audit-log.model';
import { UsersModule } from '../users/users.module';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { JwtModule } from '@nestjs/jwt';
import { appConfig } from '../config/app.config';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RolesModule } from '../roles/roles.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => RolesModule),
    SessionsModule,
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: { expiresIn: appConfig.jwtExpiresIn },
    }),
  ],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, AuthGuard, PermissionGuard],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}


