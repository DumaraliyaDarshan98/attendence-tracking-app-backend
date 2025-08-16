# Tour Management System API Documentation

## Overview
The Tour Management System provides comprehensive APIs for managing site visits and tours. It includes features for creating tours, assigning them to users, tracking status changes, and maintaining complete audit logs of all activities.

## Base URL
```
http://localhost:3000/api/tour-management
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Tour Management

### 1.1 Create Tour
**POST** `/tour-management/tours`

**Description:** Create a new tour/site visit assignment

**Request Body:**
```json
{
  "assignedTo": "64f8a1b2c3d4e5f6a7b8c9d0",
  "purpose": "Site inspection for new construction project",
  "location": "123 Main Street, Downtown Area, City",
  "expectedTime": "2024-01-15T10:00:00.000Z",
  "documents": [
    {
      "fileName": "site_plan.pdf",
      "fileUrl": "https://example.com/uploads/site_plan.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024000
    }
  ],
  "userNotes": "Need to check electrical connections and plumbing",
  "adminNotes": "Priority: High - Client requested urgent inspection"
}
```

**Response:**
```json
{
  "code": 201,
  "status": "Created",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "assignedTo": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com"
    },
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "firstname": "Admin",
      "lastname": "User",
      "email": "admin@example.com"
    },
    "purpose": "Site inspection for new construction project",
    "location": "123 Main Street, Downtown Area, City",
    "expectedTime": "2024-01-15T10:00:00.000Z",
    "documents": [...],
    "userNotes": "Need to check electrical connections and plumbing",
    "adminNotes": "Priority: High - Client requested urgent inspection",
    "status": "assigned",
    "statusHistory": [...],
    "isActive": true,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  },
  "timestamp": "2024-01-15T09:00:00.000Z",
  "path": "/api/tour-management/tours"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/tour-management/tours \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": "64f8a1b2c3d4e5f6a7b8c9d0",
    "purpose": "Site inspection for new construction project",
    "location": "123 Main Street, Downtown Area, City",
    "expectedTime": "2024-01-15T10:00:00.000Z",
    "userNotes": "Need to check electrical connections and plumbing"
  }'
```

### 1.2 Get All Tours
**GET** `/tour-management/tours`

**Description:** Retrieve all tours with advanced filtering and pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `assignedTo` (optional): Filter by assigned user ID
- `createdBy` (optional): Filter by creator user ID
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "data": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "assignedTo": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "firstname": "John",
          "lastname": "Doe",
          "email": "john.doe@example.com"
        },
        "createdBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "firstname": "Admin",
          "lastname": "User",
          "email": "admin@example.com"
        },
        "purpose": "Site inspection for new construction project",
        "location": "123 Main Street, Downtown Area, City",
        "expectedTime": "2024-01-15T10:00:00.000Z",
        "status": "assigned",
        "isActive": true
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "timestamp": "2024-01-15T09:00:00.000Z",
  "path": "/api/tour-management/tours"
}
```

**Filter Examples:**

1. **Get tours by status:**
   ```
   GET /tour-management/tours?status=in-progress
   ```

2. **Get tours assigned to specific user:**
   ```
   GET /tour-management/tours?assignedTo=64f8a1b2c3d4e5f6a7b8c9d0
   ```

3. **Get tours in date range:**
   ```
   GET /tour-management/tours?startDate=2024-01-01&endDate=2024-01-31
   ```

4. **Combined filters with pagination:**
   ```
   GET /tour-management/tours?status=assigned&assignedTo=64f8a1b2c3d4e5f6a7b8c9d0&page=1&limit=20
   ```

### 1.3 Get My Tours
**GET** `/tour-management/tours/my`

