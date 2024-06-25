import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Album } from "../../schemas"
import authenticate from "../../middleware/auth"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const album = await Album.findById(request.params.id).populate(
				"artist"
			)

			response.status(200).json(album)
		},
	}
