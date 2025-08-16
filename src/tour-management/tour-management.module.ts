import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TourManagementService } from './tour-management.service';
import { TourManagementController } from './tour-management.controller';
import { Tour, TourSchema } from '../models/tour.model';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { appConfig } from '../config/app.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tour.name, schema: TourSchema }]),
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: { expiresIn: appConfig.jwtExpiresIn },
    }),
    UsersModule,
  ],
  controllers: [TourManagementController],
  providers: [TourManagementService],
  exports: [TourManagementService],
})
export class TourManagementModule {}
