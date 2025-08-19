import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { UserDocument } from '../models/user.model';
import { RolePermission } from '../models/role.model';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.usersService.validatePassword(user, password)) {
      const userObj = user.toObject();
      const { password, ...result } = userObj;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id?.toString() || user.id?.toString() || '', role: user.role };
    
    // Get user role details and permissions
    let roleDetails: {
      id: string;
      name: string;
      displayName: string;
      isSuperAdmin: boolean;
    } | null = null;

    let permissions: RolePermission[] = [];
    
    let isSuperAdmin = false;
    
    if (user.role) {
      try {
        const role = await this.rolesService.findOne(user.role.toString());
        roleDetails = {
          id: (role as any)._id?.toString() || '',
          name: role.name,
          displayName: role.displayName,
          isSuperAdmin: role.isSuperAdmin
        };
        
        // Get permissions from the new embedded structure
        if (role.permissions && role.permissions.length > 0) {
          permissions = role.permissions.map((permission: RolePermission) => ({
            module: permission.module,
            actions: permission.actions
          }));
        }
        
        isSuperAdmin = role.isSuperAdmin;
      } catch (error) {
        console.error('Error fetching role details:', error);
      }
    }
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id?.toString() || user.id?.toString() || '',
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: roleDetails,
        permissions: permissions,
        isSuperAdmin: isSuperAdmin
      },
    };
  }

  async generateResetToken(email: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a simple 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real application, you would store this OTP in the database
    // with an expiration time and send it via email
    console.log(`OTP for ${email}: ${otp}`);

    return otp;
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
    const user: any = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real application, you would verify the OTP from the database
    // For now, we'll just accept any OTP for demonstration
    console.log(`Resetting password for ${email} with OTP: ${otp}`);

    // Update the user's password
    await this.usersService.update(user._id?.toString() || user.id?.toString() || '', { password: newPassword });

    return true;
  }
} 