import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateStateDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
