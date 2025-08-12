import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: '64f8a1b2c3d4e5f6a7b8c9d0',
      email: 'john.doe@example.com',
      name: 'John Doe',
              role: {
          _id: '64f8a1b2c3d4e5f6a7b8c9d0',
          name: 'user',
          displayName: 'User',
          description: 'Basic user with limited access'
        },
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export class SendOtpResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Generated OTP (for development only)',
    example: '123456',
  })
  otp: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password reset successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;
} 