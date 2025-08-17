# Simple Document Upload API

## Overview
This is a clean, simple document upload API that allows users to upload files and get the uploaded document URL in response.

## API Endpoint

### Upload Document
**POST** `/api/document-upload/upload`

**Description:** Upload a single document file and get the file URL

**Authentication:** Required (JWT Bearer token)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required): Document file to upload

**Supported File Types:**
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- Images: JPG, JPEG, PNG, GIF
- Archives: ZIP, RAR
- Maximum file size: 10MB

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
```

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "fileName": "original_filename.pdf",
    "fileUrl": "http://localhost:3000/uploads/filename_1705310400000_abc123.pdf",
    "fileSize": 1024000,
    "fileType": "application/pdf"
  }
}
```

## Usage Examples

### cURL Example
```bash
curl -X POST http://localhost:3000/api/document-upload/upload \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "file=@document.pdf"
```

### JavaScript/Fetch Example
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/document-upload/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});

const result = await response.json();
console.log('File URL:', result.data.fileUrl);
```

### Postman
1. Set method to `POST`
2. Set URL to `http://localhost:3000/api/document-upload/upload`
3. Add header: `Authorization: Bearer <your-jwt-token>`
4. In Body tab, select `form-data`
5. Add key `file` with type `File` and select your file
6. Send request

## File Access
Uploaded files are accessible via the returned `fileUrl`. The files are stored in the `uploads/` directory and served statically.

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "No file uploaded",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Access token required",
  "error": "Unauthorized"
}
```

### 400 Bad Request - File Validation
```json
{
  "statusCode": 400,
  "message": "File too large",
  "error": "Bad Request"
}
```

## Features
- ✅ Simple single file upload
- ✅ Automatic unique filename generation
- ✅ File type validation
- ✅ File size validation (10MB max)
- ✅ JWT authentication
- ✅ Returns file URL for immediate access
- ✅ Static file serving
- ✅ Clean, minimal API response

## File Storage
- Files are stored in the `uploads/` directory
- Unique filenames prevent conflicts
- Files are accessible via HTTP URLs
- No complex metadata or categorization required

## Security
- JWT authentication required
- File type validation prevents malicious uploads
- File size limits prevent abuse
- User context maintained for uploads
