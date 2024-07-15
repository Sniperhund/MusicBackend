import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { albumCoverUpload } from "../../middleware/upload"
import { Album } from "../../schemas"
import auth from "../../middleware/auth"
import cleanFile from "../../utils/cleanFile"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [albumCoverUpload.single("file"), auth],
			handler: async (request: Request, response: Response) => {
				if (request.body.user.role != "admin") {
					return response.status(403).json({
						status: "error",
						message: "Unauthorized",
					})
				}

				const fileLocation = request.file?.path as string

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
					return response.status(400).json({
						status: "error",
						message: "Artist(s) are required",
					})
				}

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
	}
