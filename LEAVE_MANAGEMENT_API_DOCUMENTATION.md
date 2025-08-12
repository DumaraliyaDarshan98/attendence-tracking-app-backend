# Leave Management System API Documentation

## Overview
The Leave Management System provides comprehensive APIs for managing company holidays and employee leave requests. All endpoints require JWT authentication.

## Base URL
```
http://localhost:3000/api/leave-management
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Holiday Management

### 1.1 Create Holiday
**POST** `/leave-management/holidays`

**Description:** Create a new company holiday (Admin only)

**Request Body:**
```json
{
  "name": "New Year's Day",
  "date": "2024-01-01",
  "description": "New Year's Day celebration",
  "isOptional": false
}
```

**Response:**
```json
{
  "code": 201,
  "status": "Created",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "New Year's Day",
    "date": "2024-01-01T00:00:00.000Z",
    "description": "New Year's Day celebration",
    "isActive": true,
    "isOptional": false,
    "createdAt": "2023-12-08T10:00:00.000Z",
    "updatedAt": "2023-12-08T10:00:00.000Z"
  },
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/holidays"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/leave-management/holidays \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Year Day",
    "date": "2024-01-01",
    "description": "New Year Day celebration",
    "isOptional": false
  }'
```

### 1.2 Get All Holidays
**GET** `/leave-management/holidays`

**Description:** Retrieve all active company holidays

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "New Year's Day",
      "date": "2024-01-01T00:00:00.000Z",
      "description": "New Year's Day celebration",
      "isActive": true,
      "isOptional": false
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Independence Day",
      "date": "2024-08-15T00:00:00.000Z",
      "description": "Independence Day celebration",
      "isActive": true,
      "isOptional": false
    }
  ],
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/holidays"
}
```

### 1.3 Get Holidays by Year
**GET** `/leave-management/holidays/year/{year}`

**Description:** Get holidays for a specific year

**Parameters:**
- `year` (path): Year (e.g., 2024)

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "New Year's Day",
      "date": "2024-01-01T00:00:00.000Z",
      "description": "New Year's Day celebration",
      "isActive": true,
      "isOptional": false
    }
  ],
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/holidays/year/2024"
}
```

### 1.4 Get Holiday by ID
**GET** `/leave-management/holidays/{id}`

**Description:** Get a specific holiday by ID

**Parameters:**
- `id` (path): Holiday ID

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "New Year's Day",
    "date": "2024-01-01T00:00:00.000Z",
    "description": "New Year's Day celebration",
    "isActive": true,
    "isOptional": false
  },
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/holidays/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### 1.5 Update Holiday
**PUT** `/leave-management/holidays/{id}`

**Description:** Update an existing holiday

**Parameters:**
- `id` (path): Holiday ID

**Request Body:**
```json
{
  "name": "Updated Holiday Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Updated Holiday Name",
    "date": "2024-01-01T00:00:00.000Z",
    "description": "Updated description",
    "isActive": true,
    "isOptional": false
  },
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/holidays/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### 1.6 Delete Holiday
**DELETE** `/leave-management/holidays/{id}`

**Description:** Delete a holiday

**Parameters:**
- `id` (path): Holiday ID

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "message": "Holiday deleted successfully"
  },
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/holidays/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

---

## 2. Leave Request Management

### 2.1 Create Leave Request
**POST** `/leave-management/leave-requests`

**Description:** Submit a new leave request

**Request Body:**
```json
{
  "leaveType": "annual",
  "startDate": "2024-01-15",
  "endDate": "2024-01-17",
  "reason": "Family vacation",
  "isHalfDay": false,
  "notes": "Will be back on 18th"
}
```

**Leave Types:**
- `full-day`: Full day leave
- `half-day`: Half day leave
- `sick`: Sick leave
- `casual`: Casual leave
- `annual`: Annual leave
- `other`: Other types

