# Attendance System with Location Tracking - API Documentation

## Overview
The Attendance System has been enhanced to include **latitude and longitude tracking** for both check-in and check-out operations. This feature allows administrators to monitor where employees are checking in and out, providing better accountability and location-based insights.

## New Features

### 1. Location Tracking
- **Check-in Location**: Latitude and longitude coordinates when user checks in
- **Check-out Location**: Latitude and longitude coordinates when user checks out
- **Optional Fields**: Location data is optional and won't break existing functionality
- **Validation**: Coordinates are validated to ensure they're within valid ranges

### 2. Enhanced Data Model
- New fields added to the Attendance model
- Backward compatible with existing data
- Location data stored as optional fields

## Database Schema Updates

### Attendance Model
```typescript
{
  // ... existing fields ...
  
  // Location tracking for check-in
  checkInLatitude?: number;    // Latitude when checking in
  checkInLongitude?: number;   // Longitude when checking in
  
  // Location tracking for check-out
  checkOutLatitude?: number;   // Latitude when checking out
  checkOutLongitude?: number;  // Longitude when checking out
}
```

## API Endpoints

### 1. User Check-In with Location
**POST** `/api/attendance/checkin`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "code": 201,
  "status": "Created",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "date": "2024-01-15T00:00:00.000Z",
    "checkInTime": "2024-01-15T09:00:00.000Z",
    "isCheckedOut": false,
    "status": "present",
    "sessionNumber": 1,
    "checkInLatitude": 40.7128,
    "checkInLongitude": -74.0060,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  },
  "timestamp": "2024-01-15T09:00:00.000Z",
  "path": "/api/attendance/checkin"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/attendance/checkin \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

### 2. User Check-Out with Location
**POST** `/api/attendance/checkout`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
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
    "date": "2024-01-15T00:00:00.000Z",
    "checkInTime": "2024-01-15T09:00:00.000Z",
    "checkOutTime": "2024-01-15T17:00:00.000Z",
    "isCheckedOut": true,
    "totalHours": 8,
    "status": "present",
    "sessionNumber": 1,
    "checkInLatitude": 40.7128,
    "checkInLongitude": -74.0060,
    "checkOutLatitude": 40.7128,
    "checkOutLongitude": -74.0060,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T17:00:00.000Z"
  },
  "timestamp": "2024-01-15T17:00:00.000Z",
  "path": "/api/attendance/checkout"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/attendance/checkout \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

### 3. Start New Session with Location
**POST** `/api/attendance/start-new-session`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:** Same format as check-in but with incremented session number

## Location Data Validation

### Coordinate Ranges
- **Latitude**: -90 to +90 degrees
- **Longitude**: -180 to +180 degrees

### Validation Rules
- Both fields are optional
- If provided, must be valid numbers within ranges
- Invalid coordinates will result in 400 Bad Request error

### Example Valid Coordinates
```json
// New York City
{
  "latitude": 40.7128,
  "longitude": -74.0060
}

// London
{
  "latitude": 51.5074,
  "longitude": -0.1278
}

// Tokyo
{
  "latitude": 35.6762,
  "longitude": 139.6503
}
```

## Frontend Integration

### Getting User Location
```javascript
// Get current location using browser Geolocation API
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      
      // Use coordinates for check-in/check-out
      checkInWithLocation(latitude, longitude);
    },
    (error) => {
      console.error('Error getting location:', error);
      // Fallback: check-in without location
      checkInWithoutLocation();
    }
  );
} else {
  console.log('Geolocation not supported');
  // Fallback: check-in without location
  checkInWithoutLocation();
}
```

### Check-in with Location
```javascript
async function checkInWithLocation(latitude, longitude) {
  try {
    const response = await fetch('/api/attendance/checkin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        latitude: latitude,
        longitude: longitude
      })
    });
    
    const result = await response.json();
    console.log('Check-in successful with location:', result);
  } catch (error) {
    console.error('Check-in failed:', error);
  }
}
```

