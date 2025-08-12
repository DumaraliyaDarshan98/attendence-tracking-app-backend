import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, IsEnum, IsBoolean, IsMobilePhone } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'First name of the user',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  readonly firstname?: string;

  @ApiPropertyOptional({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  readonly lastname?: string;

  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional({
    description: 'Password for the user account',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  readonly password?: string;

  @ApiPropertyOptional({
    description: 'Role ID for the user (optional)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0',
  })
  @IsOptional()
  @IsString()
  readonly role?: string;

  @ApiPropertyOptional({
    description: 'Mobile number of the user',
    example: '+1234567890',
  })
  @IsOptional()
  @IsMobilePhone()
  readonly mobilenumber?: string;

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

  @ApiPropertyOptional({
    description: 'Whether the user account is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
} 