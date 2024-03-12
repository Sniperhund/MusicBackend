import mongoose from "mongoose"

// User Schema
const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
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
	genre: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "genres",
		},
	],
})

export const Album = mongoose.model("Album", album)

// Artist Schema
const artist = new mongoose.Schema({
	name: String,
})

export const Artist = mongoose.model("Artist", artist)