**Response:**
```json
{
  "code": 201,
  "status": "Created",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "leaveType": "annual",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-01-17T00:00:00.000Z",
    "reason": "Family vacation",
    "status": "pending",
    "isHalfDay": false,
    "totalDays": 3,
    "notes": "Will be back on 18th",
    "createdAt": "2023-12-08T10:00:00.000Z",
    "updatedAt": "2023-12-08T10:00:00.000Z"
  },
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/leave-requests"
}
```

**Half-Day Leave Example:**
```json
{
  "leaveType": "half-day",
  "startDate": "2024-01-15",
  "endDate": "2024-01-15",
  "reason": "Medical appointment",
  "isHalfDay": true,
  "halfDayType": "morning"
}
```

### 2.2 Get My Leave Requests
**GET** `/leave-management/leave-requests/my`

**Description:** Get current user's leave requests

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "leaveType": "annual",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-17T00:00:00.000Z",
      "reason": "Family vacation",
      "status": "approved",
      "isHalfDay": false,
      "totalDays": 3,
      "approvedBy": "64f8a1b2c3d4e5f6a7b8c9d1",
      "approvedAt": "2023-12-08T11:00:00.000Z"
    }
  ],
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/leave-requests/my"
}
```

### 2.3 Get All Leave Requests (Admin) - Enhanced with Advanced Filters
**GET** `/leave-management/leave-requests`

**Description:** Get all leave requests with advanced filtering and pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending, approved, rejected, cancelled)
- `leaveType` (optional): Filter by leave type (annual, casual, sick, other)
- `userId` (optional): Filter by specific user ID
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `isHalfDay` (optional): Filter by half day (true/false)
- `approvedBy` (optional): Filter by approver ID

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "userId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com"
      },
      "leaveType": "annual",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-17T00:00:00.000Z",
      "reason": "Family vacation",
      "status": "pending",
      "isHalfDay": false,
      "totalDays": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/leave-requests"
}
```

**Filter Examples:**

1. **Get pending leave requests:**
   ```
   GET /leave-management/leave-requests?status=pending
   ```

2. **Get annual leaves for a specific user:**
   ```
   GET /leave-management/leave-requests?leaveType=annual&userId=64f8a1b2c3d4e5f6a7b8c9d0
   ```

3. **Get half-day leaves in date range:**
   ```
   GET /leave-management/leave-requests?isHalfDay=true&startDate=2024-01-01&endDate=2024-01-31
   ```

4. **Get leaves approved by specific manager:**
   ```
   GET /leave-management/leave-requests?approvedBy=64f8a1b2c3d4e5f6a7b8c9d1
   ```

5. **Combined filters:**
   ```
   GET /leave-management/leave-requests?status=approved&leaveType=annual&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
   ```

### 2.4 Get Leave Request by ID
**GET** `/leave-management/leave-requests/{id}`

**Description:** Get a specific leave request by ID

**Parameters:**
- `id` (path): Leave request ID

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com"
    },
    "leaveType": "annual",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-01-17T00:00:00.000Z",
    "reason": "Family vacation",
    "status": "pending",
    "isHalfDay": false,
    "totalDays": 3,
    "notes": "Will be back on 18th"
  },
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### 2.5 Update Leave Request
**PUT** `/leave-management/leave-requests/{id}`

**Description:** Update an existing leave request

**Parameters:**
- `id` (path): Leave request ID

**Request Body:**
```json
{
  "reason": "Updated reason for leave",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "leaveType": "annual",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-01-17T00:00:00.000Z",
    "reason": "Updated reason for leave",
    "status": "pending",
    "isHalfDay": false,
    "totalDays": 3,
    "notes": "Updated notes"
  },
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### 2.6 Update Leave Request Status (Consolidated)
**PUT** `/leave-management/leave-requests/{id}/status`

**Description:** Approve or reject a leave request using a single endpoint (Admin/Manager)

**Parameters:**
- `id` (path): Leave request ID

**Request Body:**
```json
{
  "status": "approved", // or "rejected"
  "notes": "Optional approval notes", // for approved status
  "rejectionReason": "Reason for rejection" // required for rejected status
}
```

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "leaveType": "annual",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-01-17T00:00:00.000Z",
    "reason": "Family vacation",
    "status": "approved",
    "isHalfDay": false,
    "totalDays": 3,
    "approvedBy": "64f8a1b2c3d4e5f6a7b8c1",
    "approvedAt": "2023-12-08T12:00:00.000Z",
    "notes": "Optional approval notes"
  },
  "timestamp": "2023-12-08T12:00:00.000Z",
  "path": "/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/status"
}
```

