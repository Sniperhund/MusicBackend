import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { trackUpload } from "../../middleware/upload"
import { Track } from "../../schemas"
import auth from "../../middleware/auth"
import Ffmpeg from "fluent-ffmpeg"
import cleanFile from "../../utils/cleanFile"
import mongoose from "mongoose"
import logError from "../../utils/logError"

const uploadDir = process.env.UPLOAD_DIR || "public"

function getDuration(fileLocation: any) {
	return new Promise((resolve, reject) => {
		Ffmpeg.ffprobe(fileLocation, (err, metadata) => {
			if (err) {
				return reject(err)
			}

			if (metadata.format.duration)
				return resolve(metadata.format.duration)

			reject(0)
		})
	})
}

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [trackUpload.single("file"), auth],
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

				if (!mongoose.Types.ObjectId.isValid(request.body.album)) {
					cleanFile(fileLocation)

					return response.status(400).json({
						status: "error",
						message: "Invalid album id",
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
						message: "File is required",
					})
				}

				let duration = Math.floor(
					(await getDuration(fileLocation)) as number
				)

				let track = new Track({
					name: request.body.name,
					album: request.body.album,
					artists: artists,
					audioFile: request.file?.filename,
					durationInSeconds: duration,
				})

				await track.save()

				response.status(201).json({
					status: "ok",
					response: track,
				})
			},
		},
	}
