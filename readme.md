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

All body's is application/json

3. Playlist (All request require authentication token):
    - Get Playlist:
        - GET /playlist/:id
    - Change Playlist Details:
        - PUT /playlist/:id
            - body:
                - name: string
                - public: boolean
                - description: string
    - Get Playlist Tracks:
        - GET /playlist/:id/tracks
            - limit: integer
            - offset: integer (default 0)
    - Update Playlist Tracks:
        - PUT /playlist/:id/tracks
            - body:
                - ids: array of strings
    - Add Items to Playlist:
        - POST /playlist/:id/tracks
            - body:
                - ids: array of strings
    - Remove Items from Playlist:
        - DELETE /playlist/:id/tracks
            - body:
                - ids: array of strings
    - Get Current User's Playlists:
        - GET /user/playlists
            - limit: integer
            - offset: integer (default 0)
    - Get User's Playlists (allows only if public):
        - GET /user/:id/playlists
            - limit: integer
            - offset: integer (default 0)
    - Create Playlist:
        - POST /user/playlist
            - body:
                - name: string
                - public: boolean
                - description: string
4. Album (All request reqyure authentication token):
    - Get Album:
        - GET /album/:id
    - Get Albums:
        - GET /albums/
            - body:
                - ids: array of strings
    - Get Album's Tracks:
        - GET /album/:id/tracks
            - limit: integer
            - offset: integer (default 0)
    - Get User's Saved Albums:
        - GET /user/albums
            - limit: integer
            - offset: integer (default 0)
    - Save Albums for Current User:
        - PUT /user/albums
            - body:
                - ids: array of strings
    - Remove Albums from Current User:
        - DELETE /user/albums
            - body:
                - ids: array of strings
    - Check User's Saved Albums:
        - GET /user/albums/contains
            - body:
                - ids: array of strings
5. Artist (All request require authentication token):
    - Get Artist:
        - GET /artist/:id
    - Get Several Artists:
        - GET /artists/
            - body:
                - ids: array of strings
    - Get Artist's Albums:
        - GET /artist/:id/albums
            - limit: integer
            - offset: integer (default 0)
6. Authentication:
    - User Registration:
        - POST /auth/register
            - body:
                - email: string
                - password: string
                - name: string
    - User Login:
        - POST /auth/login
            - body:
                - email: string
                - password: string
    - Token Refresh:
        - POST /auth/refresh
            - body:
                - refreshToken: string
    - User Profile:
        - GET /auth/user
        - PUT /auth/user
        - DELETE /auth/user
    - User Verify:
        - GET /auth/verify
            - q: string
