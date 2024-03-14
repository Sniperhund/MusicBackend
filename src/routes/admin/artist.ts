import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { artistCoverUpload } from "../../middleware/upload"
import { Artist } from "../../schemas"

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [artistCoverUpload.single("file")],
			handler: (request: Request, response: Response) => {
				let artist = new Artist({
					name: request.body.name,
					cover: request.file?.filename,
				})

				artist.save()

				response.status(200).json({
					status: "ok",
					response: artist,
				})
			},
		},
	}
