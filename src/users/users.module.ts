import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../models/user.model';
import { AuthGuard } from '../guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { appConfig } from '../config/app.config';
import { RolesModule } from '../roles/roles.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: { expiresIn: appConfig.jwtExpiresIn },
    }),
    forwardRef(() => RolesModule),
    forwardRef(() => AuditLogsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthGuard],
  exports: [UsersService],
})
export class UsersModule {} 