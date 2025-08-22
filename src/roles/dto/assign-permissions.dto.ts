import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RolePermissionDto } from './create-role.dto';

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'Array of module permissions to assign to the role',
    example: [
      { module: 'users', actions: ['read', 'list', 'create'] },
      { module: 'attendance', actions: ['read', 'list', 'export'] },
      { module: 'leave', actions: ['read', 'list', 'approve', 'reject'] }
    ],
    type: [RolePermissionDto],
    minItems: 1,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionDto)
  readonly permissions: RolePermissionDto[];
} 