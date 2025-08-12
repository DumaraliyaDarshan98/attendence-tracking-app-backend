import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}

export class StandardResponseDto<T> {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: 'Status message',
    example: 'OK',
    enum: ['OK', 'Created', 'Accepted', 'No Content', 'Bad Request', 'Unauthorized', 'Forbidden', 'Not Found', 'Conflict', 'Unprocessable Entity', 'Internal Server Error', 'Service Unavailable'],
  })
  status: string;

  @ApiProperty({
    description: 'Response data',
    example: 'Response data will be here',
  })
  data: T;

  @ApiPropertyOptional({
    description: 'Pagination information (if applicable)',
    type: PaginationDto,
  })
  pagination?: PaginationDto;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2023-09-06T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/users',
  })
  path: string;
}

// Generic response DTOs for different data types
export class UserResponseWrapperDto extends StandardResponseDto<any> {
  @ApiProperty({
    description: 'User data',
    example: {
      _id: '64f8a1b2c3d4e5f6a7b8c9d0',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      role: 'user',
      mobilenumber: '+1234567890',
      addressline1: '123 Main Street',
      addressline2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      center: 'Manhattan',
      pincode: '10001',
      isActive: true,
      createdAt: '2023-09-06T10:30:00.000Z',
      updatedAt: '2023-09-06T10:30:00.000Z',
    },
  })
  declare data: any;
}

export class UsersListResponseWrapperDto extends StandardResponseDto<any> {
  @ApiProperty({
    description: 'Users list data',
    example: {
      users: [
        {
          _id: '64f8a1b2c3d4e5f6a7b8c9d0',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          role: {
            _id: '64f8a1b2c3d4e5f6a7b8c9d0',
            name: 'user',
            displayName: 'User',
            description: 'Basic user with limited access'
          },
          mobilenumber: '+1234567890',
          addressline1: '123 Main Street',
          addressline2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          center: 'Manhattan',
          pincode: '10001',
          isActive: true,
          createdAt: '2023-09-06T10:30:00.000Z',
          updatedAt: '2023-09-06T10:30:00.000Z',
        },
      ],
    },
  })
  declare data: any;

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  declare pagination: PaginationDto;
}

export class RoleResponseWrapperDto extends StandardResponseDto<any> {
  @ApiProperty({
    description: 'Role data',
    example: {
      _id: '64f8a1b2c3d4e5f6a7b8c9d0',
      name: 'admin',
      displayName: 'Administrator',
      description: 'Administrator role',
      isSuperAdmin: false,
      isActive: true,
      permissions: [],
      createdAt: '2023-09-06T10:30:00.000Z',
      updatedAt: '2023-09-06T10:30:00.000Z',
    },
  })
  declare data: any;
}

export class PermissionResponseWrapperDto extends StandardResponseDto<any> {
  @ApiProperty({
    description: 'Permission data',
    example: {
      _id: '64f8a1b2c3d4e5f6a7b8c9d0',
      name: 'users:create',
      module: 'users',
      action: 'create',
      description: 'Create new users',
      isActive: true,
      createdAt: '2023-09-06T10:30:00.000Z',
      updatedAt: '2023-09-06T10:30:00.000Z',
    },
  })
  declare data: any;
}

export class AuthResponseWrapperDto extends StandardResponseDto<any> {
  @ApiProperty({
    description: 'Authentication data',
    example: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: '64f8a1b2c3d4e5f6a7b8c9d0',
        email: 'john.doe@example.com',
        firstname: 'John',
        lastname: 'Doe',
        role: {
          _id: '64f8a1b2c3d4e5f6a7b8c9d0',
          name: 'user',
          displayName: 'User',
          description: 'Basic user with limited access'
        },
      },
    },
  })
  declare data: any;
}

