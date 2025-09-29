import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { StateService } from './state.service';
import { CreateStateDto } from './dto/create-state.dto';
import { BulkCreateStateDto } from './dto/bulk-create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';

@Controller('states')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStateDto: CreateStateDto) {
    return this.stateService.create(createStateDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async createMany(@Body() bulkCreateStateDto: BulkCreateStateDto) {
    return this.stateService.createMany(bulkCreateStateDto.states);
  }

  @Get()
  async findAll() {
    return this.stateService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stateService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateStateDto: UpdateStateDto) {
    return this.stateService.update(id, updateStateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.stateService.remove(id);
  }
}