**Description:** Get tours assigned to the current authenticated user

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "data": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "purpose": "Site inspection for new construction project",
        "location": "123 Main Street, Downtown Area, City",
        "expectedTime": "2024-01-15T10:00:00.000Z",
        "status": "assigned",
        "userNotes": "Need to check electrical connections and plumbing"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "timestamp": "2024-01-15T09:00:00.000Z",
  "path": "/api/tour-management/tours/my"
}
```

### 1.4 Get Tour by ID
**GET** `/tour-management/tours/{id}`

**Description:** Get a specific tour by ID

**Parameters:**
- `id` (path): Tour ID

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "assignedTo": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com"
    },
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "firstname": "Admin",
      "lastname": "User",
      "email": "admin@example.com"
    },
    "purpose": "Site inspection for new construction project",
    "location": "123 Main Street, Downtown Area, City",
    "expectedTime": "2024-01-15T10:00:00.000Z",
    "documents": [...],
    "userNotes": "Need to check electrical connections and plumbing",
    "adminNotes": "Priority: High - Client requested urgent inspection",
    "status": "assigned",
    "statusHistory": [...],
    "isActive": true,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  },
  "timestamp": "2024-01-15T09:00:00.000Z",
  "path": "/api/tour-management/tours/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### 1.5 Update Tour
**PATCH** `/tour-management/tours/{id}`

**Description:** Update tour information

**Parameters:**
- `id` (path): Tour ID

**Request Body:**
```json
{
  "purpose": "Updated purpose for site visit",
  "location": "Updated location address",
  "expectedTime": "2024-01-16T10:00:00.000Z",
  "userNotes": "Updated user notes",
  "adminNotes": "Updated admin notes"
}
```

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "purpose": "Updated purpose for site visit",
    "location": "Updated location address",
    "expectedTime": "2024-01-16T10:00:00.000Z",
    "userNotes": "Updated user notes",
    "adminNotes": "Updated admin notes",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "timestamp": "2024-01-15T11:00:00.000Z",
  "path": "/api/tour-management/tours/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

---

## 2. Status Management

### 2.1 Update Tour Status
**PATCH** `/tour-management/tours/{id}/status`

**Description:** Update tour status with automatic history tracking

**Parameters:**
- `id` (path): Tour ID

**Request Body:**
```json
{
  "status": "in-progress",
  "notes": "Tour started successfully. User arrived at site.",
  "actualVisitTime": "2024-01-15T10:30:00.000Z"
}
```

**Status Transitions:**
- `pending` → `assigned`, `cancelled`
- `assigned` → `in-progress`, `cancelled`, `approved`, `rejected`
- `in-progress` → `completed`, `cancelled`
- `completed` → `approved`, `rejected`
- `approved` → `in-progress` (can restart if needed)
- `rejected` → `assigned` (can reassign)
- `cancelled` → `assigned` (can reassign)

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "status": "in-progress",
    "actualVisitTime": "2024-01-15T10:30:00.000Z",
    "statusHistory": [
      {
        "status": "assigned",
        "changedBy": "64f8a1b2c3d4e5f6a7b8c9d1",
        "changedByName": "Admin User",
        "notes": "Tour assigned to user",
        "changedAt": "2024-01-15T09:00:00.000Z"
      },
      {
        "status": "in-progress",
        "changedBy": "64f8a1b2c3d4e5f6a7b8c9d0",
        "changedByName": "John Doe",
        "notes": "Tour started successfully. User arrived at site.",
        "changedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/tour-management/tours/64f8a1b2c3d4e5f6a7b8c9d0/status"
}
```

**Status Update Examples:**

1. **Start Tour (User):**
   ```json
   {
     "status": "in-progress",
     "notes": "Arrived at site, starting inspection",
     "actualVisitTime": "2024-01-15T10:30:00.000Z"
   }
   ```

2. **Complete Tour (User):**
   ```json
   {
     "status": "completed",
     "notes": "Site inspection completed successfully",
     "completionNotes": "All systems working properly. Electrical connections verified. Plumbing checked and functional."
   }
   ```

3. **Approve Tour (Admin):**
   ```json
   {
     "status": "approved",
     "notes": "Tour report reviewed and approved"
   }
   ```

