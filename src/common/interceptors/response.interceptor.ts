import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ResponseData<T> {
  code: number;
  status: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
  path: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseData<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseData<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // Determine status message based on HTTP status code
        const status = this.getStatusMessage(statusCode);
        
        // Extract pagination data if it exists
        const pagination = this.extractPagination(data);
        
        // Remove pagination from data if it exists
        const cleanData = this.removePaginationFromData(data);

        return {
          code: statusCode,
          status,
          data: cleanData,
          pagination,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }

  private getStatusMessage(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.OK:
        return 'OK';
      case HttpStatus.CREATED:
        return 'Created';
      case HttpStatus.ACCEPTED:
        return 'Accepted';
      case HttpStatus.NO_CONTENT:
        return 'No Content';
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable';
      default:
        return 'Unknown';
    }
  }

  private extractPagination(data: any): any {
    if (!data) return undefined;

    // Check if data has pagination properties
    if (data.pagination) {
      return data.pagination;
    }

    // Check if data is an array with pagination metadata
    if (Array.isArray(data) && data.length > 0 && data[0]?.pagination) {
      return data[0].pagination;
    }

    // Check if data has pagination-like properties
    if (data.total !== undefined && data.page !== undefined && data.limit !== undefined) {
      return {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: Math.ceil(data.total / data.limit),
      };
    }

    // Check if data has users array with pagination (for UsersListResponseDto)
    if (data.users && data.total !== undefined) {
      return {
        page: 1,
        limit: data.users.length,
        total: data.total,
        totalPages: 1,
      };
    }

    // Check if data has permissions array with pagination (for PermissionsListResponseDto)
    if (data.permissions && data.total !== undefined) {
      return {
        page: data.page || 1,
        limit: data.limit || data.permissions.length,
        total: data.total,
        totalPages: Math.ceil(data.total / (data.limit || data.permissions.length)),
      };
    }

    // Check if data has roles array with pagination (for RolesListResponseDto)
    if (data.roles && data.total !== undefined) {
      return {
        page: data.page || 1,
        limit: data.limit || data.roles.length,
        total: data.total,
        totalPages: Math.ceil(data.total / (data.limit || data.roles.length)),
      };
    }

    return undefined;
  }

  private removePaginationFromData(data: any): any {
    if (!data) return data;

    // If data has pagination property, remove it
    if (data.pagination) {
      const { pagination, ...cleanData } = data;
      return cleanData;
    }

    // If data is an array with pagination metadata, clean it
    if (Array.isArray(data) && data.length > 0 && data[0]?.pagination) {
      return data.map(item => {
        const { pagination, ...cleanItem } = item;
        return cleanItem;
      });
    }

    // If data has pagination-like properties, remove them
    if (data.total !== undefined && data.page !== undefined && data.limit !== undefined) {
      const { total, page, limit, ...cleanData } = data;
      return cleanData;
    }

    // If data has users array with pagination, clean it
    if (data.users && data.total !== undefined) {
      const { total, ...cleanData } = data;
      return cleanData;
    }

    // If data has permissions array with pagination, clean it
    if (data.permissions && data.total !== undefined) {
      const { total, page, limit, ...cleanData } = data;
      return cleanData;
    }

    // If data has roles array with pagination, clean it
    if (data.roles && data.total !== undefined) {
      const { total, page, limit, ...cleanData } = data;
      return cleanData;
    }

    return data;
  }
}

