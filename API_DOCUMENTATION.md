# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication Endpoints

### 1. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### 2. Send OTP for Password Reset
**POST** `/auth/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

### 3. Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully",
  "success": true
}
```

## User Management Endpoints

### 1. User Registration (Public)
**POST** `/users/register`

**Description:** Public endpoint to register a new user. No authentication required.

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobilenumber": "+1234567890",
  "role": "64f8a1b2c3d4e5f6a7b8c9d0",
  "addressline1": "123 Main Street",
  "addressline2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "center": "Manhattan",
  "pincode": "10001"
}
```

**Note:** The `role` field is optional. If not provided, the user will be created without a role assignment and will have full permissions to access all endpoints.

**Response:**
```json
{
  "code": 201,
  "status": "Created",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "user",
      "displayName": "User",
      "description": "Regular user role",
      "isActive": true
    },
    "mobilenumber": "+1234567890",
    "addressline1": "123 Main Street",
    "addressline2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "center": "Manhattan",
    "pincode": "10001",
    "isActive": true,
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  },
  "timestamp": "2023-09-06T10:30:00.000Z",
  "path": "/users/register"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "mobilenumber": "+1234567890",
    "addressline1": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "pincode": "10001"
  }'
```

### 2. Get User Profile
**GET** `/users/profile`

**Description:** Get the current user's profile. Requires authentication token only (no specific permissions required).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "user",
      "displayName": "User",
      "description": "Basic user with limited access",
      "isActive": true
    },
    "mobilenumber": "+1234567890",
    "addressline1": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "pincode": "10001",
    "isActive": true,
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  },
  "timestamp": "2023-09-06T10:30:00.000Z",
  "path": "/users/profile"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 3. Create User (Protected)
**POST** `/users`

**Note:** This endpoint requires JWT authentication only. Role and permission checks are handled on the frontend.

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "64f8a1b2c3d4e5f6a7b8c9d0",
  "mobilenumber": "+1234567890",
  "addressline1": "123 Main Street",
  "addressline2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "center": "Manhattan",
  "pincode": "10001"
}
```

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "role": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "user",
    "displayName": "User",
    "description": "Basic user with limited access"
  },
  "mobilenumber": "+1234567890",
  "addressline1": "123 Main Street",
  "addressline2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "center": "Manhattan",
  "pincode": "10001",
  "isActive": true,
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z"
}
```

### 2. Get All Users
**GET** `/users`

**Note:** This endpoint requires JWT authentication only. Role and permission checks are handled on the frontend.

**Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "user",
      "displayName": "User",
      "description": "Basic user with limited access"
    },
    "mobilenumber": "+1234567890",
    "addressline1": "123 Main Street",
    "addressline2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "center": "Manhattan",
    "pincode": "10001",
    "isActive": true,
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  }
]
```

### 3. Get User by ID
**GET** `/users/:id`

**Note:** This endpoint requires JWT authentication only. Role and permission checks are handled on the frontend.

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "role": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "user",
    "displayName": "User",
    "description": "Basic user with limited access"
  },
  "mobilenumber": "+1234567890",
  "addressline1": "123 Main Street",
  "addressline2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "center": "Manhattan",
  "pincode": "10001",
  "isActive": true,
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z"
}
```

### 4. Update User
**PATCH** `/users/:id`

**Note:** This endpoint requires JWT authentication only. Role and permission checks are handled on the frontend.

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Smith",
  "role": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "firstname": "John",
  "lastname": "Smith",
  "email": "john@example.com",
  "role": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "admin",
    "displayName": "Administrator",
    "description": "Administrator role"
  },
  "mobilenumber": "+1234567890",
  "addressline1": "123 Main Street",
  "addressline2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "center": "Manhattan",
  "pincode": "10001",
  "isActive": true,
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:35:00.000Z"
}
```

### 5. Delete User
**DELETE** `/users/:id`

**Note:** This endpoint requires JWT authentication only. Role and permission checks are handled on the frontend.

**Response:** `204 No Content`

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

## Authentication

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstname": "John", "lastname": "Doe", "email": "john@example.com", "password": "password123", "role": "64f8a1b2c3d4e5f6a7b8c9d0", "mobilenumber": "+1234567890", "addressline1": "123 Main Street", "city": "New York", "state": "NY", "pincode": "10001"}'
```

### Get All Users
```bash
curl -X GET http://localhost:3000/api/users
```

### Update User
```bash
curl -X PATCH http://localhost:3000/api/users/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{"firstname": "John", "lastname": "Smith", "role": "64f8a1b2c3d4e5f6a7b8c9d0"}'
```

### Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/64f8a1b2c3d4e5f6a7b8c9d0
```

## Environment Variables

Make sure to set up your `.env` file with the following variables:

```env
MONGODB_URI=your-mongodb-connection-string
DB_NAME=attendance_tracking
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
``` 