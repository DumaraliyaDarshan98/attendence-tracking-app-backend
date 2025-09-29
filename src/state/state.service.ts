import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { State, StateDocument } from '../models/state.model';

@Injectable()
export class StateService {
  constructor(
    @InjectModel(State.name) private stateModel: Model<StateDocument>,
  ) {}

  async create(createStateDto: { code: string; name: string }): Promise<State> {
    const { code, name } = createStateDto;

    // Check if state with this code already exists
    const existingState = await this.stateModel.findOne({ code });
    if (existingState) {
      throw new ConflictException('State with this code already exists');
    }

    const state = new this.stateModel({
      code,
      name,
    });

    return state.save();
  }

  async createMany(statesData: { code: string; name: string }[]): Promise<State[]> {
    try {
      // Clear existing states first
      await this.stateModel.deleteMany({});
      
      // Insert new states
      const states = await this.stateModel.insertMany(statesData);
      return states;
    } catch (error) {
      throw new ConflictException('Error creating states: ' + error.message);
    }
  }

  async findAll(): Promise<State[]> {
    return this.stateModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<State> {
    const state = await this.stateModel.findById(id).exec();
    if (!state) {
      throw new NotFoundException('State not found');
    }
    return state;
  }

  async findByCode(code: string): Promise<State | null> {
    return this.stateModel.findOne({ code }).exec();
  }

  async update(id: string, updateStateDto: { code?: string; name?: string }): Promise<State> {
    const state = await this.stateModel
      .findByIdAndUpdate(id, updateStateDto, { new: true })
      .exec();

    if (!state) {
      throw new NotFoundException('State not found');
    }
    return state;
  }

  async remove(id: string): Promise<void> {
    const result = await this.stateModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('State not found');
    }
  }
}
