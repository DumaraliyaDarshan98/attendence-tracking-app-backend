import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the authenticated user',
    example: 'oldPassword123',
  })
  @IsString()
  @MinLength(1)
  readonly oldPassword: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters)',
    example: 'newPassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  readonly newPassword: string;

  @ApiProperty({
    description: 'Confirmation of the new password (must match newPassword)',
    example: 'newPassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  readonly confirmPassword: string;
}

