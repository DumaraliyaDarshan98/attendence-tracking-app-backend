# Response Interceptor Documentation

## Overview

The Response Interceptor is a global NestJS interceptor that automatically formats all API responses to maintain consistency across the application. It transforms raw response data into a standardized format that includes metadata like status codes, timestamps, and pagination information.

## 🏗️ **Response Structure**

All API responses now follow this consistent format:

```json
{
  "code": 200,
  "status": "OK",
  "data": {
    // Your actual response data here
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2023-09-06T10:30:00.000Z",
  "path": "/api/users"
}
```

### **Field Descriptions**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `code` | number | HTTP status code | 200, 201, 400, etc. |
| `status` | string | Human-readable status message | "OK", "Created", "Bad Request" |
| `data` | any | The actual response data | User object, array, etc. |
| `pagination` | object | Pagination metadata (if applicable) | Page info for list endpoints |
| `timestamp` | string | ISO timestamp of response | "2023-09-06T10:30:00.000Z" |
| `path` | string | Request endpoint path | "/api/users" |

## 🔧 **Implementation**

### **Global Registration**

The interceptor is automatically applied to all endpoints in `src/main.ts`:

```typescript
// Global response interceptor
app.useGlobalInterceptors(new ResponseInterceptor());
```

### **Automatic Status Mapping**

The interceptor automatically maps HTTP status codes to readable status messages:

| HTTP Code | Status Message |
|-----------|----------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## 📊 **Pagination Support**

The interceptor automatically detects and formats pagination data from various response structures:

### **Supported Pagination Formats**

1. **Direct Pagination Object**:
   ```typescript
   {
     data: [...],
     pagination: {
       page: 1,
       limit: 10,
       total: 100
     }
   }
   ```

2. **Array with Pagination Metadata**:
   ```typescript
   [
     { pagination: { page: 1, limit: 10, total: 100 }, ... },
     { pagination: { page: 1, limit: 10, total: 100 }, ... }
   ]
   ```

3. **List Response DTOs**:
   ```typescript
   {
     users: [...],
     total: 100
   }
   ```

4. **Standard Pagination Properties**:
   ```typescript
   {
     data: [...],
     page: 1,
     limit: 10,
     total: 100
   }
   ```

### **Automatic Pagination Calculation**

The interceptor automatically calculates `totalPages`:

```typescript
totalPages: Math.ceil(total / limit)
```

## 🎯 **Usage Examples**

### **Single Object Response**

**Before (Controller):**
```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  return this.usersService.findOne(id);
}
```

**After (Interceptor):**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  },
  "timestamp": "2023-09-06T10:30:00.000Z",
  "path": "/api/users/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### **List Response with Pagination**

**Before (Controller):**
```typescript
@Get()
findAll(@Query() query: PaginationQueryDto) {
  return this.usersService.findAll(query);
}
```

**After (Interceptor):**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "users": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "isActive": true,
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:00.000Z"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "timestamp": "2023-09-06T10:30:00.000Z",
  "path": "/api/users"
}
```

### **Created Response**

**Before (Controller):**
```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

**After (Interceptor):**
```json
{
  "code": 201,
  "status": "Created",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  },
  "timestamp": "2023-09-06T10:30:00.000Z",
  "path": "/api/users"
}
```

## 🚀 **Benefits**

### **Consistency**
- All API responses follow the same structure
- Predictable response format for frontend developers
- Easier API integration and testing

### **Metadata**
- Automatic timestamp and path information
- Clear status codes and messages
- Built-in pagination support

### **Maintenance**
- No need to manually format responses in controllers
- Centralized response formatting logic
- Easy to modify response structure globally

### **Documentation**
- Swagger documentation automatically reflects the new format
- Clear examples for API consumers
- Consistent error handling

## 🔍 **Swagger Integration**

The interceptor works seamlessly with Swagger documentation. All response schemas now show the standardized format:

```typescript
@ApiResponse({
  status: 200,
  description: 'User found successfully',
  type: UserResponseWrapperDto, // Uses standardized response format
})
```

## 🛠️ **Customization**

### **Adding New Status Codes**

To add support for new HTTP status codes, update the `getStatusMessage` method in `ResponseInterceptor`:

```typescript
private getStatusMessage(statusCode: number): string {
  switch (statusCode) {
    // ... existing cases
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'Too Many Requests';
    default:
      return 'Unknown';
  }
}
```

### **Custom Pagination Detection**

To support custom pagination formats, extend the `extractPagination` method:

```typescript
private extractPagination(data: any): any {
  // ... existing logic
  
  // Add custom pagination detection
  if (data.customPagination) {
    return {
      page: data.customPagination.currentPage,
      limit: data.customPagination.itemsPerPage,
      total: data.customPagination.totalItems,
      totalPages: data.customPagination.totalPages,
    };
  }
  
  return undefined;
}
```

## 📝 **Migration Notes**

### **Existing Controllers**
- No changes required in controller logic
- Responses are automatically transformed
- Existing DTOs continue to work

### **Frontend Integration**
- Update frontend code to expect the new response format
- Access data through the `data` property
- Use pagination information from the `pagination` property

### **Testing**
- Update test cases to expect the new response structure
- Verify pagination calculations
- Test different HTTP status codes

## 🧪 **Testing the Interceptor**

### **Manual Testing**
1. Start the application: `npm run start:dev`
2. Make API calls to different endpoints
3. Verify response format consistency

### **Unit Testing**
```typescript
describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  
  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });
  
  it('should format response correctly', () => {
    // Test implementation
  });
});
```

## 🔮 **Future Enhancements**

### **Planned Features**
- **Response Caching**: Cache formatted responses
- **Custom Headers**: Add custom response headers
- **Response Compression**: Compress large responses
- **Rate Limiting**: Integrate with rate limiting

### **Monitoring**
- **Response Time Tracking**: Monitor response formatting time
- **Error Logging**: Log formatting errors
- **Performance Metrics**: Track interceptor performance

## 📚 **Best Practices**

### **Controller Design**
- Keep controller logic focused on business logic
- Let the interceptor handle response formatting
- Use appropriate HTTP status codes

### **DTO Design**
- Design DTOs for the actual data structure
- The interceptor will wrap them automatically
- Include pagination metadata when applicable

### **Error Handling**
- Use proper HTTP status codes
- The interceptor will format error responses
- Maintain consistent error message structure