### 2.7 Approve Leave Request (Legacy)
**POST** `/leave-management/leave-requests/{id}/approve`

**Description:** Approve a leave request (Admin/Manager) - Legacy endpoint for backward compatibility

**Parameters:**
- `id` (path): Leave request ID

**Request Body:**
```json
{
  "notes": "Approved with notes"
}
```

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "leaveType": "annual",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-01-17T00:00:00.000Z",
    "reason": "Family vacation",
    "status": "approved",
    "isHalfDay": false,
    "totalDays": 3,
    "approvedBy": "64f8a1b2c3d4e5f6a7b8c9d1",
    "approvedAt": "2023-12-08T12:00:00.000Z",
    "notes": "Approved with notes"
  },
  "timestamp": "2023-12-08T12:00:00.000Z",
  "path": "/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/approve"
}
```

### 2.8 Reject Leave Request (Legacy)
**POST** `/leave-management/leave-requests/{id}/reject`

**Description:** Reject a leave request (Admin/Manager) - Legacy endpoint for backward compatibility

**Parameters:**
- `id` (path): Leave request ID

**Request Body:**
```json
{
  "rejectionReason": "Insufficient notice period"
}
```

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "leaveType": "annual",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-01-17T00:00:00.000Z",
    "reason": "Family vacation",
    "status": "rejected",
    "isHalfDay": false,
    "totalDays": 3,
    "approvedBy": "64f8a1b2c3d4e5f6a7b8c9d1",
    "approvedAt": "2023-12-08T12:00:00.000Z",
    "rejectionReason": "Insufficient notice period"
  },
  "timestamp": "2023-12-08T12:00:00.000Z",
  "path": "/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/reject"
}
```

### 2.8 Cancel Leave Request
**POST** `/leave-management/leave-requests/{id}/cancel`

**Description:** Cancel your own leave request

**Parameters:**
- `id` (path): Leave request ID

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "leaveType": "annual",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-01-17T00:00:00.000Z",
    "reason": "Family vacation",
    "status": "cancelled",
    "isHalfDay": false,
    "totalDays": 3
  },
  "timestamp": "2023-12-08T12:00:00.000Z",
  "path": "/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/cancel"
}
```

### 2.9 Get Leave Requests by Date Range
**GET** `/leave-management/leave-requests/range`

**Description:** Get leave requests within a date range

**Query Parameters:**
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "userId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com"
      },
      "leaveType": "annual",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-17T00:00:00.000Z",
      "reason": "Family vacation",
      "status": "approved",
      "isHalfDay": false,
      "totalDays": 3
    }
  ],
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/leave-requests/range"
}
```

### 2.10 Get Leave Balance
**GET** `/leave-management/leave-balance`

