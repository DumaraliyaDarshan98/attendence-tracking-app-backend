# Attendance System API Documentation

## Overview
The Attendance System provides APIs for managing user check-in and check-out functionality to track office time. All endpoints require JWT authentication.

## Base URL
```
http://localhost:3000/api/attendance
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. User Check-In

**POST** `/attendance/checkin`

Records the user's check-in time for the current day.

**Request:**
- No body required
- User ID is extracted from JWT token

**Response:**
```json
{
  "code": 201,
  "status": "Created",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "date": "2023-12-08T00:00:00.000Z",
    "checkInTime": "2023-12-08T09:00:00.000Z",
    "isCheckedOut": false,
    "status": "present",
    "createdAt": "2023-12-08T09:00:00.000Z",
    "updatedAt": "2023-12-08T09:00:00.000Z"
  },
  "timestamp": "2023-12-08T09:00:00.000Z",
  "path": "/api/attendance/checkin"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/attendance/checkin \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Error Responses:**
- `409 Conflict`: User already checked in today

---

## 2. User Check-Out

**POST** `/attendance/checkout`

Records the user's check-out time for the current day and calculates total hours worked.

**Request:**
- No body required
- User ID is extracted from JWT token

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "date": "2023-12-08T00:00:00.000Z",
    "checkInTime": "2023-12-08T09:00:00.000Z",
    "checkOutTime": "2023-12-08T17:00:00.000Z",
    "isCheckedOut": true,
    "totalHours": 8,
    "status": "present",
    "createdAt": "2023-12-08T09:00:00.000Z",
    "updatedAt": "2023-12-08T17:00:00.000Z"
  },
  "timestamp": "2023-12-08T17:00:00.000Z",
  "path": "/api/attendance/checkout"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/attendance/checkout \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Error Responses:**
- `404 Not Found`: No check-in record found for today
- `409 Conflict`: User already checked out today

---

## 3. Get Today's Attendance

**GET** `/attendance/today`

Retrieves the attendance record for the current day.

**Request:**
- No parameters required
- User ID is extracted from JWT token

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "date": "2023-12-08T00:00:00.000Z",
    "checkInTime": "2023-12-08T09:00:00.000Z",
    "checkOutTime": "2023-12-08T17:00:00.000Z",
    "isCheckedOut": true,
    "totalHours": 8,
    "status": "present"
  },
  "timestamp": "2023-12-08T17:00:00.000Z",
  "path": "/api/attendance/today"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/attendance/today \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 4. Get Attendance by Specific Date

**GET** `/attendance/date/{date}`

Retrieves attendance records for a specific date.

**Parameters:**
- `date` (path): Date in YYYY-MM-DD format

**Request:**
```
GET /attendance/date/2023-12-08
```

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "date": "2023-12-08T00:00:00.000Z",
      "checkInTime": "2023-12-08T09:00:00.000Z",
      "checkOutTime": "2023-12-08T17:00:00.000Z",
      "isCheckedOut": true,
      "totalHours": 8,
      "status": "present"
    }
  ],
  "timestamp": "2023-12-08T17:00:00.000Z",
  "path": "/api/attendance/date/2023-12-08"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/attendance/date/2023-12-08 \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 5. Get Attendance by Date Range

**GET** `/attendance/range?startDate={startDate}&endDate={endDate}`

Retrieves attendance records for a date range.

**Query Parameters:**
- `startDate`: Start date in YYYY-MM-DD format
- `endDate`: End date in YYYY-MM-DD format

**Request:**
```
GET /attendance/range?startDate=2023-12-01&endDate=2023-12-08
```

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "date": "2023-12-08T00:00:00.000Z",
      "checkInTime": "2023-12-08T09:00:00.000Z",
      "checkOutTime": "2023-12-08T17:00:00.000Z",
      "isCheckedOut": true,
      "totalHours": 8,
      "status": "present"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "date": "2023-12-07T00:00:00.000Z",
      "checkInTime": "2023-12-07T09:00:00.000Z",
      "checkOutTime": "2023-12-07T17:00:00.000Z",
      "isCheckedOut": true,
      "totalHours": 8,
      "status": "present"
    }
  ],
  "timestamp": "2023-12-08T17:00:00.000Z",
  "path": "/api/attendance/range"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/attendance/range?startDate=2023-12-01&endDate=2023-12-08" \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 6. Get All Attendance Records

**GET** `/attendance/all`

Retrieves all attendance records for the authenticated user.

**Request:**
- No parameters required
- User ID is extracted from JWT token

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "date": "2023-12-08T00:00:00.000Z",
      "checkInTime": "2023-12-08T09:00:00.000Z",
      "checkOutTime": "2023-12-08T17:00:00.000Z",
      "isCheckedOut": true,
      "totalHours": 8,
      "status": "present"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "date": "2023-12-07T00:00:00.000Z",
      "checkInTime": "2023-12-07T09:00:00.000Z",
      "checkOutTime": "2023-12-07T17:00:00.000Z",
      "isCheckedOut": true,
      "totalHours": 8,
      "status": "present"
    }
  ],
  "timestamp": "2023-12-08T17:00:00.000Z",
  "path": "/api/attendance/all"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/attendance/all \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## Data Model

### Attendance Schema
```typescript
{
  userId: ObjectId,        // Reference to User
  date: Date,              // Date of attendance
  checkInTime: Date,       // Check-in timestamp
  checkOutTime?: Date,     // Check-out timestamp (optional)
  isCheckedOut: boolean,   // Whether user has checked out
  totalHours?: number,     // Total hours worked
  status: string,          // 'present', 'absent', 'late', 'half-day'
  notes?: string,          // Additional notes
  createdAt: Date,         // Record creation timestamp
  updatedAt: Date          // Record last update timestamp
}
```

---

## Business Rules

1. **One record per user per day**: Users can only have one attendance record per day
2. **Check-in required before check-out**: Users must check-in before they can check-out
3. **No duplicate check-ins**: Users cannot check-in multiple times on the same day
4. **No duplicate check-outs**: Users cannot check-out multiple times on the same day
5. **Automatic time calculation**: Total hours are automatically calculated on check-out
6. **Date-based queries**: All date queries use the full day (00:00:00 to 23:59:59)

---

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Resource not found
- `409 Conflict`: Business rule violation (e.g., already checked in)

---

## Usage Examples

### Complete Work Day Flow
1. **Check-in**: `POST /attendance/checkin`
2. **Check-out**: `POST /attendance/checkout`
3. **View today's record**: `GET /attendance/today`

### Weekly Report
```bash
curl -X GET "http://localhost:3000/api/attendance/range?startDate=2023-12-04&endDate=2023-12-08" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Monthly Overview
```bash
curl -X GET "http://localhost:3000/api/attendance/range?startDate=2023-12-01&endDate=2023-12-31" \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## Notes

- All timestamps are in ISO 8601 format
- Dates are stored at midnight (00:00:00) for consistent querying
- Total hours are calculated in decimal format (e.g., 8.5 for 8 hours 30 minutes)
- The system automatically prevents duplicate check-ins/check-outs
- All endpoints require valid JWT authentication
- User ID is automatically extracted from the JWT token
