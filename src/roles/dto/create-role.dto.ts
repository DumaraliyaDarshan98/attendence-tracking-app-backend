import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, MinLength, MaxLength, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class RolePermissionDto {
  @ApiProperty({
    description: 'Module name for the permission',
    example: 'users',
    enum: ['users', 'roles', 'permissions', 'attendance', 'leave', 'holiday', 'tour', 'timelog', 'reports']
  })
  @IsString()
  readonly module: string;

  @ApiProperty({
    description: 'Array of actions allowed for this module',
    example: ['create', 'read', 'update', 'list'],
    type: [String],
    enum: ['create', 'read', 'update', 'delete', 'list', 'approve', 'reject', 'export']
  })
  @IsArray()
  @IsString({ each: true })
  readonly actions: string[];
}

export class CreateRoleDto {
  @ApiProperty({
    description: 'Unique name for the role (used internally)',
    example: 'content_manager',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  readonly name: string;

  @ApiProperty({
    description: 'Display name for the role (shown to users)',
    example: 'Content Manager',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  readonly displayName: string;

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
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isSuperAdmin?: boolean;

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
} 