**Description:** Get current user's leave balance for the year

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "allocation": {
      "annual": 21,
      "casual": 7,
      "sick": 10,
      "other": 5
    },
    "used": 8,
    "remaining": 35
  },
  "timestamp": "2023-12-08T10:00:00.000Z",
  "path": "/api/leave-management/leave-balance"
}
```

---

## Data Models

### Holiday Schema
```typescript
{
  name: string,           // Holiday name
  date: Date,             // Holiday date
  description: string,     // Holiday description
  isActive: boolean,       // Whether holiday is active
  isOptional: boolean,     // Whether holiday is optional
  createdAt: Date,         // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

### Leave Request Schema
```typescript
{
  userId: ObjectId,        // Reference to User
  leaveType: string,       // Type of leave
  startDate: Date,         // Start date of leave
  endDate: Date,           // End date of leave
  reason: string,          // Reason for leave
  status: string,          // Request status
  approvedBy?: ObjectId,   // Who approved/rejected
  approvedAt?: Date,       // When approved/rejected
  rejectionReason?: string, // Reason for rejection
  isHalfDay: boolean,      // Whether it's half day
  halfDayType?: string,    // Morning or afternoon
  totalDays: number,       // Calculated working days
  notes?: string,          // Additional notes
  createdAt: Date,         // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

---

## New Features Summary

### Consolidated Status Update API
- **New Endpoint**: `PUT /leave-management/leave-requests/:id/status`
- **Purpose**: Single endpoint to approve or reject leave requests
- **Benefits**: 
  - Simplified API usage
  - Consistent request/response format
  - Better error handling for required fields

### Enhanced Admin Filters
- **Advanced Filtering**: Multiple filter options for admin users
- **Filter Types**:
  - Status-based filtering
  - Leave type filtering
  - User-specific filtering
  - Date range filtering
  - Half-day filtering
  - Approver filtering
- **Benefits**:
  - Better data organization
  - Efficient querying
  - Improved admin experience
  - Flexible reporting capabilities

### Backward Compatibility
- Legacy endpoints (`/approve` and `/reject`) remain functional
- Existing integrations continue to work
- Gradual migration to new consolidated API recommended

---

## Business Rules

1. **Leave Calculation**: Working days exclude weekends and holidays
2. **Half-Day Leaves**: Can be morning or afternoon
3. **Leave Types**: Different leave types have different allocations
4. **Approval Workflow**: Leave requests go through approval process
5. **User Permissions**: Users can only manage their own requests
6. **Holiday Management**: Only admins can manage company holidays

---

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Resource not found
- `409 Conflict`: Business rule violation

---

## Usage Examples

### Complete Leave Request Flow
1. **Create Leave Request**: `POST /leave-management/leave-requests`
2. **Admin Approval**: `POST /leave-management/leave-requests/{id}/approve`
3. **View Status**: `GET /leave-management/leave-requests/my`

### Holiday Management
```bash
# Create holiday
curl -X POST http://localhost:3000/api/leave-management/holidays \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Republic Day",
    "date": "2024-01-26",
    "description": "Republic Day celebration",
    "isOptional": false
  }'

# Get holidays for 2024
curl -X GET http://localhost:3000/api/leave-management/holidays/year/2024 \
  -H "Authorization: Bearer <token>"
```

### Leave Request Management
```bash
# Submit leave request
curl -X POST http://localhost:3000/api/leave-management/leave-requests \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "annual",
    "startDate": "2024-02-01",
    "endDate": "2024-02-03",
    "reason": "Personal leave",
    "isHalfDay": false
  }'

# Approve leave request (using new consolidated API)
curl -X PUT http://localhost:3000/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/status \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "notes": "Approved"
  }'

# Reject leave request (using new consolidated API)
curl -X PUT http://localhost:3000/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/status \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "rejectionReason": "Insufficient notice period"
  }'

# Legacy approve endpoint (still supported)
curl -X POST http://localhost:3000/api/leave-management/leave-requests/64f8a1b2c3d4e5f6a7b8c9d0/approve \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved"}'

# Get leave balance
curl -X GET http://localhost:3000/api/leave-management/leave-balance \
  -H "Authorization: Bearer <token>"

# Get all leave requests with advanced filters (Admin)
curl -X GET "http://localhost:3000/api/leave-management/leave-requests?status=pending&leaveType=annual&page=1&limit=20" \
  -H "Authorization: Bearer <admin-token>"

# Get half-day leaves in date range
curl -X GET "http://localhost:3000/api/leave-management/leave-requests?isHalfDay=true&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <admin-token>"
```

---

## Notes

- All dates are in ISO 8601 format (YYYY-MM-DD)
- Working days exclude weekends (Saturday/Sunday) and holidays
- Half-day leaves count as 0.5 days
- Leave balance is calculated per calendar year
- All endpoints require valid JWT authentication
- User ID is automatically extracted from the JWT token
- No role or permission guards are applied (only JWT verification)
