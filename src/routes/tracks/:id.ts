import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Track } from "../../schemas"
import authenticate from "../../middleware/auth"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const track = await Track.findById(request.params.id)
				.populate("album")
				.populate("artist")

			response.status(200).json(track)
		},
	}
