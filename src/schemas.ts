import mongoose from "mongoose"

// User Schema
const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user",
	},
	accessToken: String,
	accessTokenExpire: {
		type: Date,
		default: () => Date.now() + 60 * 60 * 24 * 7 * 1000, // 7 days
	},
	refreshToken: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	verifyToken: String,
	verified: {
		type: Boolean,
		default: false,
	},
})

export const User = mongoose.model("User", userSchema)

// Genres Schema
const genres = new mongoose.Schema({
	name: String,
})

export const Genre = mongoose.model("Genre", genres)

// Track Schema
const track = new mongoose.Schema({
	name: String,
	album: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Album",
	},
	artist: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Artist",
	},
	audioFile: String,
})

export const Track = mongoose.model("Track", track)

// Album Schema
const album = new mongoose.Schema({
	name: String,
	artist: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "artist",
	},
	cover: String,
})

export const Album = mongoose.model("Album", album)

// Artist Schema
const artist = new mongoose.Schema({
	name: String,
	cover: String,
})

export const Artist = mongoose.model("Artist", artist)
