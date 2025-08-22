# Roles and Permissions System

## Overview

This document describes the comprehensive roles and permissions system implemented in the Attendance Management System. The system allows users to create custom roles with granular, module-based permissions and assign them to employees.

## Key Features

- **Custom Role Creation**: Users can create custom roles with specific permissions
- **Module-based Permissions**: Granular permissions for different system modules
- **Action-based Access Control**: Fine-grained control over create, read, update, delete, list, approve, reject, and export actions
- **Frontend-only Access Control**: No backend guards required - all access control is managed in the frontend
- **System Role Protection**: System roles cannot be deleted or modified
- **Performance Optimized**: Permissions stored directly in roles for faster access

## Architecture

### Database Structure

#### Role Model
```typescript
export interface Role {
  _id: string;
  name: string;                    // Unique role identifier
  displayName: string;             // Human-readable role name
  description?: string;            // Role description
  isSuperAdmin: boolean;           // Super admin privileges
  permissions: RolePermission[];   // Module-based permissions
  isActive: boolean;               // Role status
  isSystemRole: boolean;           // System role protection
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  module: string;                  // Module name (e.g., 'users', 'attendance')
  actions: string[];               // Allowed actions for the module
}
```

#### User Model
```typescript
export interface User {
  // ... other fields
  role: Types.ObjectId;            // Reference to Role
  // ... other fields
}
```

### Permission Structure

#### Available Modules
- `users` - User management
- `roles` - Role management
- `permissions` - Permission management
- `attendance` - Attendance records
- `leave` - Leave requests
- `holiday` - Holiday management
- `tour` - Tour requests
- `timelog` - Time logging
- `reports` - System reports

#### Available Actions
- `create` - Create new items
- `read` - View individual items
- `update` - Modify existing items
- `delete` - Remove items
- `list` - View lists of items
- `approve` - Approve requests
- `reject` - Reject requests
- `export` - Export data

## API Endpoints

### Roles Management

#### Create Role
```http
POST /roles
Content-Type: application/json

{
  "name": "content_manager",
  "displayName": "Content Manager",
  "description": "Manages content and user permissions",
  "isSuperAdmin": false,
  "permissions": [
    {
      "module": "users",
      "actions": ["read", "list", "update"]
    },
    {
      "module": "attendance",
      "actions": ["read", "list", "export"]
    }
  ]
}
```

#### Update Role
```http
PATCH /roles/:id
Content-Type: application/json

{
  "displayName": "Updated Content Manager",
  "permissions": [
    {
      "module": "users",
      "actions": ["read", "list", "update", "create"]
    }
  ]
}
```

#### Assign Permissions
```http
POST /roles/:id/permissions
Content-Type: application/json

{
  "permissions": [
    {
      "module": "users",
      "actions": ["read", "list", "create", "update"]
    },
    {
      "module": "leave",
      "actions": ["read", "list", "approve", "reject"]
    }
  ]
}
```

#### Get Roles
```http
GET /roles?page=1&limit=10&search=manager&sortBy=createdAt&sortOrder=desc
```

#### Get Role by ID
```http
GET /roles/:id
```

#### Delete Role
```http
DELETE /roles/:id
```

## Frontend Implementation

### Permission Service

The frontend uses a comprehensive permission service to check user access:

```typescript
// Check specific permission
this.permissionService.hasPermission('users', 'create');

// Check module access
this.permissionService.canAccessModule('attendance');

// Check specific actions
this.permissionService.canCreate('users');
this.permissionService.canRead('attendance');
this.permissionService.canUpdate('leave');
this.permissionService.canDelete('holiday');
this.permissionService.canList('tour');
this.permissionService.canApprove('leave');
this.permissionService.canReject('leave');
this.permissionService.canExport('reports');
```

### Role Form Component

The role creation/editing form provides an intuitive interface for managing permissions:

- **Module-based Organization**: Permissions grouped by system modules
- **Bulk Selection**: Select/deselect all permissions for a module
- **Visual Feedback**: Clear indication of selected permissions
- **Validation**: Ensures valid permission combinations

### Permission Directives

Use permission directives in templates to conditionally show/hide UI elements:

```html
<!-- Show only if user can create users -->
<button *appPermission="'users:create'">Create User</button>

<!-- Show only if user can access attendance module -->
<div *appPermission="'attendance:list'">Attendance List</div>
```

## Default Roles

The system comes with pre-configured default roles:

### Super Administrator
- **Access**: All modules and actions
- **Description**: Full system access and role management
- **Protection**: System role (cannot be deleted)

