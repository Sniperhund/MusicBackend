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

export const Genres = mongoose.model("Genres", genres)

// Songs Schema
const songs = new mongoose.Schema({
	name: String,
	album: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Album",
	},
	audioFile: String,
})

export const Songs = mongoose.model("Songs", songs)

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
