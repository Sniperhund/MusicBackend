import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Track } from "../../schemas"
import auth from "../../middleware/auth"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			const tracks = await Track.find({})
				.populate("artist")
				.populate("album")

			if (!tracks) {
				return response.status(404).json({
					status: "error",
					message: "Tracks not found",
				})
			}

			return response.status(200).json({
				status: "ok",
				response: tracks,
			})
		},
	}
