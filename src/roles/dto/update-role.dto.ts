import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, MinLength, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RolePermissionDto } from './create-role.dto';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'Unique name for the role (used internally)',
    example: 'content_manager',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Display name for the role (shown to users)',
    example: 'Content Manager',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  readonly displayName?: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
    example: 'Manages content and user permissions',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Whether this role has super admin privileges',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isSuperAdmin?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the role is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Array of module permissions for this role',
    example: [
      { module: 'users', actions: ['read', 'list'] },
      { module: 'attendance', actions: ['read', 'list', 'export'] }
    ],
    type: [RolePermissionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionDto)
  readonly permissions?: RolePermissionDto[];

  @ApiPropertyOptional({
    description: 'Whether this is a system role (cannot be deleted)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isSystemRole?: boolean;
} 