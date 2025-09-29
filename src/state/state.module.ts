import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StateService } from './state.service';
import { StateController } from './state.controller';
import { State, StateSchema } from '../models/state.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: State.name, schema: StateSchema }])],
  controllers: [StateController],
  providers: [StateService],
  exports: [StateService],
})
export class StateModule {}
