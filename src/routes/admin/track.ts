import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { trackUpload } from "../../middleware/upload"
import { Track } from "../../schemas"
// @ts-ignore
import getMP3Duration from "get-mp3-duration"
import auth from "../../middleware/auth"
import * as fs from "fs"

const uploadDir = process.env.UPLOAD_DIR || "public"

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [auth, trackUpload.single("file")],
			handler: (request: Request, response: Response) => {
				const fileLocation =
					uploadDir + "/track/" + request.file?.filename

				const buffer = fs.readFileSync(fileLocation)
				const duration = Math.floor(getMP3Duration(buffer) / 1000)

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
