# Attendance System Update Documentation

## Overview
The attendance system has been updated to support multiple check-in/check-out sessions per day, improved validation, and admin features for monitoring all users' attendance data.

## Key Changes

### 1. Multiple Sessions Per Day
- Users can now have multiple check-in/check-out sessions on the same day
- Each session is tracked with a unique `sessionNumber`
- Users must check out from their current session before starting a new one

### 2. Enhanced Validation Logic
- **Check-in**: Prevents check-in if user has an active (unchecked-out) session
- **Check-out**: Only allows check-out from the most recent active session
- **Error Messages**: More descriptive error messages for better user experience

### 3. New Admin API
- **Endpoint**: `GET /attendance/admin/all`
- **Features**: Date filter (required), user filter (optional), pagination
- **Response**: Populated user data with attendance records

## Database Schema Updates

### Attendance Model
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
  sessionNumber: number,   // Session number for the day (1, 2, 3...)
  createdAt: Date,         // Record creation timestamp
  updatedAt: Date          // Record last update timestamp
}
```

### Database Index
- **Old**: `{ userId: 1, date: 1 }` (unique - one record per user per day)
- **New**: `{ userId: 1, date: 1, sessionNumber: 1 }` (unique - multiple sessions per day)

## API Endpoints

### 1. User Check-In
**POST** `/attendance/checkin`

**Business Rules:**
- User must check out from current session before checking in again
- Each new session gets an incremented session number
- Different days allow new check-ins regardless of previous sessions

**Response Example:**
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
    "sessionNumber": 1,
    "createdAt": "2023-12-08T09:00:00.000Z",
    "updatedAt": "2023-12-08T09:00:00.000Z"
  }
}
```

### 2. User Check-Out
**POST** `/attendance/checkout`

**Business Rules:**
- Only allows check-out from the most recent active session
- Automatically calculates total hours worked
- Marks session as completed

**Response Example:**
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
    "sessionNumber": 1,
    "createdAt": "2023-12-08T09:00:00.000Z",
    "updatedAt": "2023-12-08T17:00:00.000Z"
  }
}
```

### 3. Get Today's Attendance
**GET** `/attendance/today`

**Changes:**
- Now returns an array of all sessions for the day
- Sessions are sorted by session number (newest first)

**Response Example:**
```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "date": "2023-12-08T00:00:00.000Z",
      "checkInTime": "2023-12-08T18:00:00.000Z",
      "isCheckedOut": false,
      "status": "present",
      "sessionNumber": 2
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "date": "2023-12-08T00:00:00.000Z",
      "checkInTime": "2023-12-08T09:00:00.000Z",
      "checkOutTime": "2023-12-08T17:00:00.000Z",
      "isCheckedOut": true,
      "totalHours": 8,
      "status": "present",
      "sessionNumber": 1
    }
  ]
}
```

### 4. Admin: Get All Users Attendance
**GET** `/attendance/admin/all`

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `userId` (optional): Filter by specific user ID
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Records per page (default: 10)

**Response Example:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "data": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "userId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "firstname": "John",
          "lastname": "Doe",
          "email": "john@example.com"
        },
        "date": "2023-12-08T00:00:00.000Z",
        "checkInTime": "2023-12-08T09:00:00.000Z",
        "checkOutTime": "2023-12-08T17:00:00.000Z",
        "isCheckedOut": true,
        "totalHours": 8,
        "status": "present",
        "sessionNumber": 1
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

## Business Rules

### Check-In Rules
1. **Active Session Check**: User cannot check in if they have an active (unchecked-out) session
2. **Session Numbering**: Each new session gets an incremented session number for the day
3. **Cross-Day Sessions**: New days allow new check-ins regardless of previous day's sessions

### Check-Out Rules
1. **Active Session Only**: Only the most recent active session can be checked out
2. **Time Calculation**: Total hours are automatically calculated on check-out
3. **Session Completion**: Session is marked as completed after check-out

### Multiple Sessions Per Day
1. **Morning Session**: Check-in at 9:00 AM, Check-out at 12:00 PM
2. **Afternoon Session**: Check-in at 1:00 PM, Check-out at 5:00 PM
3. **Evening Session**: Check-in at 6:00 PM (if needed)

## Error Handling

### Check-In Errors
- `409 Conflict`: "You need to check out from your current session before checking in again"

### Check-Out Errors
- `404 Not Found`: "No active check-in session found for today"

## Usage Examples

### Complete Work Day with Multiple Sessions
```bash
# Morning session
curl -X POST http://localhost:3000/api/attendance/checkin \
  -H "Authorization: Bearer <token>"

curl -X POST http://localhost:3000/api/attendance/checkout \
  -H "Authorization: Bearer <token>"

# Afternoon session
curl -X POST http://localhost:3000/api/attendance/checkin \
  -H "Authorization: Bearer <token>"

curl -X POST http://localhost:3000/api/attendance/checkout \
  -H "Authorization: Bearer <token>"
```

### Admin Monitoring
```bash
# Get all users' attendance for a specific date
curl -X GET "http://localhost:3000/api/attendance/admin/all?date=2023-12-08" \
  -H "Authorization: Bearer <admin-token>"

# Filter by specific user with pagination
curl -X GET "http://localhost:3000/api/attendance/admin/all?date=2023-12-08&userId=64f8a1b2c3d4e5f6a7b8c9d0&page=1&limit=5" \
  -H "Authorization: Bearer <admin-token>"
```

## Migration Notes

### Database Changes
- New `sessionNumber` field added to existing attendance records
- Existing records will have `sessionNumber: 1` by default
- Database index updated to support multiple sessions per day

### API Changes
- `GET /attendance/today` now returns an array instead of a single object
- New admin endpoint `GET /attendance/admin/all` added
- Enhanced error messages for better user experience

## Benefits

1. **Flexibility**: Users can work in multiple sessions per day
2. **Accuracy**: Better tracking of actual working hours
3. **Admin Control**: Comprehensive monitoring of all users' attendance
4. **User Experience**: Clear error messages and validation
5. **Scalability**: Support for complex work patterns and schedules

## Future Enhancements

1. **Break Time Tracking**: Automatic break time calculation between sessions
2. **Overtime Calculation**: Total daily hours with overtime thresholds
3. **Geolocation**: Check-in/out location tracking
4. **Mobile App**: Push notifications for check-in/out reminders
5. **Reporting**: Advanced analytics and reporting features
