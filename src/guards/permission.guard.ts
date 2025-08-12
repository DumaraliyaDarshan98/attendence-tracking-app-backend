import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private rolesService: RolesService,
        private usersService: UsersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.get<string[]>(
            'permissions',
            context.getHandler(),
        );

        if (!requiredPermissions) {
            return true; // No permissions required
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new ForbiddenException('Access token required');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            const user = await this.usersService.findOne(payload.sub);

            if (!user) {
                throw new ForbiddenException('User not found');
            }

            // Check if user has a role
            if (!user.role) {
                // If no role exists, give full permissions (bypass permission checks)
                console.log(`User ${user.email} has no role assigned - granting full permissions`);
                request.user = user;
                return true;
            }

            // Check each required permission
            for (const permission of requiredPermissions) {
                const [module, action] = permission.split(':');
                const hasPermission = await this.rolesService.hasPermission(
                    user.role.toString(),
                    module,
                    action,
                );

                if (!hasPermission) {
                    throw new ForbiddenException(
                        `Insufficient permissions. Required: ${permission}`,
                    );
                }
            }

            // Add user to request for use in controllers
            request.user = user;
            return true;
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }
            throw new ForbiddenException('Invalid token');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
} 