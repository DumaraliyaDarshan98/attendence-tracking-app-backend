import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';
import { DateUtil } from '../common/utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private rolesService: RolesService,
  ) { }

  async create(createUserDto: any): Promise<User> {
    const { 
      email, 
      password, 
      firstname, 
      lastname, 
      role, 
      mobilenumber,
      addressline1,
      addressline2,
      city,
      state,
      center,
      pincode
    } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If no role is provided, leave it as null (user will have full permissions)
    // This allows for more flexible permission handling
    const userRole = role || null;

    const user = new this.userModel({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      role: userRole,
      mobilenumber,
      addressline1,
      addressline2,
      city,
      state,
      center,
      pincode,
    });

    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, { password: 0 }).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id, { password:0 }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    const { password, ...updateData } = updateUserDto;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true, select: '-password' })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async validatePassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
} 