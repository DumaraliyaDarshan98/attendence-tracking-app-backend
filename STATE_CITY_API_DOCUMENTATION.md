# State and City Management API Documentation

## Overview
This document describes the State and City management APIs for the Attendance System backend. The system provides CRUD operations for managing Indian states and cities with proper relationships.

## Models

### State Model
```typescript
{
  code: string;        // 2-letter state code (e.g., "MH", "DL")
  name: string;        // Full state name (e.g., "Maharashtra", "Delhi")
  createdAt: Date;     // Auto-generated timestamp
  updatedAt: Date;     // Auto-generated timestamp
}
```

### City Model
```typescript
{
  name: string;        // City name
  state: ObjectId;     // Reference to State document
  createdAt: Date;     // Auto-generated timestamp
  updatedAt: Date;     // Auto-generated timestamp
}
```

## State API Endpoints

### 1. Create Single State
**POST** `/states`

**Request Body:**
```json
{
  "code": "MH",
  "name": "Maharashtra"
}
```

**Response:**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "code": "MH",
  "name": "Maharashtra",
  "createdAt": "2023-07-21T10:30:00.000Z",
  "updatedAt": "2023-07-21T10:30:00.000Z"
}
```

### 2. Bulk Create States
**POST** `/states/bulk`

**Request Body:**
```json
{
  "states": [
    { "code": "AN", "name": "Andaman and Nicobar Islands" },
    { "code": "AP", "name": "Andhra Pradesh" },
    { "code": "AR", "name": "Arunachal Pradesh" }
  ]
}
```

**Response:**
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "code": "AN",
    "name": "Andaman and Nicobar Islands",
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T10:30:00.000Z"
  },
  // ... more states
]
```

### 3. Get All States
**GET** `/states`

**Response:**
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "code": "AN",
    "name": "Andaman and Nicobar Islands",
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T10:30:00.000Z"
  }
]
```

### 4. Get State by ID
**GET** `/states/:id`

**Response:**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "code": "MH",
  "name": "Maharashtra",
  "createdAt": "2023-07-21T10:30:00.000Z",
  "updatedAt": "2023-07-21T10:30:00.000Z"
}
```

### 5. Update State
**PUT** `/states/:id`

**Request Body:**
```json
{
  "name": "Updated State Name"
}
```

### 6. Delete State
**DELETE** `/states/:id`

**Response:** `204 No Content`

## City API Endpoints

### 1. Create City
**POST** `/cities`

**Request Body:**
```json
{
  "name": "Mumbai",
  "state": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

**Response:**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
  "name": "Mumbai",
  "state": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Maharashtra",
    "code": "MH"
  },
  "createdAt": "2023-07-21T10:30:00.000Z",
  "updatedAt": "2023-07-21T10:30:00.000Z"
}
```

### 2. Bulk Create Cities
**POST** `/cities/bulk`

**Request Body:**
```json
{
  "states": [
    {
      "code": "AN",
      "name": "Andaman and Nicobar Islands",
      "cities": ["Port Blair", "Diglipur", "Mayabunder"]
    },
    {
      "code": "MH",
      "name": "Maharashtra",
      "cities": ["Mumbai", "Pune", "Nagpur", "Nashik"]
    }
  ]
}
```

**Response:**
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Port Blair",
    "state": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Andaman and Nicobar Islands",
      "code": "AN"
    },
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T10:30:00.000Z"
  },
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "name": "Mumbai",
    "state": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
      "name": "Maharashtra",
      "code": "MH"
    },
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T10:30:00.000Z"
  }
]
```

### 3. Get All Cities
**GET** `/cities`

**Query Parameters:**
- `state` (optional): Filter cities by state ID

**Examples:**
- `GET /cities` - Get all cities
- `GET /cities?state=60f7b3b3b3b3b3b3b3b3b3b3` - Get cities for specific state

**Response:**
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Mumbai",
    "state": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Maharashtra",
      "code": "MH"
    },
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T10:30:00.000Z"
  }
]
```

### 4. Get City by ID
**GET** `/cities/:id`

**Response:**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
  "name": "Mumbai",
  "state": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Maharashtra",
    "code": "MH"
  },
  "createdAt": "2023-07-21T10:30:00.000Z",
  "updatedAt": "2023-07-21T10:30:00.000Z"
}
```

### 5. Update City
**PUT** `/cities/:id`

**Request Body:**
```json
{
  "name": "Updated City Name",
  "state": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

### 6. Delete City
**DELETE** `/cities/:id`

**Response:** `204 No Content`

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "State not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "State with this code already exists",
  "error": "Conflict"
}
```

## Data Population Script

To populate the states with the provided data, run:

```bash
node populate-states.js
```

This script will:
1. Clear existing states
2. Insert all 37 Indian states and union territories
3. Display success/error messages

## Validation Rules

### State Validation
- `code`: Required, exactly 2 characters, unique
- `name`: Required, non-empty string

### City Validation
- `name`: Required, non-empty string
- `state`: Required, valid MongoDB ObjectId referencing a State

## Database Indexes

The following indexes are automatically created:
- `states.code`: Unique index
- `cities.state`: Index for efficient state-based queries
- `cities.name + cities.state`: Compound index for unique city names per state

## Usage Examples

### 1. Populate States
```bash
curl -X POST http://localhost:3000/states/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "states": [
      {"code": "MH", "name": "Maharashtra"},
      {"code": "DL", "name": "Delhi"}
    ]
  }'
```

### 2. Get All States
```bash
curl http://localhost:3000/states
```

### 3. Create a City
```bash
curl -X POST http://localhost:3000/cities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mumbai",
    "state": "STATE_OBJECT_ID_HERE"
  }'
```

### 4. Get Cities by State
```bash
curl "http://localhost:3000/cities?state=STATE_OBJECT_ID_HERE"
```

### 5. Bulk Create Cities
```bash
curl -X POST http://localhost:3000/cities/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "states": [
      {
        "code": "AN",
        "name": "Andaman and Nicobar Islands",
        "cities": ["Port Blair", "Diglipur"]
      },
      {
        "code": "MH",
        "name": "Maharashtra",
        "cities": ["Mumbai", "Pune", "Nagpur"]
      }
    ]
  }'
```

## Notes

- All timestamps are in UTC
- State codes follow the standard 2-letter ISO format
- Cities are linked to states via ObjectId references
- The bulk create endpoint replaces all existing states
- All endpoints return proper HTTP status codes
- Error messages are descriptive and helpful for debugging
