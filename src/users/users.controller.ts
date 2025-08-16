import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (Public endpoint)' })
  @ApiBody({
    description: 'User registration data',
    schema: {
      type: 'object',
      properties: {
        firstname: { type: 'string', example: 'John', description: 'First name of the user' },
        lastname: { type: 'string', example: 'Doe', description: 'Last name of the user' },
        email: { type: 'string', format: 'email', example: 'john.doe@example.com', description: 'Email address' },
        password: { type: 'string', example: 'password123', description: 'Password (min 6 characters)' },
        mobilenumber: { type: 'string', example: '+1234567890', description: 'Mobile number' },
        role: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0', description: 'Role ID (optional)' },
        addressline1: { type: 'string', example: '123 Main Street', description: 'Address line 1' },
        addressline2: { type: 'string', example: 'Apt 4B', description: 'Address line 2 (optional)' },
        city: { type: 'string', example: 'New York', description: 'City' },
        state: { type: 'string', example: 'NY', description: 'State or province' },
        center: { type: 'string', example: 'Manhattan', description: 'Center or district (optional)' },
        pincode: { type: 'string', example: '10001', description: 'Postal/ZIP code' }
      },
      required: ['firstname', 'lastname', 'email', 'password', 'mobilenumber', 'addressline1', 'city', 'state', 'pincode']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 201 },
        status: { type: 'string', example: 'Created' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            role: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
                name: { type: 'string', example: 'user' },
                displayName: { type: 'string', example: 'User' },
                description: { type: 'string', example: 'Regular user role' },
                isActive: { type: 'boolean', example: true }
              }
            },
            mobilenumber: { type: 'string', example: '+1234567890' },
            addressline1: { type: 'string', example: '123 Main Street' },
            addressline2: { type: 'string', example: 'Apt 4B' },
            city: { type: 'string', example: 'New York' },
            state: { type: 'string', example: 'NY' },
            center: { type: 'string', example: 'Manhattan' },
            pincode: { type: 'string', example: '10001' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/users/register' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.usersService.create(registerUserDto);
    return {
      code: 201,
      status: 'Created',
      data: user,
      timestamp: new Date().toISOString(),
      path: '/api/users/register'
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            role: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
                name: { type: 'string', example: 'user' },
                displayName: { type: 'string', example: 'User' },
                description: { type: 'string', example: 'Basic user with limited access' },
                isActive: { type: 'boolean', example: true }
              }
            },
            mobilenumber: { type: 'string', example: '+1234567890' },
            addressline1: { type: 'string', example: '123 Main Street' },
            addressline2: { type: 'string', example: 'Apt 4B' },
            city: { type: 'string', example: 'New York' },
            state: { type: 'string', example: 'NY' },
            center: { type: 'string', example: 'Manhattan' },
            pincode: { type: 'string', example: '10001' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/users/profile' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user._id);
    return {
      code: 200,
      status: 'OK',
      data: user,
      timestamp: new Date().toISOString(),
      path: '/api/users/profile'
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new user (Protected endpoint)' })
  @ApiBody({
    description: 'User creation data',
    schema: {
      type: 'object',
      properties: {
        firstname: { type: 'string', example: 'John', description: 'First name of the user' },
        lastname: { type: 'string', example: 'Doe', description: 'Last name of the user' },
        email: { type: 'string', format: 'email', example: 'john.doe@example.com', description: 'Email address' },
        password: { type: 'string', example: 'password123', description: 'Password (min 6 characters)' },
        role: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0', description: 'Role ID (optional)' },
        mobilenumber: { type: 'string', example: '+1234567890', description: 'Mobile number' },
        addressline1: { type: 'string', example: '123 Main Street', description: 'Address line 1' },
        addressline2: { type: 'string', example: 'Apt 4B', description: 'Address line 2 (optional)' },
        city: { type: 'string', example: 'New York', description: 'City' },
        state: { type: 'string', example: 'NY', description: 'State or province' },
        center: { type: 'string', example: 'Manhattan', description: 'Center or district (optional)' },
        pincode: { type: 'string', example: '10001', description: 'Postal/ZIP code' }
      },
      required: ['firstname', 'lastname', 'email', 'password', 'mobilenumber', 'addressline1', 'city', 'state', 'pincode']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
        firstname: { type: 'string', example: 'John' },
        lastname: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            name: { type: 'string', example: 'user' },
            displayName: { type: 'string', example: 'User' },
            description: { type: 'string', example: 'Basic user with limited access' }
          }
        },
        mobilenumber: { type: 'string', example: '+1234567890' },
        addressline1: { type: 'string', example: '123 Main Street' },
        addressline2: { type: 'string', example: 'Apt 4B' },
        city: { type: 'string', example: 'New York' },
        state: { type: 'string', example: 'NY' },
        center: { type: 'string', example: 'Manhattan' },
        pincode: { type: 'string', example: '10001' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users (Protected endpoint)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term', example: 'john' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order', example: 'desc' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'string', example: 'OK' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
              firstname: { type: 'string', example: 'John' },
              lastname: { type: 'string', example: 'Doe' },
              email: { type: 'string', example: 'john.doe@example.com' },
              role: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
                  name: { type: 'string', example: 'user' },
                  displayName: { type: 'string', example: 'User' },
                  description: { type: 'string', example: 'Basic user with limited access' }
                }
              },
              mobilenumber: { type: 'string', example: '+1234567890' },
              addressline1: { type: 'string', example: '123 Main Street' },
              addressline2: { type: 'string', example: 'Apt 4B' },
              city: { type: 'string', example: 'New York' },
              state: { type: 'string', example: 'NY' },
              center: { type: 'string', example: 'Manhattan' },
              pincode: { type: 'string', example: '10001' },
              isActive: { type: 'boolean', example: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 25 },
            totalPages: { type: 'number', example: 3 }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/users' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID (Protected endpoint)' })
  @ApiParam({ name: 'id', description: 'User ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiResponse({ 
    status: 200, 
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
        firstname: { type: 'string', example: 'John' },
        lastname: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            name: { type: 'string', example: 'user' },
            displayName: { type: 'string', example: 'User' },
            description: { type: 'string', example: 'Basic user with limited access' }
          }
        },
        mobilenumber: { type: 'string', example: '+1234567890' },
        addressline1: { type: 'string', example: '123 Main Street' },
        addressline2: { type: 'string', example: 'Apt 4B' },
        city: { type: 'string', example: 'New York' },
        state: { type: 'string', example: 'NY' },
        center: { type: 'string', example: 'Manhattan' },
        pincode: { type: 'string', example: '10001' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user (Protected endpoint)' })
  @ApiParam({ name: 'id', description: 'User ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiBody({
    description: 'User update data',
    schema: {
      type: 'object',
      properties: {
        firstname: { type: 'string', example: 'John', description: 'First name of the user' },
        lastname: { type: 'string', example: 'Smith', description: 'Last name of the user' },
        email: { type: 'string', format: 'email', example: 'john.smith@example.com', description: 'Email address' },
        password: { type: 'string', example: 'newpassword123', description: 'New password (min 6 characters)' },
        role: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0', description: 'Role ID' },
        mobilenumber: { type: 'string', example: '+1234567890', description: 'Mobile number' },
        addressline1: { type: 'string', example: '456 Oak Street', description: 'Address line 1' },
        addressline2: { type: 'string', example: 'Suite 2A', description: 'Address line 2 (optional)' },
        city: { type: 'string', example: 'Los Angeles', description: 'City' },
        state: { type: 'string', example: 'CA', description: 'State or province' },
        center: { type: 'string', example: 'Downtown', description: 'Center or district (optional)' },
        pincode: { type: 'string', example: '90210', description: 'Postal/ZIP code' },
        isActive: { type: 'boolean', example: true, description: 'Whether the user account is active' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
        firstname: { type: 'string', example: 'John' },
        lastname: { type: 'string', example: 'Smith' },
        email: { type: 'string', example: 'john.smith@example.com' },
        role: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            name: { type: 'string', example: 'admin' },
            displayName: { type: 'string', example: 'Administrator' },
            description: { type: 'string', example: 'Administrator role' }
          }
        },
        mobilenumber: { type: 'string', example: '+1234567890' },
        addressline1: { type: 'string', example: '456 Oak Street' },
        addressline2: { type: 'string', example: 'Suite 2A' },
        city: { type: 'string', example: 'Los Angeles' },
        state: { type: 'string', example: 'CA' },
        center: { type: 'string', example: 'Downtown' },
        pincode: { type: 'string', example: '90210' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user (Protected endpoint)' })
  @ApiParam({ name: 'id', description: 'User ID', example: '64f8a1b2c3d4e5f6a7b8c9d0' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 