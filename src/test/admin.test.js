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

	const result = await axios.post(url + "/auth/register", {
		name: "Test",
		email: "Test",
		password: "Test",
	})

	accessToken = result.data.user.accessToken
})

let artistId, genreId, albumId

describe("Admin", () => {
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
	})
})

describe("Albums", () => {
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
})
