import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Track } from "../../schemas"

export default (express: Application) =>
	<Resource>{
		get: async (request: Request, response: Response) => {
			try {
				if (!request.body.ids) {
					return response
						.status(422)
						.json({ message: "ids is required" })
				}

				const tracks = await Track.find({
					_id: { $in: request.body.ids },
				})
					.populate("album")
					.populate("artist")
				response.status(200).json(tracks)
			} catch (error) {
				if (typeof error === "object" && error && "message" in error) {
					return response.status(500).json({ message: error.message })
				} else {
					return response
						.status(500)
						.json({ message: "An unknown error occurred" })
				}
			}
		},
	}
