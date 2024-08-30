let request = require("supertest")
const axios = require("axios")

const url = "http://localhost:8000"

request = request(url)

let accessToken, verifyToken

beforeAll(async () => {
	try {
		await axios.get(url)
	} catch (error) {
		throw new Error("The server seems to be offline?")
	}

	await axios.get(url + "/admin/clear")

	let result

	try {
		result = await axios.post(url + "/auth/register", {
			name: "Test",
			email: "Test@example.com",
			password: "Test1234@",
		})
	} catch (error) {
		console.log(error.response.data)
	}

	accessToken = result.data.response.user.accessToken
	verifyToken = result.data.response.user.verifyToken
})

let artistId, genreId, albumId, trackId

describe("Admin", () => {
	test("POST /admin/artist - Missing authorization", async () => {
		const response = await request.post("/admin/artist").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("POST /admin/artist - Missing name", async () => {
		const response = await request
			.post("/admin/artist")
			.set("Authorization", accessToken)
			.attach("file", "test_data/image.png")
			.expect(400)

		expect(response.body.message).toBe("Name is required")
	})

	test("POST /admin/artist - Missing file", async () => {
		const response = await request
			.post("/admin/artist")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.expect(400)

		expect(response.body.message).toBe("Cover is required")
	})

	test("POST /admin/artist - Correct", async () => {
		const response = await request
			.post("/admin/artist")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.attach("file", "test_data/image.png")
			.expect(201)

		expect(response.body.response).toHaveProperty("_id")

		artistId = response.body.response._id
	})

	test("PUT /admin/artist - Missing authorization", async () => {
		const response = await request.put("/admin/artist").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("PUT /admin/artist - Missing id", async () => {
		const response = await request
			.put("/admin/artist")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("PUT /admin/artist - Wrong id", async () => {
		const response = await request
			.put("/admin/artist?id=66a3f710b092d8601ef11b79")
			.set("Authorization", accessToken)
			.expect(404)

		expect(response.body.message).toBe("Artist not found")
	})

	test("PUT /admin/artist - Correct", async () => {
		const response = await request
			.put("/admin/artist?id=" + artistId)
			.set("Authorization", accessToken)
			.field("name", "Test")
			.attach("file", "test_data/image.png")
			.expect(200)

		expect(response.body.status).toBe("ok")
	})

	test("POST /admin/genre - Missing authorization", async () => {
		const response = await request.post("/admin/genre").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("POST /admin/genre - Missing name", async () => {
		const response = await request
			.post("/admin/genre")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Name is required")
	})

	test("POST /admin/genre - Correct", async () => {
		const response = await request
			.post("/admin/genre")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.expect(201)

		expect(response.body.response).toHaveProperty("_id")

		genreId = response.body.response._id
	})

	test("PUT /admin/genre - Missing authorization", async () => {
		const response = await request.put("/admin/genre").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("PUT /admin/genre - Missing id", async () => {
		const response = await request
			.put("/admin/genre")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("PUT /admin/genre - Wrong id", async () => {
		const response = await request
			.put("/admin/genre?id=66a3f710b092d8601ef11b79")
			.set("Authorization", accessToken)
			.expect(404)

		expect(response.body.message).toBe("Genre not found")
	})

	test("PUT /admin/genre - Correct", async () => {
		const response = await request
			.put("/admin/genre?id=" + genreId)
			.set("Authorization", accessToken)
			.field("name", "Test")
			.expect(200)

		expect(response.body.status).toBe("ok")
	})

	test("POST /admin/genre - Duplicate", async () => {
		const response = await request
			.post("/admin/genre")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.expect(400)

		expect(response.body.message).toBe("Genre already exists")
	})

	test("POST /admin/album - Missing authorization", async () => {
		const response = await request.post("/admin/album").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("POST /admin/album - Missing name", async () => {
		const response = await request
			.post("/admin/album")
			.set("Authorization", accessToken)
			.field("artist", artistId)
			.attach("file", "test_data/image.png")
			.field("genres", [genreId])
			.expect(400)

		expect(response.body.message).toBe("Name is required")
	})

	test("POST /admin/album - Missing artist", async () => {
		const response = await request
			.post("/admin/album")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.attach("file", "test_data/image.png")
			.field("genres", [genreId])
			.expect(400)

		expect(response.body.message).toBe("Artist(s) are required")
	})

	test("POST /admin/album - Missing file", async () => {
		const response = await request
			.post("/admin/album")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.field("artist", artistId)
			.field("genres", [genreId])
			.expect(400)

		expect(response.body.message).toBe("Cover is required")
	})

	test("POST /admin/album - Missing genres", async () => {
		const response = await request
			.post("/admin/album")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.field("artist", artistId)
			.attach("file", "test_data/image.png")
			.expect(400)

		expect(response.body.message).toBe("Genres are required")
	})

	test("POST /admin/album - Correct", async () => {
		const response = await request
			.post("/admin/album")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.field("artist", artistId)
			.attach("file", "test_data/image.png")
			.field("genres", [genreId])
			.expect(201)

		expect(response.body.response).toHaveProperty("_id")

		albumId = response.body.response._id
	})

	test("PUT /admin/album - Missing authorization", async () => {
		const response = await request.put("/admin/album").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("PUT /admin/album - Missing id", async () => {
		const response = await request
			.put("/admin/album")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("PUT /admin/album - Wrong id", async () => {
		const response = await request
			.put("/admin/album?id=66a3f710b092d8601ef11b79")
			.set("Authorization", accessToken)
			.expect(404)

		expect(response.body.message).toBe("Album not found")
	})

	test("PUT /admin/album - Correct", async () => {
		const response = await request
			.put("/admin/album?id=" + albumId)
			.set("Authorization", accessToken)
			.field("name", "Test")
			.field("artist", artistId)
			.attach("file", "test_data/image.png")
			.field("genres", [genreId])
			.expect(200)

		expect(response.body.status).toBe("ok")
	})

	test("POST /admin/track - Missing authorization", async () => {
		const response = await request.post("/admin/track").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("POST /admin/track - Missing name", async () => {
		const response = await request
			.post("/admin/track")
			.set("Authorization", accessToken)
			.field("album", albumId)
			.field("artist", artistId)
			.attach("file", "test_data/audio.mp3")
			.expect(400)

		expect(response.body.message).toBe("Name is required")
	})

	test("POST /admin/track - Missing album", async () => {
		const response = await request
			.post("/admin/track")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.field("artist", artistId)
			.attach("file", "test_data/audio.mp3")
			.expect(400)

		expect(response.body.message).toBe("Invalid album id")
	})

	test("POST /admin/track - Missing artist", async () => {
		const response = await request
			.post("/admin/track")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.field("album", albumId)
			.attach("file", "test_data/audio.mp3")
			.expect(400)

		expect(response.body.message).toBe("Artist(s) are required")
	})

	test("POST /admin/track - Missing file", async () => {
		const response = await request
			.post("/admin/track")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.field("album", albumId)
			.field("artist", artistId)
			.expect(400)

		expect(response.body.message).toBe("File is required")
	})

	test("POST /admin/track - Correct", async () => {
		const response = await request
			.post("/admin/track")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.field("album", albumId)
			.field("artist", artistId)
			.attach("file", "test_data/audio.mp3")
			.expect(201)

		expect(response.body.response).toHaveProperty("_id")

		trackId = response.body.response._id
	})

	test("PUT /admin/track - Missing authorization", async () => {
		const response = await request.put("/admin/track").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("PUT /admin/track - Missing id", async () => {
		const response = await request
			.put("/admin/track")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("PUT /admin/track - Wrong id", async () => {
		const response = await request
			.put("/admin/track?id=66a3f710b092d8601ef11b79")
			.set("Authorization", accessToken)
			.expect(404)

		expect(response.body.message).toBe("Track not found")
	})

	test("PUT /admin/track - Correct", async () => {
		const response = await request
			.put("/admin/track?id=" + trackId)
			.set("Authorization", accessToken)
			.field("name", "Test")
			.field("album", albumId)
			.field("artist", artistId)
			.attach("file", "test_data/audio.mp3")
			.expect(200)

		expect(response.body.status).toBe("ok")
	})
})

describe("Albums", () => {
	test("GET /albums - Missing authorization", async () => {
		const response = await request.get("/albums").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /albums - Missing ids", async () => {
		const response = await request
			.get("/albums")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Ids are required")
	})

	test("GET /albums - Correct", async () => {
		const response = await request
			.get("/albums")
			.set("Authorization", accessToken)
			.field("ids", [albumId, albumId])
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /albums/:id - Missing authorization", async () => {
		const response = await request.get("/albums/" + albumId).expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /albums/:id - Missing id", async () => {
		const response = await request
			.get("/albums/1")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /albums/:id - Correct", async () => {
		const response = await request
			.get("/albums/" + albumId)
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response._id).toBe(albumId)
	})

	test("GET /albums/:id/random - Missing authorization", async () => {
		const response = await request
			.get("/albums/" + genreId + "/random")
			.expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /albums/:id/random - Missing id", async () => {
		const response = await request
			.get("/albums/1/random")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /albums/:id/random - Wrong limit type", async () => {
		const response = await request
			.get("/albums/" + genreId + "/random?limit=Test")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid limit")
	})

	test("GET /albums/:id/random - Correct", async () => {
		const response = await request
			.get("/albums/" + genreId + "/random")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /albums/:id/tracks - Missing authorization", async () => {
		const response = await request
			.get("/albums/" + albumId + "/tracks")
			.expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /albums/:id/tracks - Missing id", async () => {
		const response = await request
			.get("/albums/1/tracks")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /albums/:id/tracks - Correct limited to 1", async () => {
		const track = await request
			.post("/admin/track")
			.set("Authorization", accessToken)
			.field("name", "Test")
			.field("album", albumId)
			.field("artist", artistId)
			.attach("file", "test_data/audio.mp3")
			.expect(201)

		expect(track.body.response).toHaveProperty("_id")

		const response = await request
			.get("/albums/" + albumId + "/tracks?limit=1")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /albums/:id/tracks - Correct not limited", async () => {
		const response = await request
			.get("/albums/" + albumId + "/tracks")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(2)
	})
})

describe("All", () => {
	test("GET /all/albums - Missing authorization", async () => {
		const response = await request.get("/all/albums").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /all/albums - Correct", async () => {
		const response = await request
			.get("/all/albums")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /all/artists - Missing authorization", async () => {
		const response = await request.get("/all/artists").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /all/artists - Correct", async () => {
		const response = await request
			.get("/all/artists")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /all/genres - Missing authorization", async () => {
		const response = await request.get("/all/genres").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /all/genres - Correct", async () => {
		const response = await request
			.get("/all/genres")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /all/tracks - Missing authorization", async () => {
		const response = await request.get("/all/tracks").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /all/tracks - Correct", async () => {
		const response = await request
			.get("/all/tracks")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(2)
	})
})

describe("Artists", () => {
	test("GET /artists - Missing authorization", async () => {
		const response = await request.get("/artists").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /artists - Missing ids", async () => {
		const response = await request
			.get("/artists")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Ids are required")
	})

	test("GET /artists - Correct", async () => {
		const response = await request
			.get("/artists")
			.set("Authorization", accessToken)
			.field("ids", [artistId, artistId])
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /artists/:id - Missing authorization", async () => {
		const response = await request.get("/artists/" + artistId).expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /artists/:id - Missing id", async () => {
		const response = await request
			.get("/artists/1")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /artists/:id - Correct", async () => {
		const response = await request
			.get("/artists/" + artistId)
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response._id).toBe(artistId)
	})

	test("GET /artists/:id/tracks - Missing authorization", async () => {
		const response = await request
			.get("/artists/" + artistId + "/tracks")
			.expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /artists/:id/tracks - Missing id", async () => {
		const response = await request
			.get("/artists/1/tracks")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /artists/:id/tracks - Correct limited to 1", async () => {
		const response = await request
			.get("/artists/" + artistId + "/tracks?limit=1")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /artists/:id/tracks - Correct not limited", async () => {
		const response = await request
			.get("/artists/" + artistId + "/tracks")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(2)
	})

	test("GET /artists/:id/albums - Missing authorization", async () => {
		const response = await request
			.get("/artists/" + artistId + "/albums")
			.expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /artists/:id/albums - Missing id", async () => {
		const response = await request
			.get("/artists/1/albums")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /artists/:id/albums - Correct limited to 1", async () => {
		const response = await request
			.get("/artists/" + artistId + "/albums?limit=1")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /artists/:id/albums - Correct not limited", async () => {
		const response = await request
			.get("/artists/" + artistId + "/albums")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})
})

describe("Auth", () => {
	test("POST /auth/login - Not verified", async () => {
		const response = await request
			.post("/auth/login")
			.field("email", "Test@example.com")
			.field("password", "Test1234@")
			.expect(400)

		expect(response.body.message).toBe(
			"Sorry, you need to verify your email first"
		)
	})

	test("POST /auth/verify - Missing token", async () => {
		const response = await request.get("/auth/verify").expect(400)

		expect(response.body.message).toBe("Token is required")
	})

	test("POST /auth/verify - Invalid token", async () => {
		const response = await request.get("/auth/verify?q=Test").expect(400)

		expect(response.body.message).toBe("Invalid token")
	})

	test("POST /auth/verify - Correct", async () => {
		const response = await request
			.get("/auth/verify?q=" + verifyToken)
			.expect(200)

		expect(response.body.response.accessToken).toBeTruthy()

		accessToken = response.body.response.accessToken
	})

	test("POST /auth/verify - Already verified", async () => {
		const response = await request
			.get("/auth/verify?q=" + verifyToken)
			.expect(400)

		expect(response.body.message).toBe("User already verified")
	})

	test("POST /auth/login - Missing email", async () => {
		const response = await request
			.post("/auth/login")
			.field("password", "Test1234@")
			.expect(400)

		expect(response.body.message).toBe("Email is required")
	})

	test("POST /auth/login - Missing password", async () => {
		const response = await request
			.post("/auth/login")
			.field("email", "Test@example.com")
			.expect(400)

		expect(response.body.message).toBe("Password is required")
	})

	let refreshToken

	test("POST /auth/login - Correct", async () => {
		const response = await request
			.post("/auth/login")
			.field("email", "Test@example.com")
			.field("password", "Test1234@")
			.expect(200)

		expect(response.body.response.accessToken).toBeTruthy()

		accessToken = response.body.response.accessToken
		refreshToken = response.body.response.refreshToken
	})

	test("POST /auth/refresh - Missing token", async () => {
		const response = await request.post("/auth/refresh").expect(400)

		expect(response.body.message).toBe("Invalid refresh token")
	})

	test("POST /auth/refresh - Invalid token", async () => {
		const response = await request
			.post("/auth/refresh")
			.field("token", "Test")
			.expect(400)

		expect(response.body.message).toBe("Invalid refresh token")
	})

	test("POST /auth/refresh - Correct", async () => {
		const response = await request
			.post("/auth/refresh")
			.field("refreshToken", refreshToken)
			.expect(200)

		expect(response.body.response.accessToken).toBeTruthy()

		accessToken = response.body.response.accessToken
	})
})

describe("Genres", () => {
	test("GET /genres/random - Missing authorization", async () => {
		const response = await request.get("/genres/random").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /genres/random - Wrong limit type", async () => {
		const response = await request
			.get("/genres/random?limit=Test")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid limit")
	})

	test("GET /genres/random - Correct", async () => {
		const response = await request
			.get("/genres/random")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})
})

describe("Tracks", () => {
	test("GET /tracks - Missing authorization", async () => {
		const response = await request.get("/tracks").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /tracks - Missing ids", async () => {
		const response = await request
			.get("/tracks")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Ids are required")
	})

	test("GET /tracks - Correct", async () => {
		const response = await request
			.get("/tracks")
			.set("Authorization", accessToken)
			.field("ids", [trackId, trackId])
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /tracks/:id - Missing authorization", async () => {
		const response = await request.get("/tracks/" + trackId).expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /tracks/:id - Missing id", async () => {
		const response = await request
			.get("/tracks/1")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /tracks/:id - Correct", async () => {
		const response = await request
			.get("/tracks/" + trackId)
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response._id).toBe(trackId)
	})

	test("GET /tracks/:id/random - Missing authorization", async () => {
		const response = await request
			.get("/tracks/" + genreId + "/random")
			.expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /tracks/:id/random - Missing id", async () => {
		const response = await request
			.get("/tracks/1/random")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /tracks/:id/random - Wrong limit type", async () => {
		const response = await request
			.get("/tracks/" + genreId + "/random?limit=Test")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid limit")
	})

	test("GET /tracks/:id/random - Correct limited to 1", async () => {
		const response = await request
			.get("/tracks/" + genreId + "/random?limit=1")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /tracks/:id/random - Correct not limited", async () => {
		const response = await request
			.get("/tracks/" + genreId + "/random")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(2)
	})
})

describe("Lyrics", () => {
	let lyricsId

	test("POST /admin/lyrics - Missing authorization", async () => {
		const response = await request.post("/admin/lyrics").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("POST /admin/lyrics - Missing id", async () => {
		const response = await request
			.post("/admin/lyrics")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid song id")
	})

	test("POST /admin/lyrics - Missing lyrics", async () => {
		const response = await request
			.post("/admin/lyrics")
			.set("Authorization", accessToken)
			.field("songId", trackId)
			.field("synced", false)
			.expect(400)

		expect(response.body.message).toBe("Lyrics is required")
	})

	test("POST /admin/lyrics - Missing synced", async () => {
		const response = await request
			.post("/admin/lyrics")
			.set("Authorization", accessToken)
			.field("songId", trackId)
			.field("lyrics", "Test")
			.expect(400)

		expect(response.body.message).toBe("Synced is required")
	})

	test("POST /admin/lyrics - Correct", async () => {
		const response = await request
			.post("/admin/lyrics")
			.set("Authorization", accessToken)
			.field("songId", trackId)
			.field("lyrics", "Test")
			.field("synced", false)
			.expect(201)

		expect(response.body.response).toHaveProperty("_id")

		lyricsId = response.body.response._id
	})

	test("PUT /admin/lyrics - Missing authorization", async () => {
		const response = await request.put("/admin/lyrics").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("PUT /admin/lyrics - Missing id", async () => {
		const response = await request
			.put("/admin/lyrics")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("PUT /admin/lyrics - Wrong id", async () => {
		const response = await request
			.put("/admin/lyrics?id=66a3f710b092d8601ef11b79")
			.set("Authorization", accessToken)
			.expect(404)

		expect(response.body.message).toBe("Lyrics not found")
	})

	test("PUT /admin/lyrics - Correct", async () => {
		const response = await request
			.put("/admin/lyrics?id=" + trackId)
			.set("Authorization", accessToken)
			.field("lyrics", "[00:20.51] Synced test")
			.field("synced", true)
			.expect(200)

		expect(response.body.status).toBe("ok")
	})

	test("GET /tracks/:id/lyrics - Missing authorization", async () => {
		const response = await request
			.get("/tracks/" + trackId + "/lyrics")
			.expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /tracks/:id/lyrics - Missing id", async () => {
		const response = await request
			.get("/tracks/1/lyrics")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /tracks/:id/lyrics - Correct", async () => {
		const response = await request
			.get("/tracks/" + trackId + "/lyrics")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.lyrics).toBe("[00:20.51] Synced test")
	})
})

describe("User", () => {
	test("POST /user/password - Missing authorization", async () => {
		const response = await request.post("/user/password").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("POST /user/password - Missing old password", async () => {
		const response = await request
			.post("/user/password")
			.set("Authorization", accessToken)
			.field("newPassword", "Test4321@")
			.expect(400)

		expect(response.body.message).toBe("Old password is required")
	})

	test("POST /user/password - Missing new password", async () => {
		const response = await request
			.post("/user/password")
			.set("Authorization", accessToken)
			.field("oldPassword", "Test1234@")
			.expect(400)

		expect(response.body.message).toBe("New password is required")
	})

	test("POST /user/password - Wrong old password", async () => {
		const response = await request
			.post("/user/password")
			.set("Authorization", accessToken)
			.field("oldPassword", "Test4321@")
			.field("newPassword", "Test1234@")
			.expect(400)

		expect(response.body.message).toBe("Password is incorrect")
	})

	test("POST /user/password - Weak new password", async () => {
		const response = await request
			.post("/user/password")
			.set("Authorization", accessToken)
			.field("oldPassword", "Test1234@")
			.field("newPassword", "test")
			.expect(400)

		expect(response.body.message).toBe("New password is too weak")
	})

	test("POST /user/password - Same new password", async () => {
		const response = await request
			.post("/user/password")
			.set("Authorization", accessToken)
			.field("oldPassword", "Test1234@")
			.field("newPassword", "Test1234@")
			.expect(400)

		expect(response.body.message).toBe(
			"New password must be different from old password"
		)
	})

	test("POST /user/password - Correct", async () => {
		const response = await request
			.post("/user/password")
			.set("Authorization", accessToken)
			.field("oldPassword", "Test1234@")
			.field("newPassword", "Test4321@")
			.expect(200)

		expect(response.body.response.refreshToken).toBeTruthy()

		const newLogin = await request
			.post("/auth/login")
			.field("email", "Test@example.com")
			.field("password", "Test4321@")
			.expect(200)

		expect(newLogin.body.response.accessToken).toBeTruthy()

		accessToken = newLogin.body.response.accessToken
	})

	test("GET /user - Missing authorization", async () => {
		const response = await request.get("/user").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /user - Correct", async () => {
		const response = await request
			.get("/user")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response._id).toBeTruthy()
	})

	test("PUT /user/tracks - Missing authorization", async () => {
		const response = await request.put("/user/tracks").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("PUT /user/tracks - Missing ids", async () => {
		const response = await request
			.put("/user/tracks")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Id(s) are required")
	})

	test("PUT /user/tracks - Correct", async () => {
		const response = await request
			.put("/user/tracks")
			.set("Authorization", accessToken)
			.field("id", trackId)
			.expect(200)

		expect(response.body.status).toBe("ok")
	})

	test("PUT /user/tracks - Duplicate id", async () => {
		const response = await request
			.put("/user/tracks")
			.set("Authorization", accessToken)
			.field("id", trackId)
			.expect(200)

		expect(response.body.status).toBe("ok")

		const user = await request
			.get("/user/tracks")
			.set("Authorization", accessToken)
			.expect(200)

		expect(user.body.response.length).toBe(1)
	})

	test("GET /user/tracks - Missing authorization", async () => {
		const response = await request.get("/user/tracks").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /user/tracks - Correct", async () => {
		const response = await request
			.get("/user/tracks")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /user/albums - Missing authorization", async () => {
		const response = await request.get("/user/albums").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /user/albums - Correct", async () => {
		const response = await request
			.get("/user/albums")
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response.length).toBe(1)
	})

	test("GET /user/tracks/contains - Missing authorization", async () => {
		const response = await request.get("/user/tracks/contains").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /user/tracks/contains - Missing id", async () => {
		const response = await request
			.get("/user/tracks/contains")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /user/tracks/contains", async () => {
		const response = await request
			.get("/user/tracks/contains?id=" + trackId)
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response).toBe(true)
	})

	test("GET /user/albums/contains - Missing authorization", async () => {
		const response = await request.get("/user/albums/contains").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("GET /user/albums/contains - Missing id", async () => {
		const response = await request
			.get("/user/albums/contains")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Invalid id")
	})

	test("GET /user/albums/contains - Correct", async () => {
		const response = await request
			.get("/user/albums/contains?id=" + albumId)
			.set("Authorization", accessToken)
			.expect(200)

		expect(response.body.response).toBe(true)
	})

	test("DELETE /user/tracks - Missing authorization", async () => {
		const response = await request.delete("/user/tracks").expect(401)

		expect(response.body.message).toBe("Unauthorized")
	})

	test("DELETE /user/tracks - Missing ids", async () => {
		const response = await request
			.delete("/user/tracks")
			.set("Authorization", accessToken)
			.expect(400)

		expect(response.body.message).toBe("Id(s) are required")
	})

	test("DELETE /user/tracks - Correct", async () => {
		const response = await request
			.delete("/user/tracks")
			.set("Authorization", accessToken)
			.field("id", trackId)
			.expect(200)

		expect(response.body.status).toBe("ok")

		const user = await request
			.get("/user/tracks")
			.set("Authorization", accessToken)
			.expect(200)

		expect(user.body.response.length).toBe(0)
	})
})
