# Music Backend

This is a backend (database, file storage, authentication) for my music website

## Response Format

```json
{
    "status": "success",
    "statusText": "Success message",
    "data": {
        "key": "value"
    }
}
```

```json
{
    "status": "error",
    "statusText": "Error message",
    "data": {
        "key": "value"
    }
}
```

## Paths

1. Database
    - Read Data:
        - GET /api/database/{table}
            - Parameters:
                - select: string - Select columns (comma separated)
                - limit: int - Limit the amount of rows returned
                - offset: int - Offset the rows returned
                - eq: json - Equal to (column: value)
                - neq: json - Not equal to (column: value)
                - gt: json - Greater than (column: value)
                - gte: json - Greater than or equal to (column: value)
                - lt: json - Less than (column: value)
                - lte: json - Less than or equal to (column: value)
        - GET /api/database/{table}/{id}
    - Write Data:
        - POST /api/database/{table}
        - PUT /api/database/{table}/{id}
        - DELETE /api/data/{table}/{id}
    - Create Table:
        - POST /api/database/table/{table}
    - Update Table:
        - PUT /api/database/table/{table}
    - Delete Table:
        - DELETE /api/database/table/{table}
2. File Storage:
    - Upload File:
        - POST /api/storage/upload/{bucket}
    - Download File:
        - GET /api/storage/download/{bucket}/{filename}
    - Delete File:
        - DELETE /api/storage/delete/{bucket}/{filename}
    - Create Bucket:
        - POST /api/storage/bucket/{bucket}
    - Update Bucket:
        - PUT /api/storage/bucket/{bucket}
    - Delete Bucket:
        - DELETE /api/storage/bucket/{bucket}
3. Authentication:
    - User Registration:
        - POST /api/auth/register
    - User Login:
        - POST /api/auth/login
    - User Logout:
        - POST /api/auth/logout
    - Token Refresh:
        - POST /api/auth/refresh
    - User Profile:
        - GET /api/auth/user
        - PUT /api/auth/user
        - DELETE /api/auth/user
    - Custom User Data:
        - GET /api/auth/user/data
        - PUT /api/auth/user/data
        - DELETE /api/auth/user/data
