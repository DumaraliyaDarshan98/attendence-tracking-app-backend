# User Model Update Summary

## Overview
The user model has been updated to include additional fields for better user information management. The changes include splitting the `name` field into `firstname` and `lastname`, adding contact information, and address fields.

## 🔄 **Changes Made**

### **1. User Model (`src/models/user.model.ts`)**
- **Removed**: `name: string` field
- **Added**: 
  - `firstname: string` (required)
  - `lastname: string` (required)
  - `mobilenumber: string` (required)
  - `addressline1?: string` (optional)
  - `addressline2?: string` (optional)
  - `city?: string` (optional)
  - `state?: string` (optional)
  - `center?: string` (optional)
  - `pincode?: string` (optional)
- **Kept**: `email`, `password`, `role`, `isActive`, `createdAt`, `updatedAt`

### **2. Create User DTO (`src/users/dto/create-user.dto.ts`)**
- **Removed**: `name` field
- **Added**: 
  - `firstname: string` (required)
  - `lastname: string` (required)
  - `mobilenumber: string` (required, with mobile phone validation)
  - `addressline1?: string` (optional)
  - `addressline2?: string` (optional)
  - `city?: string` (optional)
  - `state?: string` (optional)
  - `center?: string` (optional)
  - `pincode?: string` (optional)
- **Updated**: Added `IsMobilePhone` validation import

### **3. Update User DTO (`src/users/dto/update-user.dto.ts`)**
- **Removed**: `name` field
- **Added**: All new fields as optional (same as create DTO)
- **Updated**: Added `IsMobilePhone` validation import

### **4. User Response DTO (`src/users/dto/user-response.dto.ts`)**
- **Removed**: `name` field
- **Added**: All new fields with proper Swagger documentation
- **Updated**: Examples and descriptions to reflect new structure

### **5. Users Service (`src/users/users.service.ts`)**
- **Updated**: `create()` method to handle new fields
- **Changed**: Destructuring and object creation to use new field names

### **6. Auth Service (`src/auth/auth.service.ts`)**
- **Updated**: `login()` method to return `firstname` and `lastname` instead of `name`
- **Changed**: User object structure in login response

### **7. Standard Response DTOs (`src/common/dto/standard-response.dto.ts`)**
- **Updated**: All user-related examples to use new field structure
- **Changed**: Swagger documentation examples

### **8. API Documentation (`API_DOCUMENTATION.md`)**
- **Updated**: All request/response examples
- **Changed**: cURL examples to use new field names
- **Updated**: Response schemas to include new fields

## 📊 **New User Structure**

### **Required Fields**
```typescript
{
  firstname: string;      // First name of the user
  lastname: string;       // Last name of the user
  email: string;          // Email address (unique)
  password: string;       // User password (min 6 chars)
  role: ObjectId;         // Reference to Role model
  mobilenumber: string;   // Mobile phone number
}
```

### **Optional Fields**
```typescript
{
  addressline1?: string;  // First line of address
  addressline2?: string;  // Second line of address
  city?: string;          // City name
  state?: string;         // State or province
  center?: string;        // Center or district
  pincode?: string;       // Postal/ZIP code
  isActive?: boolean;     // Account status (default: true)
}
```

### **System Fields**
```typescript
{
  _id: string;            // MongoDB ObjectId
  createdAt: Date;        // Creation timestamp
  updatedAt: Date;        // Last update timestamp
}
```

## 🔧 **Validation Rules**

### **Create User**
- `firstname`: Required, string
- `lastname`: Required, string
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `role`: Required, valid role enum
- `mobilenumber`: Required, valid mobile phone format
- Address fields: All optional, string type

### **Update User**
- All fields are optional
- Same validation rules apply when fields are provided
- Password is hashed if provided

## 📝 **API Examples**

### **Create User Request**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "user",
  "mobilenumber": "+1234567890",
  "addressline1": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "pincode": "10001"
}
```

### **Create User Response**
```json
{
  "code": 201,
  "status": "Created",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "role": "user",
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
  "path": "/api/users"
}
```

## 🚀 **Benefits of Changes**

### **Better User Management**
- Separate first and last names for better sorting and filtering
- Contact information for user communication
- Complete address information for location-based features

### **Enhanced Validation**
- Mobile phone number validation
- Required vs optional field distinction
- Better data integrity

### **Improved API Documentation**
- Clear field descriptions and examples
- Consistent response structure
- Better developer experience

## ⚠️ **Migration Notes**

### **Database Changes**
- Existing users will need to be migrated to new structure
- `name` field should be split into `firstname` and `lastname`
- New required fields need to be populated

### **Frontend Updates**
- Update forms to use new field names
- Handle new required fields
- Display new address information

### **API Consumers**
- Update request payloads to use new structure
- Handle new response fields
- Update validation logic

## 🧪 **Testing**

### **Required Fields Test**
- Verify all required fields are validated
- Check error messages for missing fields

### **Optional Fields Test**
- Verify optional fields can be omitted
- Check optional fields are properly saved when provided

### **Validation Test**
- Test mobile phone format validation
- Verify email uniqueness
- Check password length requirements

### **Response Format Test**
- Verify new response structure
- Check all fields are properly populated
- Validate Swagger documentation accuracy

## 🔮 **Future Enhancements**

### **Address Validation**
- Integrate with address validation services
- Add postal code validation
- City/state autocomplete

### **Contact Verification**
- Mobile number verification via SMS
- Email verification
- Two-factor authentication

### **User Profiles**
- Profile picture support
- Additional contact methods
- User preferences
