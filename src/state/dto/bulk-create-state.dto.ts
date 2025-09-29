import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStateDto } from './create-state.dto';

export class BulkCreateStateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStateDto)
  states: CreateStateDto[];
}
