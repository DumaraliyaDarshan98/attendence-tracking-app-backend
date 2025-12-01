import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '64f8a1b2c3d4e5f6a7b8c9d0',
  })
  _id: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  firstname: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  lastname: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Role of the user (can be role ID or populated role object)',
    example: {
      _id: '64f8a1b2c3d4e5f6a7b8c9d0',
      name: 'user',
      displayName: 'User',
      description: 'Basic user with limited access',
      isActive: true
    },
  })
  role: any;

  @ApiProperty({
    description: 'Mobile number of the user',
    example: '+1234567890',
  })
  mobilenumber: string;

  @ApiProperty({
    description: 'First line of address',
    example: '123 Main Street',
    required: false,
  })
  addressline1?: string;

  @ApiProperty({
    description: 'Second line of address',
    example: 'Apt 4B',
    required: false,
  })
  addressline2?: string;

  @ApiProperty({
    description: 'City name',
    example: 'New York',
    required: false,
  })
  city?: string;

  @ApiProperty({
    description: 'State or province',
    example: 'NY',
    required: false,
  })
  state?: string;

  @ApiProperty({
    description: 'Center or district',
    example: 'Manhattan',
    required: false,
  })
  center?: string;

  @ApiProperty({
    description: 'Postal/ZIP code',
    example: '10001',
    required: false,
  })
  pincode?: string;

  @ApiProperty({
    description: 'Designation or job title of the user',
    example: 'Software Engineer',
    required: false,
  })
  designation?: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2023-09-06T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2023-09-06T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class CreateUserResponseDto extends UserResponseDto {}

export class UpdateUserResponseDto extends UserResponseDto {}

export class UsersListResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [UserResponseDto],
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 10,
  })
  total: number;
} 