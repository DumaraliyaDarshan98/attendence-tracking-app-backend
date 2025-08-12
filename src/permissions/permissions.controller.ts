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
import { PermissionsService } from './permissions.service';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  CreatePermissionResponseDto,
  UpdatePermissionResponseDto,
  PermissionsListResponseDto,
  PermissionResponseDto,
} from './dto/permission-response.dto';
import { PermissionResponseWrapperDto } from '../common/dto/standard-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
  NotFoundErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  ConflictErrorResponseDto,
} from '../common/dto/error-response.dto';

@ApiTags('Permissions')
@Controller('permissions')
@ApiBearerAuth('JWT-auth')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new permission',
    description: 'Create a new permission with module and action. Permission names should follow the format "module:action".'
  })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: PermissionResponseWrapperDto,
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
    description: 'Conflict - Permission with this name already exists',
    type: ConflictErrorResponseDto,
  })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all permissions',
    description: 'Retrieve a paginated list of all permissions. Supports search, sorting, and pagination.'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for permission name, module, or action', example: 'users' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc or desc)', example: 'desc' })
  @ApiResponse({
    status: 200,
    description: 'List of permissions retrieved successfully',
    type: PermissionResponseWrapperDto,
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
    return this.permissionsService.findAll();
  }

  @Get('module/:module')
  @ApiOperation({ 
    summary: 'Get permissions by module',
    description: 'Retrieve all permissions for a specific module.'
  })
  @ApiParam({ 
    name: 'module', 
    description: 'Module name to filter permissions',
    example: 'users'
  })
  @ApiResponse({
    status: 200,
    description: 'List of permissions for the module retrieved successfully',
    type: PermissionResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid module parameter',
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
  findByModule(@Param('module') module: string) {
    return this.permissionsService.findByModule(module);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get permission by ID',
    description: 'Retrieve a specific permission by its ID.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Permission ID (MongoDB ObjectId)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @ApiResponse({
    status: 200,
    description: 'Permission found successfully',
    type: PermissionResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid permission ID format',
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
    description: 'Not Found - Permission not found',
    type: NotFoundErrorResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update permission by ID',
    description: 'Update a specific permission. Cannot update permission name if it conflicts with existing permissions.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Permission ID (MongoDB ObjectId)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: PermissionResponseWrapperDto,
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
    description: 'Not Found - Permission not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Permission name already exists',
    type: ConflictErrorResponseDto,
  })
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete permission by ID',
    description: 'Delete a specific permission. Cannot delete permissions that are assigned to roles.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Permission ID (MongoDB ObjectId)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @ApiResponse({
    status: 204,
    description: 'Permission deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid permission ID format',
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
    description: 'Not Found - Permission not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Cannot delete permission that is assigned to roles',
    type: ConflictErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
} 