# Music Backend

This is a backend (database, file storage, authentication) for my music website

## Paths

1. Database
    - Read Data:
        - GET /api/database/{table}
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
