import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { trackUpload } from "../../middleware/upload"
import { Track } from "../../schemas"
// @ts-ignore
import getMP3Duration from "get-mp3-duration"
import auth from "../../middleware/auth"
import * as fs from "fs"
import Ffmpeg from "fluent-ffmpeg"

const uploadDir = process.env.UPLOAD_DIR || "public"

function getDuration(fileLocation: any) {
	return new Promise((resolve, reject) => {
		Ffmpeg.ffprobe(fileLocation, (err, metadata) => {
			if (err) {
				return reject(err)
			}

			console.log(metadata.format)

			if (metadata.format.duration)
				return resolve(metadata.format.duration)

			reject("Nul og nix")
		})
	})
}

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [auth, trackUpload.single("file")],
			handler: async (request: Request, response: Response) => {
				const fileLocation =
					uploadDir + "/track/" + request.file?.filename

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

				track.save()

				response.status(200).json({
					status: "ok",
					response: track,
				})
			},
		},
	}
