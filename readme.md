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
    - Get User's Saved Albums: // All albums where the user has at least one track saved from
        - GET /user/albums
            - limit: integer
            - offset: integer (default 0)
    - Check User's Saved Albums:
        - GET /user/albums/contains
            - body:
                - ids: array of strings
5. Artist (All request require authentication token):
    - Get Artist's Albums:
        - GET /artist/:id/albums
            - limit: integer
            - offset: integer (default 0)
6. Authentication:
    - User Profile:
        - GET /auth/user
        - PUT /auth/user
        - DELETE /auth/user
    - User Verify:
        - GET /auth/verify
            - q: string
