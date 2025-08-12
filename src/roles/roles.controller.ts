import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import {
  CreateRoleResponseDto,
  UpdateRoleResponseDto,
  RolesListResponseDto,
  RoleResponseDto,
} from './dto/role-response.dto';
import { RoleResponseWrapperDto } from '../common/dto/standard-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
  NotFoundErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  ConflictErrorResponseDto,
} from '../common/dto/error-response.dto';

@ApiTags('Roles')
@Controller('roles')
@ApiBearerAuth('JWT-auth')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new role',
    description: 'Create a new role with specified permissions. Only super admins can create roles with super admin privileges.'
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Role with this name already exists',
    type: ConflictErrorResponseDto,
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all roles',
    description: 'Retrieve a paginated list of all roles with their permissions. Supports search, sorting, and pagination.'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for role name or display name', example: 'admin' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc or desc)', example: 'desc' })
  @ApiResponse({
    status: 200,
    description: 'List of roles retrieved successfully',
    type: RoleResponseWrapperDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ForbiddenErrorResponseDto,
  })
  findAll(@Query() query: PaginationQueryDto) {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get role by ID',
    description: 'Retrieve a specific role by its ID with all assigned permissions.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Role ID (MongoDB ObjectId)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @ApiResponse({
    status: 200,
    description: 'Role found successfully',
    type: RoleResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid role ID format',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Role not found',
    type: NotFoundErrorResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update role by ID',
    description: 'Update a specific role. Cannot update super admin privileges unless you are a super admin.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Role ID (MongoDB ObjectId)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Role not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Role name already exists',
    type: ConflictErrorResponseDto,
  })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete role by ID',
    description: 'Delete a specific role. Cannot delete roles that are assigned to users or super admin roles.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Role ID (MongoDB ObjectId)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @ApiResponse({
    status: 204,
    description: 'Role deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid role ID format',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Role not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Cannot delete role that is assigned to users',
    type: ConflictErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  @ApiOperation({ 
    summary: 'Assign permissions to role',
    description: 'Assign specific permissions to a role. This will replace all existing permissions for the role.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Role ID (MongoDB ObjectId)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions assigned successfully',
    type: RoleResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error or invalid permission IDs',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Role or some permissions not found',
    type: NotFoundErrorResponseDto,
  })
  assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(id, assignPermissionsDto.permissionIds);
  }
} 