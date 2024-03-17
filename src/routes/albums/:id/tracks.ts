import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Album, Track } from "../../../schemas"
import authenticate from "../../../middleware/auth"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const tracks = await Track.find({ album: request.params.id })
				.limit(
					request.query.limit
						? parseInt(request.query.limit as string)
						: 0
				)
				.skip(
					request.query.offset
						? parseInt(request.query.offset as string)
						: 0
				)

			if (!tracks)
				return response.status(400).json({
					status: "error",
					message: "No tracks found for this album",
				})

			response.status(200).json(tracks)
		},
	}
