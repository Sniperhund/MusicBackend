import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { albumCoverUpload } from "../../middleware/upload"
import { Album } from "../../schemas"

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [albumCoverUpload.single("file")],
			handler: (request: Request, response: Response) => {
				let album = new Album({
					name: request.body.name,
					artist: request.body.artist,
					cover: request.file?.filename,
				})

				album.save()

				response.status(200).json({
					status: "ok",
					response: album,
				})
			},
		},
	}
