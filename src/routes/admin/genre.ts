import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { Genre } from "../../schemas"
import auth from "../../middleware/auth"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [upload.none(), auth],
			handler: async (request: Request, response: Response) => {
				if (!request.body.name) {
					return response.status(400).json({
						status: "error",
						message: "Name is required",
					})
				}

				if (request.body.user.role != "admin") {
					return response.status(401).json({
						status: "error",
						message: "Unauthorized",
					})
				}

				let genre = new Genre({
					name: request.body.name,
				})

				await genre.save()

				response.status(201).json({
					status: "ok",
					response: genre,
				})
			},
		},
	}
