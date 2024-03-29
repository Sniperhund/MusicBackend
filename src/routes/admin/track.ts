import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { trackUpload } from "../../middleware/upload"
import { Track } from "../../schemas"

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [trackUpload.single("file")],
			handler: (request: Request, response: Response) => {
				let track = new Track({
					name: request.body.name,
					album: request.body.album,
					artist: request.body.artist,
					audioFile: request.file?.filename,
				})

				track.save()

				response.status(200).json({
					status: "ok",
					response: track,
				})
			},
		},
	}
