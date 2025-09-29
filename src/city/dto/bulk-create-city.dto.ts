import { IsString, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StateWithCitiesDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  cities: string[];
}

export class BulkCreateCityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StateWithCitiesDto)
  states: StateWithCitiesDto[];
}
