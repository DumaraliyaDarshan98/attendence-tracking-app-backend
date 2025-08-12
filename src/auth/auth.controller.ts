import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import {
  LoginResponseDto,
  SendOtpResponseDto,
  ResetPasswordResponseDto,
} from './dto/auth-response.dto';
import { AuthResponseWrapperDto } from '../common/dto/standard-response.dto';
import {
  ValidationErrorResponseDto,
  NotFoundErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from '../common/dto/error-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns JWT token and user information.'
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
    type: UnauthorizedErrorResponseDto,
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Send OTP for password reset',
    description: 'Send a 6-digit OTP to the user\'s email for password reset. OTP is returned in response for development purposes.'
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: AuthResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
    type: NotFoundErrorResponseDto,
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    const otp = await this.authService.generateResetToken(sendOtpDto.email);
    return {
      message: 'OTP sent successfully',
      otp: otp, // In production, don't return OTP in response
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset password using OTP',
    description: 'Reset user password using the OTP sent to their email. New password will be hashed before storage.'
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: AuthResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error or invalid OTP',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
    type: NotFoundErrorResponseDto,
  })
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