4. **Reject Tour (Admin):**
   ```json
   {
     "status": "rejected",
     "notes": "Inspection incomplete. Please revisit site and complete all required checks."
   }
   ```

### 2.2 Get Status History
**GET** `/tour-management/tours/{id}/status-history`

**Description:** Get complete history of status changes for a tour

**Parameters:**
- `id` (path): Tour ID

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "status": "assigned",
      "changedBy": "64f8a1b2c3d4e5f6a7b8c9d1",
      "changedByName": "Admin User",
      "notes": "Tour assigned to user",
      "changedAt": "2024-01-15T09:00:00.000Z"
    },
    {
      "status": "in-progress",
      "changedBy": "64f8a1b2c3d4e5f6a7b8c9d0",
      "changedByName": "John Doe",
      "notes": "Tour started successfully. User arrived at site.",
      "changedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "status": "completed",
      "changedBy": "64f8a1b2c3d4e5f6a7b8c9d0",
      "changedByName": "John Doe",
      "notes": "Site inspection completed",
      "changedAt": "2024-01-15T16:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T16:00:00.000Z",
  "path": "/api/tour-management/tours/64f8a1b2c3d4e5f6a7b8c9d0/status-history"
}
```

---

## 3. Advanced Features

### 3.1 Get Tours by Date Range
**GET** `/tour-management/tours/range`

**Description:** Get tours within a specific date range

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
      "purpose": "Site inspection for new construction project",
      "location": "123 Main Street, Downtown Area, City",
      "expectedTime": "2024-01-15T10:00:00.000Z",
      "status": "completed"
    }
  ],
  "timestamp": "2024-01-15T16:00:00.000Z",
  "path": "/api/tour-management/tours/range"
}
```

### 3.2 Delete Tour
**DELETE** `/tour-management/tours/{id}`

**Description:** Soft delete a tour (marks as inactive)

**Parameters:**
- `id` (path): Tour ID

