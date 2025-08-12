import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, IsMongoId, IsMobilePhone } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  readonly firstname: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  readonly lastname: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  readonly password: string;

  @ApiProperty({
    description: 'Mobile number of the user',
    example: '+1234567890',
  })
  @IsMobilePhone()
  readonly mobilenumber: string;

  @ApiPropertyOptional({
    description: 'Role ID for the user (optional)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0',
  })
  @IsOptional()
  @IsMongoId()
  readonly role?: string;

  @ApiPropertyOptional({
    description: 'First line of address',
    example: '123 Main Street',
  })
  @IsOptional()
  @IsString()
  readonly addressline1?: string;

  @ApiPropertyOptional({
    description: 'Second line of address',
    example: 'Apt 4B',
  })
  @IsOptional()
  @IsString()
  readonly addressline2?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  readonly city?: string;

  @ApiPropertyOptional({
    description: 'State or province',
    example: 'NY',
  })
  @IsOptional()
  @IsString()
  readonly state?: string;

  @ApiPropertyOptional({
    description: 'Center or district',
    example: 'Manhattan',
  })
  @IsOptional()
  @IsString()
  readonly center?: string;

  @ApiPropertyOptional({
    description: 'Postal/ZIP code',
    example: '10001',
  })
  @IsOptional()
  @IsString()
  readonly pincode?: string;
}
