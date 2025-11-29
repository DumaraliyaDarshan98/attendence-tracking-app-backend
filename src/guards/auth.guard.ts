import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private usersService: UsersService,
        private sessionsService: SessionsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Access token required');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            
            // Check if session is still active
            const session = await this.sessionsService.findSessionByToken(token);
            if (!session || !session.isActive) {
                throw new UnauthorizedException('Session expired or invalid. Please login again.');
            }

            const user = await this.usersService.findOne(payload.sub);

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Update last activity
            await this.sessionsService.updateLastActivity(token);

            // Add user to request for use in controllers
            request.user = user;
            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid token');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
