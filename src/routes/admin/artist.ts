import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { artistCoverUpload } from "../../middleware/upload"
import { Artist } from "../../schemas"
import auth from "../../middleware/auth"
import cleanFile from "../../utils/cleanFile"

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [artistCoverUpload.single("file"), auth],
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

				if (!request.file) {
					cleanFile(fileLocation)
					return response.status(400).json({
						status: "error",
						message: "Cover is required",
					})
				}

				let artist = new Artist({
					name: request.body.name,
					cover: request.file?.filename,
				})

				await artist.save()

				response.status(201).json({
					status: "ok",
					response: artist,
				})
			},
		},
	}
