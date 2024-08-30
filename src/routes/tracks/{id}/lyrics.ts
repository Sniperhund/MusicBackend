import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Track, Genre, Lyrics } from "../../../schemas"
import auth from "../../../middleware/auth"
import mongoose from "mongoose"
import { upload } from "../../../middleware/upload"

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

			const trackId = request.params.id

			const lyrics = await Lyrics.findOne({ songId: trackId })

			if (!lyrics) {
				return response.status(404).json({
					status: "error",
					message: "Lyrics not found",
				})
			}

			response.status(200).json({
				status: "ok",
				response: lyrics,
			})
		},
	}
