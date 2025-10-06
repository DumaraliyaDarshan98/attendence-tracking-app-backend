import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(AuthGuard, PermissionGuard)
@ApiBearerAuth('JWT-auth')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermissions('audit:list', 'audit:read')
  @ApiOperation({ summary: 'List audit logs' })
  @ApiQuery({ name: 'module', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'performedBy', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Audit logs fetched' })
  async list(
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('entityId') entityId?: string,
    @Query('performedBy') performedBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogsService.list({
      module,
      action,
      entityId,
      performedBy,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }
}


