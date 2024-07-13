let request = require("supertest")
const axios = require("axios")

const url = "http://localhost:8000"

request = request(url)

let accessToken

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

		expect(response.body.message).toBe("Artist is required")
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

		expect(response.body.message).toBe("Invalid artist id")
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
