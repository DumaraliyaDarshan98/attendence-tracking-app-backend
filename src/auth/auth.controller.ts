import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    description: 'Login credentials',
    schema: {
      type: 'object',
      properties: {
        email: { 
          type: 'string', 
          format: 'email', 
          example: 'john.doe@example.com', 
          description: 'User email address' 
        },
        password: { 
          type: 'string', 
          example: 'password123', 
          description: 'User password' 
        }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { 
          type: 'string', 
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
          description: 'JWT access token' 
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
            email: { type: 'string', example: 'john.doe@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '64f8a1b2c3d4e5f6a7b8c9d0' },
                name: { type: 'string', example: 'user' },
                displayName: { type: 'string', example: 'User' },
                description: { type: 'string', example: 'Basic user with limited access' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP for password reset' })
  @ApiBody({
    description: 'Email for OTP',
    schema: {
      type: 'object',
      properties: {
        email: { 
          type: 'string', 
          format: 'email', 
          example: 'john.doe@example.com', 
          description: 'Email address to send OTP to' 
        }
      },
      required: ['email']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'OTP sent successfully', 
          description: 'Success message' 
        },
        otp: { 
          type: 'string', 
          example: '123456', 
          description: 'Generated OTP (for development only)' 
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    const otp = await this.authService.generateResetToken(sendOtpDto.email);
    return {
      message: 'OTP sent successfully',
      otp: otp, // In production, don't return OTP in response
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using OTP' })
  @ApiBody({
    description: 'Password reset data',
    schema: {
      type: 'object',
      properties: {
        email: { 
          type: 'string', 
          format: 'email', 
          example: 'john.doe@example.com', 
          description: 'User email address' 
        },
        otp: { 
          type: 'string', 
          example: '123456', 
          description: 'One-time password (OTP) received via email' 
        },
        newPassword: { 
          type: 'string', 
          example: 'newpassword123', 
          description: 'New password (min 6 characters)' 
        }
      },
      required: ['email', 'otp', 'newPassword']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successful',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'Password reset successfully', 
          description: 'Success message' 
        },
        success: { 
          type: 'boolean', 
          example: true, 
          description: 'Operation success status' 
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.otp,
      resetPasswordDto.newPassword,
    );
    return {
      message: 'Password reset successfully',
      success: result,
    };
  }
} 