### Check-in without Location
```javascript
async function checkInWithoutLocation() {
  try {
    const response = await fetch('/api/attendance/checkin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const result = await response.json();
    console.log('Check-in successful without location:', result);
  } catch (error) {
    console.error('Check-in failed:', error);
  }
}
```

## Admin Features

### Location Data in Reports
All attendance retrieval endpoints now include location data:

- `GET /api/attendance/today` - Today's attendance with locations
- `GET /api/attendance/date/:date` - Specific date attendance with locations
- `GET /api/attendance/range` - Date range attendance with locations
- `GET /api/attendance/all` - All user attendance with locations
- `GET /api/attendance/admin/all-users` - Admin view with locations

### Location Analytics
Administrators can now:
- Track employee check-in/check-out locations
- Monitor attendance patterns by location
- Verify remote work locations
- Generate location-based reports

## Error Handling

### Location Validation Errors
```json
{
  "statusCode": 400,
  "message": "latitude must not be greater than 90",
  "error": "Bad Request"
}
```

### Missing Location (Not an Error)
- Check-in/check-out without location data works normally
- Location fields will be `undefined` in the response
- Existing functionality is preserved

## Migration Notes

### Backward Compatibility
- ✅ Existing attendance records remain unchanged
- ✅ Location fields are optional
- ✅ No database migration required
- ✅ Existing API calls continue to work

### New Fields
- `checkInLatitude` and `checkInLongitude` added to check-in
- `checkOutLatitude` and `checkOutLongitude` added to check-out
- All location fields are optional

## Security Considerations

### Location Privacy
- Location data is stored in the database
- Access controlled by existing authentication
- Consider implementing location data retention policies
- Users should be informed about location tracking

### Data Protection
- Location coordinates are precise data
- Consider implementing location anonymization for compliance
- Regular audit of location data access

## Future Enhancements

### Planned Features
1. **Geofencing**: Define allowed check-in/check-out areas
2. **Location History**: Track location changes during work hours
3. **Map Integration**: Visual representation of attendance locations
4. **Location Analytics**: Advanced reporting and insights
5. **Mobile App**: GPS-based automatic location detection

### Technical Improvements
1. **Coordinate Precision**: Configurable decimal places
2. **Location Caching**: Reduce API calls for repeated locations
3. **Batch Location Updates**: Efficient bulk location processing
4. **Location Validation**: Integration with mapping services

## Usage Examples

### Complete Work Day with Location
```bash
# Morning check-in with location
curl -X POST http://localhost:3000/api/attendance/checkin \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'

# Afternoon check-out with location
curl -X POST http://localhost:3000/api/attendance/checkout \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'
```

### Check-in without Location (Legacy Mode)
```bash
# Check-in without location data
curl -X POST http://localhost:3000/api/attendance/checkin \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Benefits

### For Employees
- **Flexibility**: Check-in/out from anywhere
- **Accuracy**: Precise location tracking
- **Transparency**: Clear record of work locations

### For Administrators
- **Accountability**: Verify work locations
- **Compliance**: Location-based attendance records
- **Insights**: Location-based analytics and reporting

### For Organizations
- **Remote Work Support**: Track distributed workforce
- **Audit Trail**: Complete location history
- **Risk Management**: Location-based security policies

## Summary

The Attendance System now provides comprehensive location tracking capabilities while maintaining full backward compatibility. Users can optionally provide their location during check-in and check-out operations, enabling better accountability and location-based insights for administrators.

**Key Features:**
- ✅ Optional location tracking for check-in/check-out
- ✅ Coordinate validation and error handling
- ✅ Backward compatible with existing data
- ✅ Enhanced admin reporting with location data
- ✅ Comprehensive API documentation
- ✅ Frontend integration examples

**Location Fields Added:**
- `checkInLatitude` & `checkInLongitude` for check-in
- `checkOutLatitude` & `checkOutLongitude` for check-out

This enhancement makes the attendance system more robust and suitable for modern workplace scenarios including remote work, field work, and location-based compliance requirements.
