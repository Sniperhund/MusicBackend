import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Genre } from "../../schemas"
import auth from "../../middleware/auth"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			const genres = await Genre.find({})

			if (!genres) {
				return response.status(404).json({
					status: "error",
					message: "Genres not found",
				})
			}

			return response.status(200).json({
				status: "ok",
				response: genres,
			})
		},
	}
