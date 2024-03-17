import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Artist } from "../../schemas"
import authenticate from "../../middleware/auth"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const artist = await Artist.findById(request.params.id)

			response.status(200).json(artist)
		},
	}
