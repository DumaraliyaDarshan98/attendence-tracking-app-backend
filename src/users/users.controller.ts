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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserResponseDto,
  CreateUserResponseDto,
  UpdateUserResponseDto,
  UsersListResponseDto,
} from './dto/user-response.dto';
import { AuthGuard } from '../guards/auth.guard';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
  NotFoundErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  ConflictErrorResponseDto,
} from '../common/dto/error-response.dto';
import {
  UserResponseWrapperDto,
  UsersListResponseWrapperDto,
} from '../common/dto/standard-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Public endpoint to register a new user. No authentication required. Password will be hashed before storage.'
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: UserResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with this email already exists',
    type: ConflictErrorResponseDto,
  })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create(registerUserDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Get the current user profile. Requires authentication token only (no specific permissions required).'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseWrapperDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorResponseDto,
  })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Create a new user with specified role. Password will be hashed before storage.'
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseWrapperDto,
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
    description: 'Conflict - User with this email already exists',
    type: ConflictErrorResponseDto,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieve a paginated list of all users with their roles. Supports search, sorting, and pagination.'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for user name or email', example: 'john' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc or desc)', example: 'desc' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: UsersListResponseWrapperDto,
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
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID with their role information.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID (MongoDB ObjectId)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
    type: UserResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user ID format',
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
    description: 'Not Found - User not found',
    type: NotFoundErrorResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update user by ID',
    description: 'Update a specific user. Password will be hashed if provided.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID (MongoDB ObjectId)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseWrapperDto,
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
    description: 'Not Found - User not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
    type: ConflictErrorResponseDto,
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete user by ID',
    description: 'Delete a specific user. Cannot delete users with super admin roles.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID (MongoDB ObjectId)',
    example: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user ID format',
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
    description: 'Not Found - User not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Cannot delete user with super admin role',
    type: ConflictErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 