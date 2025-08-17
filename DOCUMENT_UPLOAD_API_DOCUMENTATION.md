# Document Upload API Documentation

## Overview
The Document Upload System provides comprehensive APIs for uploading, managing, and retrieving documents. Users can upload single or multiple files with metadata, organize them with tags and categories, and search through their documents efficiently.

## Base URL
```
http://localhost:3000/api/document-upload
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Document Upload

### 1.1 Upload Single Document
**POST** `/document-upload/upload-single`

**Description:** Upload a single document file with optional metadata

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required): Document file to upload
- `description` (optional): Description of the document
- `tags` (optional): Comma-separated tags for categorization
- `category` (optional): Category of the document (default: 'document')

**File Types Supported:**
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- Images: JPG, JPEG, PNG, GIF
- Archives: ZIP, RAR
- Maximum file size: 10MB

**Response:**
```json
{
  "code": 201,
  "status": "Created",
  "data": {
    "message": "Document uploaded successfully",
    "document": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fileName": "site_plan_1705310400000_abc123.pdf",
      "originalFileName": "site_plan.pdf",
      "fileUrl": "http://localhost:3000/uploads/site_plan_1705310400000_abc123.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024000,
      "isActive": true,
      "description": "Site plan for construction project",
      "tags": ["construction", "site-plan", "pdf"],
      "category": "document",
      "uploadedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/document-upload/upload-single"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/document-upload/upload-single \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "file=@site_plan.pdf" \
  -F "description=Site plan for construction project" \
  -F "tags=construction,site-plan,pdf" \
  -F "category=document"
```

### 1.2 Upload Multiple Documents
**POST** `/document-upload/upload-multiple`

**Description:** Upload multiple document files with optional metadata

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files` (required): Array of document files to upload (max 10 files)
- `descriptions` (optional): Comma-separated descriptions for each document
- `tags` (optional): Comma-separated tags for categorizing the documents
- `category` (optional): Category of the documents (default: 'document')

**Response:**
```json
{
  "code": 201,
  "status": "Created",
  "data": {
    "message": "Documents uploaded successfully",
    "count": 3,
    "documents": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "fileName": "site_plan_1705310400000_abc123.pdf",
        "originalFileName": "site_plan.pdf",
        "fileUrl": "http://localhost:3000/uploads/site_plan_1705310400000_abc123.pdf",
        "fileType": "application/pdf",
        "fileSize": 1024000,
        "isActive": true,
        "description": "Site plan for construction project",
        "tags": ["construction", "site-plan", "pdf"],
        "category": "document"
      },
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "fileName": "blueprint_1705310400000_def456.dwg",
        "originalFileName": "blueprint.dwg",
        "fileUrl": "http://localhost:3000/uploads/blueprint_1705310400000_def456.dwg",
        "fileType": "application/acad",
        "fileSize": 2048000,
        "isActive": true,
        "description": "Technical blueprint",
        "tags": ["construction", "blueprint", "technical"],
        "category": "document"
      }
    ]
  },
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/document-upload/upload-multiple"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/document-upload/upload-multiple \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "files=@site_plan.pdf" \
  -F "files=@blueprint.dwg" \
  -F "descriptions=Site plan for construction project,Technical blueprint" \
  -F "tags=construction,technical" \
  -F "category=document"
```

---

## 2. Document Retrieval

### 2.1 Get All Documents
**GET** `/document-upload`

**Description:** Retrieve all documents with pagination and filtering options

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `userId` (optional): Filter by user ID
- `category` (optional): Filter by category
- `tags` (optional): Filter by tags (comma-separated)

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "documents": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "fileName": "site_plan_1705310400000_abc123.pdf",
        "originalFileName": "site_plan.pdf",
        "fileUrl": "http://localhost:3000/uploads/site_plan_1705310400000_abc123.pdf",
        "fileType": "application/pdf",
        "fileSize": 1024000,
        "isActive": true,
        "description": "Site plan for construction project",
        "tags": ["construction", "site-plan", "pdf"],
        "category": "document",
        "uploadedBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "firstname": "John",
          "lastname": "Doe",
          "email": "john@example.com"
        },
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/document-upload"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/document-upload?page=1&limit=10&category=document&tags=construction,pdf" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 2.2 Get My Documents
**GET** `/document-upload/my-documents`

**Description:** Retrieve documents uploaded by the authenticated user

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** Same format as "Get All Documents" but filtered by current user

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/document-upload/my-documents?page=1&limit=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 2.3 Get Documents by Category
**GET** `/document-upload/category/{category}`

**Description:** Retrieve documents filtered by category

**Path Parameters:**
- `category`: Category name

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** Same format as "Get All Documents" but filtered by category

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/document-upload/category/document?page=1&limit=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 2.4 Search Documents
**GET** `/document-upload/search`

**Description:** Search documents by filename, description, or tags

**Query Parameters:**
- `q` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** Same format as "Get All Documents" but filtered by search term

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/document-upload/search?q=construction&page=1&limit=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 2.5 Get Document by ID
**GET** `/document-upload/{id}`

**Description:** Retrieve a specific document by its ID

**Path Parameters:**
- `id`: Document ID

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fileName": "site_plan_1705310400000_abc123.pdf",
    "originalFileName": "site_plan.pdf",
    "fileUrl": "http://localhost:3000/uploads/site_plan_1705310400000_abc123.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "isActive": true,
    "description": "Site plan for construction project",
    "tags": ["construction", "site-plan", "pdf"],
    "category": "document",
    "uploadedBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/document-upload/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/document-upload/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 3. Document Management

### 3.1 Update Document Metadata
**PUT** `/document-upload/{id}`

**Description:** Update document description, tags, or category

**Path Parameters:**
- `id`: Document ID

**Request Body:**
```json
{
  "description": "Updated description for the document",
  "tags": ["updated", "construction", "site-plan"],
  "category": "technical"
}
```

**Response:** Updated document object

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/document-upload/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description for the document",
    "tags": ["updated", "construction", "site-plan"],
    "category": "technical"
  }'
