import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Album, Artist, Track } from "../../../schemas"
import authenticate from "../../../middleware/auth"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			let tracks: any[] = []

			//! BUG: It doesn't work with filters yet.
			const count = await Track.countDocuments({
				genre: request.params.id,
			})

			const num: number = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			for (let i = 0; i < num; i++) {
				let random = Math.floor(Math.random() * count)

				tracks.push(await Track.findOne().skip(random))
			}

			response.status(200).json(tracks)
		},
	}
