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
			middleware: [auth, trackUpload.single("file")],
			handler: async (request: Request, response: Response) => {
				try {
					const fileLocation =
						uploadDir + "track/" + request.file?.filename

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

					if (!mongoose.Types.ObjectId.isValid(request.body.artist)) {
						cleanFile(fileLocation)
						return response.status(400).json({
							status: "error",
							message: "Invalid artist id",
						})
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
						artist: request.body.artist,
						audioFile: request.file?.filename,
						durationInSeconds: duration,
					})

					await track.save()

					response.status(200).json({
						status: "ok",
						response: track,
					})
				} catch (error: any) {
					if (error) {
						const id = logError(error.message)

						const fileLocation =
							uploadDir + "track/" + request.file?.filename

						cleanFile(fileLocation)

						return response.status(500).json({
							status: "error",
							errorId: id,
						})
					}

					return response.status(500).json({
						status: "error",
					})
				}
			},
		},
	}
