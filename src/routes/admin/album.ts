import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { albumCoverUpload } from "../../middleware/upload"
import { Album, Track } from "../../schemas"
import auth from "../../middleware/auth"
import cleanFile from "../../utils/cleanFile"
import mongoose from "mongoose"
import getFilePath from "../../utils/getFilePath"

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [albumCoverUpload.single("file"), auth],
			handler: async (request: Request, response: Response) => {
				const fileLocation = request.file?.path as string

				if (request.body.user.role != "admin") {
					cleanFile(fileLocation)

					return response.status(403).json({
						status: "error",
						message: "Unauthorized",
					})
				}

				if (!request.body.name) {
					cleanFile(fileLocation)

					return response.status(400).json({
						status: "error",
						message: "Name is required",
					})
				}

				let artists = request.body.artists
				const artist = request.body.artist

				if (!(artists || artist)) {
					cleanFile(fileLocation)

					return response.status(400).json({
						status: "error",
						message: "Artist(s) are required",
					})
				}

				if (artists) {
					if (!Array.isArray(artists)) {
						cleanFile(fileLocation)

						return response.status(400).json({
							status: "error",
							message: "Artists must be an array",
						})
					}

					for (let id of artists) {
						if (!mongoose.Types.ObjectId.isValid(id)) {
							cleanFile(fileLocation)

							return response.status(400).json({
								status: "error",
								message: "Invalid artist",
							})
						}
					}
				} else {
					if (!mongoose.Types.ObjectId.isValid(artist)) {
						cleanFile(fileLocation)

						return response.status(400).json({
							status: "error",
							message: "Invalid artist",
						})
					}

					artists = [artist]
				}

				if (!request.file) {
					cleanFile(fileLocation)

					return response.status(400).json({
						status: "error",
						message: "Cover is required",
					})
				}

				if (!request.body.genres) {
					cleanFile(fileLocation)

					return response.status(400).json({
						status: "error",
						message: "Genres are required",
					})
				}

				let album = new Album({
					name: request.body.name,
					artists: artists,
					cover: request.file?.filename,
					genres: request.body.genres,
				})

				await album.save()

				response.status(201).json({
					status: "ok",
					response: album,
				})
			},
		},
		put: {
			middleware: [albumCoverUpload.single("file"), auth],
			handler: async (request: Request, response: Response) => {
				const newFileLocation = request.file?.path as string

				if (request.body.user.role != "admin") {
					cleanFile(newFileLocation)

					return response.status(403).json({
						status: "error",
						message: "Unauthorized",
					})
				}

				if (
					!mongoose.Types.ObjectId.isValid(request.query.id as string)
				) {
					cleanFile(newFileLocation)

					return response.status(400).json({
						status: "error",
						message: "Invalid id",
					})
				}

				const album = await Album.findById(request.query.id)

				if (!album) {
					cleanFile(newFileLocation)

					return response.status(404).json({
						status: "error",
						message: "Album not found",
					})
				}

				if (newFileLocation) {
					const oldFileLocation = album.cover

					album.cover = request.file?.filename

					cleanFile(getFilePath("album", oldFileLocation as string))
				}

				if (request.body.name) album.name = request.body.name

				let artists = request.body.artists
				const artist = request.body.artist

				if (artists) {
					if (!Array.isArray(artists)) {
						return response.status(400).json({
							status: "error",
							message: "Artists must be an array",
						})
					}

					for (let id of artists) {
						if (!mongoose.Types.ObjectId.isValid(id)) {
							return response.status(400).json({
								status: "error",
								message: "Invalid artist",
							})
						}
					}
				} else {
					if (!mongoose.Types.ObjectId.isValid(artist)) {
						return response.status(400).json({
							status: "error",
							message: "Invalid artist",
						})
					}

					artists = [artist]
				}

				if (artists) album.artists = artists

				if (request.body.genres) album.genres = request.body.genres

				await album.save()

				const updatedAlbum = await Album.findById(album._id)
					.populate("artists")
					.populate("genres")

				response.status(200).json({
					status: "ok",
					response: updatedAlbum,
				})
			},
		},
		delete: {
			middleware: [auth],
			handler: async (request: Request, response: Response) => {
				if (request.body.user.role != "admin") {
					return response.status(403).json({
						status: "error",
						message: "Unauthorized",
					})
				}

				if (
					!mongoose.Types.ObjectId.isValid(request.query.id as string)
				) {
					return response.status(400).json({
						status: "error",
						message: "Invalid id",
					})
				}

				const album = await Album.findById(request.query.id)

				if (!album) {
					return response.status(404).json({
						status: "error",
						message: "Album not found",
					})
				}

				cleanFile(getFilePath("album", album.cover as string))

				await Album.findByIdAndDelete(album._id)

				const tracks = await Track.find({ album: album._id })

				for (const track of tracks) {
					cleanFile(getFilePath("track", track.audioFile as string))
				}

				await Track.deleteMany({ album: album._id })

				response.status(200).json({
					status: "ok",
					message: "Album deleted",
				})
			},
		},
	}