### Administrator
- **Access**: Most modules with limited role management
- **Description**: High-level system management
- **Protection**: System role (cannot be deleted)

### Manager
- **Access**: User management and reporting
- **Description**: Team and project management
- **Protection**: System role (cannot be deleted)

### User
- **Access**: Basic attendance and leave management
- **Description**: Standard user access
- **Protection**: System role (cannot be deleted)

## Migration

### From Old Permission System

If upgrading from the previous permission system, run the migration script:

```bash
node migrate-roles-permissions.js
```

The migration script will:
1. Detect existing permission structure
2. Convert permission references to module-based format
3. Preserve existing role assignments
4. Set appropriate system role flags

### Migration Output Example

```
🔌 Connecting to MongoDB...
📊 Connected to database: attendance_system
🔄 Starting migration to new permission structure...
📋 Found 45 existing permissions
🔄 Migrating role: super_admin
✅ Migrated role: super_admin with 9 module permissions
🔄 Migrating role: admin
✅ Migrated role: admin with 7 module permissions
🔄 Migrating role: manager
✅ Migrated role: manager with 7 module permissions
🔄 Migrating role: user
✅ Migrated role: user with 5 module permissions
🎉 Migration completed successfully!

📊 Migration Summary:
  - super_admin: 9 modules, 45 total actions
  - admin: 7 modules, 35 total actions
  - manager: 7 modules, 28 total actions
  - user: 5 modules, 20 total actions
```

## Security Considerations

### Frontend-Only Access Control
- **No Backend Guards**: API endpoints remain open for flexibility
- **Frontend Validation**: All access control implemented in Angular components
- **User Experience**: Immediate feedback on permission restrictions

### Role Protection
- **System Roles**: Core roles cannot be deleted or modified
- **Custom Roles**: User-created roles can be fully managed
- **Role Assignment**: Users can only assign roles they have permission to manage

### Permission Validation
- **Input Validation**: All permission structures validated on creation/update
- **Module Validation**: Only predefined modules allowed
- **Action Validation**: Only predefined actions allowed per module

## Best Practices

### Role Design
1. **Principle of Least Privilege**: Grant only necessary permissions
2. **Module Grouping**: Group related permissions by module
3. **Action Consistency**: Use consistent action sets across similar modules
4. **Documentation**: Provide clear descriptions for custom roles

### Permission Management
1. **Regular Review**: Periodically review role permissions
2. **Audit Trail**: Track permission changes and role assignments
3. **Testing**: Test role permissions in development environment
4. **Backup**: Maintain role configuration backups

### User Experience
1. **Clear Feedback**: Show users what they can and cannot access
2. **Progressive Disclosure**: Hide advanced features from basic users
3. **Consistent UI**: Apply permission checks consistently across the application
4. **Error Handling**: Provide helpful messages for permission-denied actions

## Troubleshooting

### Common Issues

#### Permission Not Working
1. Check if user has the correct role assigned
2. Verify role has the required module permission
3. Ensure action is included in module actions array
4. Check if user is marked as inactive

#### Role Cannot Be Deleted
1. Verify role is not marked as system role
2. Check if role is assigned to any users
3. Ensure user has permission to delete roles

#### Migration Errors
1. Verify MongoDB connection
2. Check database name and collection names
3. Ensure sufficient permissions for database operations
4. Review migration logs for specific error details

### Debug Information

Enable debug logging to troubleshoot permission issues:

```typescript
// In development environment
console.log('User permissions:', this.permissionService.getUserPermissions());
console.log('Module permissions:', this.permissionService.getModulePermissions('users'));
console.log('Has permission:', this.permissionService.hasPermission('users', 'create'));
```

## Future Enhancements

### Planned Features
- **Permission Templates**: Predefined permission sets for common roles
- **Dynamic Permissions**: Runtime permission modification
- **Permission Inheritance**: Hierarchical permission structures
- **Advanced Auditing**: Detailed permission usage tracking

### Extension Points
- **Custom Modules**: Support for additional system modules
- **Custom Actions**: Extensible action definitions
- **Permission Plugins**: Modular permission system
- **Integration APIs**: External permission system integration

## Support

For questions or issues with the roles and permissions system:

1. **Documentation**: Review this document and related API docs
2. **Code Examples**: Check the frontend components and services
3. **Migration**: Use the provided migration script
4. **Development**: Review the source code in `src/roles/` and `src/models/`

---

*Last updated: [Current Date]*
*Version: 2.0.0*
