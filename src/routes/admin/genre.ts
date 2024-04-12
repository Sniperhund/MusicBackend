import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { Genre } from "../../schemas"

export default (express: Application) =>
	<Resource>{
		post: {
			handler: (request: Request, response: Response) => {
				let genre = new Genre({
					name: request.body.name,
				})

				genre.save()

				response.status(200).json({
					status: "ok",
					response: genre,
				})
			},
		},
	}
