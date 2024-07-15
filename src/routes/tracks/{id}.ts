import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Track } from "../../schemas"
import auth from "../../middleware/auth"
import { upload } from "../../middleware/upload"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
				return response.status(400).json({
					status: "error",
					message: "Invalid id",
				})
			}

			const track = await Track.findById(request.params.id)
				.populate("album")
				.populate("artists")

			if (!track) {
				return response.status(404).json({
					status: "error",
					message: "Track not found",
				})
			}

			response.status(200).json({
				status: "ok",
				response: track,
			})
		},
	}
