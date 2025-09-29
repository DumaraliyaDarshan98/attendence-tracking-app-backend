import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { City, CitySchema } from '../models/city.model';
import { State, StateSchema } from '../models/state.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: City.name, schema: CitySchema },
      { name: State.name, schema: StateSchema }
    ])
  ],
  controllers: [CityController],
  providers: [CityService],
  exports: [CityService],
})
export class CityModule {}
