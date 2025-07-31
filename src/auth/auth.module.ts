import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { appConfig } from '../config/app.config';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: { expiresIn: appConfig.jwtExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {} 