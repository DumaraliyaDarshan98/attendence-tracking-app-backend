import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { City, CityDocument } from '../models/city.model';
import { State, StateDocument } from '../models/state.model';

@Injectable()
export class CityService {
  constructor(
    @InjectModel(City.name) private cityModel: Model<CityDocument>,
    @InjectModel(State.name) private stateModel: Model<StateDocument>,
  ) {}

  async create(createCityDto: { name: string; state: string }): Promise<City> {
    const { name, state } = createCityDto;

    // Validate and convert state to ObjectId
    if (!Types.ObjectId.isValid(state)) {
      throw new BadRequestException('Invalid state ID format');
    }
    
    const stateObjectId = new Types.ObjectId(state);

    // Verify state exists
    const stateExists = await this.stateModel.findById(stateObjectId);
    if (!stateExists) {
      throw new NotFoundException('State not found');
    }

    // Check if city with this name already exists in the same state
    const existingCity = await this.cityModel.findOne({ name, state: stateObjectId });
    if (existingCity) {
      throw new ConflictException('City with this name already exists in the state');
    }

    const city = new this.cityModel({
      name,
      state: stateObjectId,
    });

    return city.save();
  }

  async findAll(): Promise<City[]> {
    return this.cityModel.find().populate('state', 'name code').sort({ name: 1 }).exec();
  }

  async findByState(stateId: string): Promise<City[]> {
    console.log('stateId', stateId);
    
    // Validate and convert stateId to ObjectId
    if (!Types.ObjectId.isValid(stateId)) {
      throw new BadRequestException('Invalid state ID format');
    }
    
    const objectId = new Types.ObjectId(stateId);
    
    // Verify state exists
    const stateExists = await this.stateModel.findById(objectId);
    if (!stateExists) {
      throw new NotFoundException('State not found');
    }
    
    return this.cityModel.find({ state: objectId }).populate('state', 'name code').sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<City> {
    const city = await this.cityModel.findById(id).populate('state', 'name code').exec();
    if (!city) {
      throw new NotFoundException('City not found');
    }
    return city;
  }

  async update(id: string, updateCityDto: { name?: string; state?: string }): Promise<City> {
    const { state } = updateCityDto;
    
    // If state is being updated, verify it exists
    if (state) {
      if (!Types.ObjectId.isValid(state)) {
        throw new BadRequestException('Invalid state ID format');
      }
      
      const stateObjectId = new Types.ObjectId(state);
      const stateExists = await this.stateModel.findById(stateObjectId);
      if (!stateExists) {
        throw new NotFoundException('State not found');
      }
      
      // Update the state in the DTO to use ObjectId
      updateCityDto.state = stateObjectId as any;
    }

    const city = await this.cityModel
      .findByIdAndUpdate(id, updateCityDto, { new: true })
      .populate('state', 'name code')
      .exec();

    if (!city) {
      throw new NotFoundException('City not found');
    }
    return city;
  }

  async remove(id: string): Promise<void> {
    const result = await this.cityModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('City not found');
    }
  }

  async createMany(statesWithCities: { code: string; name: string; cities: string[] }[]): Promise<City[]> {
    const createdCities: City[] = [];
    
    for (const stateData of statesWithCities) {
      const { code, cities } = stateData;
      
      // Find state by code
      const state = await this.stateModel.findOne({ code });
      if (!state) {
        throw new NotFoundException(`State with code '${code}' not found`);
      }

      // Create cities for this state
      for (const cityName of cities) {
        // Check if city already exists in this state
        const existingCity = await this.cityModel.findOne({ 
          name: cityName, 
          state: state._id 
        });
        
        if (!existingCity) {
          const city = new this.cityModel({
            name: cityName,
            state: state._id,
          });
          
          const savedCity = await city.save();
          await savedCity.populate('state', 'name code');
          createdCities.push(savedCity);
        }
      }
    }
    
    return createdCities;
  }
}