```

### 3.2 Delete Document
**DELETE** `/document-upload/{id}`

**Description:** Soft delete a document (marks as inactive)

**Path Parameters:**
- `id`: Document ID

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "message": "Document deleted successfully"
  },
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/document-upload/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/document-upload/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 4. Document Statistics

### 4.1 Get Document Statistics
**GET** `/document-upload/stats`

**Description:** Retrieve document upload statistics

**Query Parameters:**
- `userId` (optional): Filter stats by user ID

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "totalDocuments": 25,
    "totalSize": 52428800,
    "categories": {
      "document": 15,
      "image": 8,
      "archive": 2
    },
    "fileTypes": {
      "application/pdf": 10,
      "image/jpeg": 5,
      "application/msword": 3,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 2
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/document-upload/stats"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/document-upload/stats?userId=64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 5. Data Models

### Document Schema
```typescript
{
  _id: ObjectId,              // Document ID
  uploadedBy: ObjectId,       // Reference to User
  fileName: string,            // Unique filename on server
  originalFileName: string,    // Original filename from user
  fileUrl: string,             // Public URL to access file
  fileType: string,            // MIME type of file
  fileSize: number,            // Size in bytes
  isActive: boolean,           // Whether document is active
  description?: string,        // Optional description
  tags: string[],              // Array of tags
  category: string,            // Document category
  createdAt: Date,             // Creation timestamp
  updatedAt: Date              // Last update timestamp
}
```

---

## 6. File Access

### Direct File Access
Uploaded files are accessible via direct URLs:
```
http://localhost:3000/uploads/{filename}
```

### File Security
- Files are stored in the `uploads/` directory
- Unique filenames prevent conflicts
- Access is controlled through the API
- Soft deletion preserves file history

---

## 7. Business Rules

### File Upload Rules
1. **File Size Limit**: Maximum 10MB per file
2. **File Types**: Supports common document, image, and archive formats
3. **Multiple Files**: Maximum 10 files per batch upload
4. **Unique Naming**: Automatic unique filename generation
5. **Metadata**: Optional description, tags, and category

### Access Control
1. **Authentication Required**: All endpoints require JWT token
2. **User Context**: Users can only manage their own documents
3. **Soft Delete**: Documents are marked inactive, not physically deleted
4. **Audit Trail**: Complete history of uploads and modifications

---

## 8. Error Handling

### Common Error Responses

**400 Bad Request - File Validation Error:**
```json
{
  "statusCode": 400,
  "message": "File too large",
  "error": "Bad Request"
}
```

**400 Bad Request - No File Uploaded:**
```json
{
  "statusCode": 400,
  "message": "No file uploaded",
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Document not found",
  "error": "Not Found"
}
```

---

## 9. Usage Examples

### Complete Document Upload Workflow

1. **Upload Single Document:**
   ```bash
   curl -X POST http://localhost:3000/api/document-upload/upload-single \
     -H "Authorization: Bearer <token>" \
     -F "file=@document.pdf" \
     -F "description=Important project document" \
     -F "tags=project,important,pdf" \
     -F "category=project"
   ```

2. **Upload Multiple Documents:**
   ```bash
   curl -X POST http://localhost:3000/api/document-upload/upload-multiple \
     -H "Authorization: Bearer <token>" \
     -F "files=@doc1.pdf" \
     -F "files=@doc2.docx" \
     -F "descriptions=First document,Second document" \
     -F "tags=project,documentation" \
     -F "category=project"
   ```

3. **Search Documents:**
   ```bash
   curl -X GET "http://localhost:3000/api/document-upload/search?q=project&page=1&limit=10" \
     -H "Authorization: Bearer <token>"
   ```

4. **Update Document:**
   ```bash
   curl -X PUT http://localhost:3000/api/document-upload/64f8a1b2c3d4e5f6a7b8c9d0 \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"description": "Updated description", "tags": ["updated", "project"]}'
   ```

5. **Get Document Statistics:**
   ```bash
   curl -X GET http://localhost:3000/api/document-upload/stats \
     -H "Authorization: Bearer <token>"
   ```

---

## 10. Notes

- All timestamps are in ISO 8601 format
- File URLs are automatically generated based on server configuration
- Maximum file size is 10MB per file
- Maximum 10 files can be uploaded in a single batch
- Files are stored with unique names to prevent conflicts
- Soft deletion preserves file history and metadata
- All endpoints require valid JWT authentication
- User context is automatically extracted from JWT token
- File access is controlled through the API endpoints

---

## 11. Future Enhancements

1. **Cloud Storage**: Integration with AWS S3, Google Cloud Storage
2. **File Versioning**: Support for multiple versions of the same document
3. **Advanced Search**: Full-text search within document contents
4. **File Sharing**: Share documents with specific users or groups
5. **Document Preview**: Generate previews for common file types
6. **Compression**: Automatic file compression for large files
7. **Virus Scanning**: Integration with antivirus scanning services
8. **Audit Logging**: Detailed logging of all file operations
