import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument, RolePermission } from '../models/role.model';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, displayName, permissions, description, isSuperAdmin } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.roleModel.findOne({ name });
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    // Validate permissions structure
    if (permissions) {
      this.validatePermissions(permissions);
    }

    const role = new this.roleModel({
      name,
      displayName,
      permissions: permissions || [],
      description,
      isSuperAdmin: isSuperAdmin || false,
      isSystemRole: false, // Custom roles are not system roles
    });

    return role.save();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleModel.findOne({ name }).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent updating system roles
    if (role.isSystemRole && updateRoleDto.isSystemRole === false) {
      throw new BadRequestException('Cannot modify system role status');
    }

    // Validate permissions structure if updating
    if (updateRoleDto.permissions) {
      this.validatePermissions(updateRoleDto.permissions);
    }

    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .exec();
    
    if (!updatedRole) {
      throw new NotFoundException('Role not found during update');
    }
    
    return updatedRole;
  }

  async remove(id: string): Promise<void> {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent deletion of system roles
    if (role.isSystemRole) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if role is assigned to any users
    // TODO: Add user service dependency to check this
    // const usersWithRole = await this.userService.countUsersWithRole(id);
    // if (usersWithRole > 0) {
    //   throw new ConflictException('Cannot delete role that is assigned to users');
    // }

    await this.roleModel.findByIdAndDelete(id).exec();
  }

  async assignPermissions(roleId: string, permissions: RolePermission[]): Promise<Role> {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Validate permissions structure
    this.validatePermissions(permissions);

    role.permissions = permissions;
    return role.save();
  }

  async hasPermission(roleId: string, module: string, action: string): Promise<boolean> {
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) {
      return false;
    }

    // Super admin has all permissions
    if (role.isSuperAdmin) {
      return true;
    }

    // Check if role has the specific permission
    const modulePermission = role.permissions.find(p => p.module === module);
    if (!modulePermission) {
      return false;
    }

    return modulePermission.actions.includes(action);
  }

  private validatePermissions(permissions: RolePermission[]): void {
    const validModules = [
      'users', 'roles', 'permissions', 'attendance', 'leave', 
      'holiday', 'tour', 'timelog', 'reports'
    ];
    
    const validActions = [
      'create', 'read', 'update', 'delete', 'list', 'approve', 'reject', 'export'
    ];

    for (const permission of permissions) {
      if (!validModules.includes(permission.module)) {
        throw new BadRequestException(`Invalid module: ${permission.module}`);
      }

      if (!Array.isArray(permission.actions) || permission.actions.length === 0) {
        throw new BadRequestException(`Actions must be a non-empty array for module: ${permission.module}`);
      }

      for (const action of permission.actions) {
        if (!validActions.includes(action)) {
          throw new BadRequestException(`Invalid action: ${action} for module: ${permission.module}`);
        }
      }
    }
  }

  async seedDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Has access to all modules and can manage roles and permissions',
        isSuperAdmin: true,
        permissions: [],
        isSystemRole: true,
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Has access to most modules with limited role management',
        isSuperAdmin: false,
        permissions: [
          { module: 'users', actions: ['create', 'read', 'update', 'list'] },
          { module: 'attendance', actions: ['read', 'list', 'export'] },
          { module: 'leave', actions: ['read', 'list', 'approve', 'reject'] },
          { module: 'holiday', actions: ['read', 'list'] },
          { module: 'tour', actions: ['read', 'list', 'approve', 'reject'] },
          { module: 'timelog', actions: ['read', 'list', 'export'] },
          { module: 'reports', actions: ['read', 'list', 'export'] }
        ],
        isSystemRole: true,
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'Can manage users and view reports',
        isSuperAdmin: false,
        permissions: [
          { module: 'users', actions: ['read', 'list'] },
          { module: 'attendance', actions: ['read', 'list'] },
          { module: 'leave', actions: ['read', 'list', 'approve', 'reject'] },
          { module: 'holiday', actions: ['read', 'list'] },
          { module: 'tour', actions: ['read', 'list'] },
          { module: 'timelog', actions: ['read', 'list'] },
          { module: 'reports', actions: ['read', 'list'] }
        ],
        isSystemRole: true,
      },
      {
        name: 'user',
        displayName: 'User',
        description: 'Basic user with limited access',
        isSuperAdmin: false,
        permissions: [
          { module: 'attendance', actions: ['create', 'read', 'list'] },
          { module: 'leave', actions: ['create', 'read', 'list'] },
          { module: 'tour', actions: ['create', 'read', 'list'] },
          { module: 'timelog', actions: ['create', 'read', 'list'] },
          { module: 'holiday', actions: ['read', 'list'] }
        ],
        isSystemRole: true,
      },
    ];

    for (const roleData of defaultRoles) {
      const exists = await this.roleModel.findOne({ name: roleData.name });
      if (!exists) {
        await this.roleModel.create(roleData);
      }
    }
  }

  // Helper method to get all available modules
  getAvailableModules(): string[] {
    return [
      'users', 'roles', 'permissions', 'attendance', 'leave', 
      'holiday', 'tour', 'timelog', 'reports'
    ];
  }

  // Helper method to get all available actions
  getAvailableActions(): string[] {
    return [
      'create', 'read', 'update', 'delete', 'list', 'approve', 'reject', 'export'
    ];
  }
} 