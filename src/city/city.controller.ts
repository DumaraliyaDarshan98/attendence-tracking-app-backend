import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { BulkCreateCityDto } from './dto/bulk-create-city.dto';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCityDto: CreateCityDto) {
    return this.cityService.create(createCityDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async createMany(@Body() bulkCreateCityDto: BulkCreateCityDto) {
    return this.cityService.createMany(bulkCreateCityDto.states);
  }

  @Get()
  async findAll(@Query('state') stateId?: string) {
    console.log('stateId', stateId);
    if (stateId) {
      return this.cityService.findByState(stateId);
    }
    return this.cityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.cityService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.cityService.update(id, updateCityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.cityService.remove(id);
  }
}