**Response:**
```json
{
  "code": 204,
  "status": "No Content",
  "data": {
    "message": "Tour deleted successfully"
  },
  "timestamp": "2024-01-15T16:00:00.000Z",
  "path": "/api/tour-management/tours/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

---

## 4. Data Models

### Tour Schema
```typescript
{
  assignedTo: ObjectId,        // Reference to User (required)
  createdBy: ObjectId,         // Reference to User (required)
  purpose: string,              // Purpose of site visit (required)
  location: string,             // Location of site visit (required)
  expectedTime: Date,           // Expected time for visit (required)
  documents: TourDocument[],    // Array of uploaded documents
  userNotes?: string,           // Notes from assigned user
  status: string,               // Current status
  statusHistory: StatusHistory[], // Complete status change history
  adminNotes?: string,          // Notes from admin
  actualVisitTime?: Date,       // Actual time when user visited
  completionNotes?: string,     // Notes when tour completed
  isActive: boolean,            // Whether tour is active
  createdAt: Date,              // Creation timestamp
  updatedAt: Date               // Last update timestamp
}
```

### Tour Document Schema
```typescript
{
  fileName: string,             // Name of uploaded file
  fileUrl: string,              // URL of uploaded file
  fileType: string,             // MIME type of file
  fileSize: number              // Size of file in bytes
}
```

### Status History Schema
```typescript
{
  status: string,               // Status value
  changedBy: string,            // User ID who changed status
  changedByName: string,        // User name for display
  notes?: string,               // Optional notes about change
  changedAt: Date               // When status was changed
}
```

---

## 5. Business Rules

### Status Transitions
1. **Pending**: Initial state for new tours
2. **Assigned**: Tour assigned to user (admin action)
3. **In-Progress**: User started the tour
4. **Completed**: User finished the tour
5. **Approved**: Admin approved the tour
6. **Rejected**: Admin rejected the tour
7. **Cancelled**: Tour cancelled (can be reassigned)

### Document Management
- Multiple documents can be uploaded per tour
- Documents are stored with metadata (name, type, size)
- File URLs should point to secure storage locations

### History Tracking
- Every status change is automatically logged
- Includes user ID, name, timestamp, and notes
- Complete audit trail for compliance

---

## 6. Usage Examples

### Complete Tour Workflow

1. **Admin Creates Tour:**
   ```bash
   curl -X POST http://localhost:3000/api/tour-management/tours \
     -H "Authorization: Bearer <admin-token>" \
     -H "Content-Type: application/json" \
     -d '{
       "assignedTo": "64f8a1b2c3d4e5f6a7b8c9d0",
       "purpose": "Site inspection for new construction project",
       "location": "123 Main Street, Downtown Area, City",
       "expectedTime": "2024-01-15T10:00:00.000Z",
       "adminNotes": "Priority: High - Client requested urgent inspection"
     }'
   ```

2. **User Starts Tour:**
   ```bash
   curl -X PATCH http://localhost:3000/api/tour-management/tours/64f8a1b2c3d4e5f6a7b8c9d0/status \
     -H "Authorization: Bearer <user-token>" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "in-progress",
       "notes": "Arrived at site, starting inspection",
       "actualVisitTime": "2024-01-15T10:30:00.000Z"
     }'
   ```

3. **User Completes Tour:**
   ```bash
   curl -X PATCH http://localhost:3000/api/tour-management/tours/64f8a1b2c3d4e5f6a7b8c9d0/status \
     -H "Authorization: Bearer <user-token>" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "completed",
       "notes": "Site inspection completed successfully",
       "completionNotes": "All systems working properly. Electrical connections verified. Plumbing checked and functional."
     }'
   ```

4. **Admin Reviews and Approves:**
   ```bash
   curl -X PATCH http://localhost:3000/api/tour-management/tours/64f8a1b2c3d4e5f6a7b8c9d0/status \
     -H "Authorization: Bearer <admin-token>" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "approved",
       "notes": "Tour report reviewed and approved. All requirements met."
     }'
   ```

### View Tour History
```bash
curl -X GET http://localhost:3000/api/tour-management/tours/64f8a1b2c3d4e5f6a7b8c9d0/status-history \
  -H "Authorization: Bearer <token>"
```

### Get User's Tours
```bash
curl -X GET "http://localhost:3000/api/tour-management/tours/my?page=1&limit=10" \
  -H "Authorization: Bearer <user-token>"
```

### Filter Tours by Status
```bash
curl -X GET "http://localhost:3000/api/tour-management/tours?status=completed&page=1&limit=20" \
  -H "Authorization: Bearer <admin-token>"
```

---

## 7. Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful operation
- `201 Created`: Tour created successfully
- `204 No Content`: Tour deleted successfully
- `400 Bad Request`: Invalid request parameters or invalid status transition
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Tour not found

### Common Error Scenarios

1. **Invalid Status Transition:**
   ```json
   {
     "statusCode": 400,
     "message": "Invalid status transition from 'completed' to 'in-progress'",
     "error": "Bad Request"
   }
   ```

2. **Tour Not Found:**
   ```json
   {
     "statusCode": 404,
     "message": "Tour not found",
     "error": "Not Found"
   }
   ```

---

## 8. Notes

- All timestamps are in ISO 8601 format
- Status changes are automatically logged with user information
- Tours support soft deletion (marked as inactive)
- Document uploads should be handled by a separate file upload service
- The system maintains complete audit trails for compliance
- All endpoints require valid JWT authentication
- User context is automatically extracted from JWT token
- Status transitions are validated to prevent invalid state changes

---

## 9. Future Enhancements

1. **File Upload Integration**: Direct file upload endpoints
2. **Email Notifications**: Status change notifications
3. **Mobile App Support**: GPS location tracking
4. **Reporting**: Advanced analytics and reporting
5. **Integration**: Calendar integration for scheduling
6. **Approval Workflows**: Multi-level approval processes
